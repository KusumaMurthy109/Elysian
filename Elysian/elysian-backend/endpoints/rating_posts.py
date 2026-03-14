from flask import Flask, request, jsonify, Blueprint
import utils.rate_cities as rate_cities

rating_posts_bp = Blueprint("rating_posts", __name__) # Create a Blueprint route for this file so that app.py can call it.

@rating_posts_bp.post("/rate-city")
def rate_city():
    data = request.json

    response = rate_cities.start_rating(
        user_id = data["user_id"],
        city_id = data["city_id"],
        feedback = data["feedback"]
    )

    return jsonify(response)

@rating_posts_bp.post("/compare-cities")
def compare_cities():
    data = request.json

    response = rate_cities.submit_comparison(
        user_id = data["user_id"],
        preferred = data["preferred"]
    )

    return jsonify(response)