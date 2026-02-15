"""
File: unsplash_service.py
Function: Fetches city images from the Unsplash API.

This helper service searches Unsplash for a landscape image based on a
city query and returns image details for use in the app. It safely handles
missing API keys and failed requests by returning None when an image
cannot be found.
"""

import os
import requests

# Read the Unsplash API key from environment variables.
# Keeps the key secure instead of hardcoding it.
UNSPLASH_ACCESS_KEY = os.getenv("UNSPLASH_ACCESS_KEY", "")

def fetch_city_image(query: str):
    # If no API key is set, stop early and return None to avoid unnecessary API calls.
    if not UNSPLASH_ACCESS_KEY:
        return None
    # Construct the API request to search for photos matching the city query.
    url = "https://api.unsplash.com/search/photos"
    params = {"query": query, "per_page": 1, "orientation": "landscape"}
    headers = {"Authorization": f"Client-ID {UNSPLASH_ACCESS_KEY}"}

    # Make the API request and handle potential errors gracefully.
    r = requests.get(url, params=params, headers=headers, timeout=10)
    # If the request fails (e.g., network issues, invalid API key), return None to indicate no image found.
    if r.status_code != 200:
        return None
    # Parse the JSON response and extract the first photo's details if available.
    data = r.json()
    results = data.get("results", [])
    # If no photos are found for the query, return None to indicate no image available.
    if not results:
        return None
    # Extract relevant details from the first photo result to return to the caller.
    photo = results[0]
    # Return a dictionary containing the image URL, photographer's name, and source URL for the photo.
    return {
        "provider": "unsplash",
        "imageUrl": photo["urls"]["regular"],
        "photographer": photo["user"]["name"],
        "sourceUrl": photo["links"]["html"],
    }
