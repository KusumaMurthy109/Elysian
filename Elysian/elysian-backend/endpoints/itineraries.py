from flask import Flask, request, jsonify, Blueprint
import google.generativeai as genai
import json
import os

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")


itineraries_bp = Blueprint("itineraries", __name__) # Create a Blueprint route for this file so that app.py can call it.

@itineraries_bp.post("/api/activities")
def generate_activities():
    if GEMINI_API_KEY:
        genai.configure(api_key=GEMINI_API_KEY)
    else:
        print("WARNING: GEMINI_API_KEY not set")
    try:
        # if not GEMINI_API_KEY:
        #     return jsonify({"ok": False, "error": "Missing GEMINI_API_KEY"}), 500

        data = request.get_json()
        city = data["city"]
        country = data["country"]
        trip_length = data["tripLength"]

        prompt = f"""
            Return ONLY valid JSON.

            Generate 16 activities for:
            City: {city}
            Country: {country}
            Trip length: {trip_length} days

            Each activity must be assigned EXACTLY one category from this set:
            ["restaurants", "outdoor", "arts", "entertainment"].
            Generate activities grouped by geographic proximity, at least 3 distinct ones.
            Each activity must include a "location" field representing the cluster it belongs to.

            Rules:
            - Activity names must be short (2-4 words)
            - No numbering
            - No emojis
            - No duplicates
            - Locations must be real
            - Output format EXACTLY:

            {{
                "activities": [
                    {{ "name": "Activity name", "category": "arts", "location": "Downtown" }}
                ]
            }}
        """


        model = genai.GenerativeModel("models/gemini-3-flash-preview")

        response = model.generate_content(
            prompt,
            generation_config={
                "temperature": 0.7,
                "max_output_tokens": 3500,
                "response_mime_type": "application/json"
            }
        )
        print("REsponse: ", response)
        data = json.loads(response.text)
        print("Data", data)
        activities = data.get("activities", [])

        # Activities = [dicts]
        activities = activities[:16]

        return jsonify({"ok": True, "activities": activities})
    except Exception as e:
        print("Gemini error:", e)
        return jsonify({"error": str(e)}), 500