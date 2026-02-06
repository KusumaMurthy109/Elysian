from flask import Flask, request, jsonify
import numpy as np
import pandas as pd
import tensorflow as tf
import joblib
from numpy.linalg import norm
import firebase_admin
from firebase_admin import credentials, firestore
import os
import json

app = Flask(__name__)

# ---------------------------------------------------------
# Firebase init
# ---------------------------------------------------------

service_account_info = json.loads(os.environ["FIREBASE_SERVICE_ACCOUNT"])

cred = credentials.Certificate(service_account_info)
firebase_admin.initialize_app(cred)
db = firestore.client()


# ---------------------------------------------------------
# Load encoders
# ---------------------------------------------------------
le_origin = joblib.load("le_origin.pkl")
le_fav = joblib.load("le_fav.pkl")
mlbs = joblib.load("mlbs.pkl")   # dict of MultiLabelBinarizers

# ---------------------------------------------------------
# Load city data + precomputed embeddings
# ---------------------------------------------------------
cities_df = pd.read_csv("../../Datasets/cities.csv")
city_vectors = np.load("city_vectors.npy")   # shape: (num_cities, embedding_dim)

# Map city_id -> index in cities_df / city_vectors
city_id_to_idx = {
    row["city_id"]: idx
    for idx, row in cities_df.iterrows()
}


# ---------------------------------------------------------
# Load user-only TFLite model
# ---------------------------------------------------------
interpreter = tf.lite.Interpreter(model_path="user_encoder.tflite")
interpreter.allocate_tensors()

input_details = interpreter.get_input_details()

output_details = interpreter.get_output_details()

U_MULTI_IDX = 0
U_ORIGIN_IDX = 1
U_FAV_IDX = 2


# ---------------------------------------------------------
# Helper: Encode user profile into model-ready inputs
# ---------------------------------------------------------
def encode_user_inputs(data):
    # Encode origin country using the pickled encoded origin country file.
    origin_enc = float(le_origin.transform([data["origin_country"]])[0])

    # Encode favorite country visited using the pickled encoded favorite country file.
    fav_enc = float(le_fav.transform([data["favorite_country_visited"]])[0])

    # Encode multi-hot vector.
    multi_hot_parts = []
    # Go through each question that is multi-select.
    for feature in ["vacation_types", "seasons", "budget", "place_type"]:
        values = data.get(feature, [])
        mlb = mlbs[feature] # Encode the feature based on the MultiLabelBinarizer file.
        encoded = mlb.transform([values])[0]
        multi_hot_parts.append(encoded) # Add this to the encoded multi hot questions.

    multi_hot = np.concatenate(multi_hot_parts).astype(np.float32) # Change as a np, which is what the model expects.
    # print("User multi-hot length:", len(multi_hot))


    return origin_enc, fav_enc, multi_hot


# ---------------------------------------------------------
# Helper: Run user encoder TFLite model
# ---------------------------------------------------------
def get_user_embedding(origin_enc, fav_enc, multi_hot):
    # Set the input details that the user tower needs.
    #ASK: Isn't the order different in the model code vs how we pass it in here?
    # There was an error when we did it another way, so we changed it to use this order but it doesn't make sense.
    interpreter.set_tensor(input_details[U_MULTI_IDX]["index"], np.array([multi_hot], dtype=np.float32)) # Set the multi hot input.
    interpreter.set_tensor(input_details[U_ORIGIN_IDX]["index"], np.array([[origin_enc]], dtype=np.float32)) # Set the origin country input.
    interpreter.set_tensor(input_details[U_FAV_IDX]["index"], np.array([[fav_enc]], dtype=np.float32)) # Set the favorite country input.

    # Given the encoded user inputs, invoke the model to get the embedded user inputs.
    interpreter.invoke()

    # Output is the user embedding vector
    user_vec = interpreter.get_tensor(output_details[0]["index"])[0]
    return user_vec

# ---------------------------------------------------------
# Firebase helpers: likes/dislikes
# ---------------------------------------------------------
def get_user_feedback(user_id):
    fav_doc = db.collection("userFavorites").document(user_id).get() # Get the favorite cities of the user.
    dislike_doc = db.collection("userDislikes").document(user_id).get() # Get the disliked cities of the user.

    liked = list(fav_doc.to_dict().keys()) if fav_doc.exists else [] # Save as a dictionary.
    disliked = list(dislike_doc.to_dict().keys()) if dislike_doc.exists else [] # Save as a dictionary.

    return liked, disliked

def adjust_user_embedding(user_vec, liked_idx, disliked_idx, lr=0.1):
    if liked_idx:
        liked_vecs = city_vectors[liked_idx] # Get the city vector of the liked city.
        user_vec += lr * np.mean(liked_vecs, axis=0) # Add the mean of the liked city to the user vector to give more weight to similar cities.

    if disliked_idx:
        disliked_vecs = city_vectors[disliked_idx] # Get the city vector of the disliked city.
        user_vec -= lr * np.mean(disliked_vecs, axis=0) # Subtract the mean of the disliked city to the user vector to give less weight to similar cities.

    # Normalize to keep vector stable
    user_vec = user_vec / (np.linalg.norm(user_vec) + 1e-8)
    return user_vec


def to_indices(city_ids):
    return [city_id_to_idx[cid] for cid in city_ids if cid in city_id_to_idx]

# ---------------------------------------------------------
# Similarity + ranking
# ---------------------------------------------------------
def cosine(a, b):
    return np.dot(a, b) / (norm(a) * norm(b) + 1e-8)


def similarity_to_group(city_vec, group_idx):
    if not group_idx:
        return 0.0
    # Get the cosine similarity of a city vector compared to the group.
    sims = [cosine(city_vec, city_vectors[i]) for i in group_idx]
    return float(np.mean(sims))


ALPHA = 1.0
BETA = 0.7
GAMMA = 0.7


def get_dynamic_scores(user_vec, user_id):
    # Get the liked and disliked cities and convert them to their corresponding city vector.
    liked_ids, disliked_ids = get_user_feedback(user_id)
    liked_idx = to_indices(liked_ids)
    disliked_idx = to_indices(disliked_ids)

    base_scores = city_vectors @ user_vec  # From the modified user vector, get the similarity scores as the base score.

    final_scores = []
    for i, city_vec in enumerate(city_vectors):
        # Get the cosine similarity of a single city vector and the group of liked city vectors.
        sim_liked = similarity_to_group(city_vec, liked_idx)
        # Get the cosine similarity of a single city vector and the group of disliked city vectors.
        sim_disliked = similarity_to_group(city_vec, disliked_idx)
        # Now, recompute the scores to keep the base score weight, but also the liked and disliked weights.
        score = (
            ALPHA * base_scores[i] +
            BETA * sim_liked -
            GAMMA * sim_disliked
        )
        final_scores.append(score) # Keep a list of all the scores

    return np.array(final_scores), liked_idx, disliked_idx
def next_city(user_vec, user_id):
    # Gets the new scores based on the new liked/disliked cities.
    scores, liked_idx, disliked_idx = get_dynamic_scores(user_vec, user_id)

    # Exclude already swiped cities
    seen = set(liked_idx + disliked_idx)
    for idx in seen:
        scores[idx] = -1e9  # effectively remove

    next_idx = int(np.argmax(scores)) # The next city is the one with the highest score.
    row = cities_df.iloc[next_idx] # Get the corresponding row of that city.

    return {
        "city_id": row["city_id"],
        "city_name": row["city_name"],
        "country": row["country"],
        "score": float(scores[next_idx])
    } # Return the city recommendation in format.


# ---------------------------------------------------------
# Recommendation endpoint
# ---------------------------------------------------------
@app.route("/recommend", methods=["POST"])
def recommend():
    try:
        data = request.get_json() # The data is the fetched user answers during profile setup.

        # Encode user answers
        # Get the encoded integer version of each single select answer and one for the multi-hot answers.
        origin_enc, fav_enc, multi_hot = encode_user_inputs(data)

        # Get user embedding
        # Invoke the model to get the embedding of the user using the user tower.
        user_vec = get_user_embedding(origin_enc, fav_enc, multi_hot)

        # Compute similarity scores
        # Now that the user vector can be compared, compute the score for each city compared to the user vector.
        scores = city_vectors @ user_vec

        # Here, get the top 5 of the cities with the highest scores.
        k = data.get("k", 5)
        top_idx = scores.argsort()[::-1][:k] # Sort from high to low.

        results = []
        for idx in top_idx: # Go through each index.
            row = cities_df.iloc[idx] # Get the row associated with the index.
            results.append({
                "city_id": row["city_id"],
                "city_name": row["city_name"],
                "country": row["country"],
                "score": float(scores[idx])
            }) # Append the recommended city in this format.

        return jsonify({"recommendations": results}) # Give back a JSON as a POST.

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/next_city", methods=["POST"])
def api_next_city():
    try:
        data = request.get_json() # The data given is the user profile.
        user_id = data["user_id"]  # Get the user id given from the data.

        # Same encoding as /recommend
        origin_enc, fav_enc, multi_hot = encode_user_inputs(data) # First encode the data.
        user_vec = get_user_embedding(origin_enc, fav_enc, multi_hot) # Then, embedd the encoded vector.
        # Get the dictionaries of the user favorite and disliked cities from Firebase.
        liked_ids, disliked_ids = get_user_feedback(user_id)
        # Get the corresponding indices of the favorited and disliked cities.
        liked_idx = to_indices(liked_ids)
        disliked_idx = to_indices(disliked_ids)
        # Now, change the initial user vector taken from the model to adjust based on the city swipes.
        user_vec = adjust_user_embedding(user_vec, liked_idx, disliked_idx)
        # After the user vector is adjusted, get the next best city.
        city = next_city(user_vec, user_id)
        return jsonify({"city": city}) # Give a JSON as a POST of the next city.

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/")
def home():
    return jsonify({"status": "Travel recommender backend running"})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5003)