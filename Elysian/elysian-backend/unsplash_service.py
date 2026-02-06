import os
import requests

UNSPLASH_ACCESS_KEY = os.getenv("UNSPLASH_ACCESS_KEY", "")

def fetch_city_image(query: str):
    if not UNSPLASH_ACCESS_KEY:
        return None

    url = "https://api.unsplash.com/search/photos"
    params = {"query": query, "per_page": 1, "orientation": "landscape"}
    headers = {"Authorization": f"Client-ID {UNSPLASH_ACCESS_KEY}"}

    r = requests.get(url, params=params, headers=headers, timeout=10)
    if r.status_code != 200:
        return None

    data = r.json()
    results = data.get("results", [])
    if not results:
        return None

    photo = results[0]
    return {
        "provider": "unsplash",
        "imageUrl": photo["urls"]["regular"],
        "photographer": photo["user"]["name"],
        "sourceUrl": photo["links"]["html"],
    }
