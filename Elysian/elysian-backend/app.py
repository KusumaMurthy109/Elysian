"""
File: app.py
Function: Runs the Flask backend for city recommendations.

This API takes a user profile, builds a user embedding using a TFLite model,
and returns the next best city recommendation while factoring in the users
likes and dislikes stored in Firebase. It also includes a helper endpoint
to fetch a city image for the app.
"""

from flask import Flask, request, jsonify
from flask import Flask
from endpoints.recommendation import recommendation_bp
from endpoints.city_image import city_image_bp
from endpoints.rating_posts import rating_posts_bp
from endpoints.itineraries import itineraries_bp


app = Flask(__name__)

app.register_blueprint(recommendation_bp)
app.register_blueprint(city_image_bp)
app.register_blueprint(rating_posts_bp)
app.register_blueprint(itineraries_bp)

@app.route("/")
def home():
    return jsonify({"status": "Travel recommender backend running"})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5003)