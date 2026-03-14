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

        prompt = f"""
            Return ONLY valid JSON.

            Generate 16 activities for:
            City: {city}
            Country: {country}

            Each activity must be assigned EXACTLY one category from this set:
            ["restaurants", "outdoor", "arts", "entertainment"]

            Rules:
            - Activity names must be short (2-6 words)
            - No numbering
            - No emojis
            - No duplicates
            - Output format EXACTLY:

            {{
                "activities": [
                    {{ "name": "Activity name", "category": "arts" }}
                ]
            }}
        """


        model = genai.GenerativeModel("models/gemini-3-flash-preview")

        response = model.generate_content(
            prompt,
            generation_config={
                "temperature": 0.7,
                "max_output_tokens": 3000,
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