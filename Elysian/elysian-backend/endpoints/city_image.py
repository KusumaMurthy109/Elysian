from flask import Flask, request, jsonify, Blueprint
from utils.unsplash_service import fetch_city_image

city_image_bp = Blueprint("city_image", __name__) # Create a Blueprint route for this file so that app.py can call it.


@city_image_bp.get("/api/city-image")
def city_image():
    city = (request.args.get("city") or "").strip()
    country = (request.args.get("country") or "").strip()

    if not city:
        return jsonify({"ok": False, "message": "Missing required param: city"}), 400

    query = f"{city} {country}".strip()
    img = fetch_city_image(query)

    if not img:
        return jsonify({"ok": False, "message": "No image found (or missing UNSPLASH_ACCESS_KEY)"}), 404

    return jsonify({"ok": True, "data": img})