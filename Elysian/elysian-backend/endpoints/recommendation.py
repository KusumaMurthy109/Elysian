from flask import Flask, request, jsonify, Blueprint
from utils.next_city_recommendation import encode_user_inputs, get_user_embedding, get_user_feedback, to_indices, adjust_user_embedding, next_city


recommendation_bp = Blueprint("recommendation", __name__) # Create a Blueprint route for this file so that app.py can call it.

@recommendation_bp.post("/next_city")
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
        city = next_city(user_vec, liked_idx, disliked_idx)
        return jsonify({"city": city}) # Give a JSON as a POST of the next city.

    except Exception as e:
        return jsonify({"error": str(e)}), 500