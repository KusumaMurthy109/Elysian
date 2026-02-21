"""
File: rate_cities.py
Function: Computes automatic rating for cities that users post.

This system uses the Elo rating algorithm and binary search comparisons
to efficiently determine how a new city ranks relative to cities the user
has already rated.

Process:
1. Assign initial Elo from feedback (LIKE=1100, NEUTRAL=1000, DISLIKE=900)
2. Compare against ranked cities using binary search (O(log n))
3. Update personal and global Elo after each comparison
4. Convert final Elo to a 0–10 display score
5. Store results and clear session

Returns updated Elos, comparison count, and final rating score.
"""

import time
from flask import request, jsonify
from firebase_config import db

# Configuration Constants
BASE_ELO = 1000   # Default Elo rating for new cities
K_FACTOR = 32     # Controls how fast ratings change

# Initial Elo rating assigned based on user's feedback
# This gives a starting estimate before comparisons begin
INITIAL_ELO_MAP = {
    "LIKE": 1100,
    "NEUTRAL": 1000,
    "DISLIKE": 900
}

# Display score scaling range
MIN_ELO = 800
MAX_ELO = 1200

# Session expiration time (seconds)
SESSION_TIMEOUT = 300   # 5 minutes


# In-memory session that stores the state between API calls
# Format:
# _sessions[user_id] = {
#     "city_id": str,
#     "left": int,
#     "right": int,
#     "ranked": list,
#     "tempPersonalElos": {},
#     "tempGlobalElos": {},
#     "lastActivity": timestamp
# }
_sessions = {}

# Session Cleanup Helper

def cleanup_expired_sessions():
    '''
    Function to remove sessions that have been inactive longer than SESSION_TIMEOUT.
    This prevents memory leaks and stale sessions.
    '''
    now = time.time()
    expired_users = []

    # Find expired sessions
    for user_id, session in _sessions.items():
        if now - session["lastActivity"] > SESSION_TIMEOUT:
            expired_users.append(user_id)

    for user_id in expired_users:
        _sessions.pop(user_id)

def touch_session(user_id):
    '''
    Function to update session lastActivity timestamp.
    This prevents active sessions from expiring.
    '''
    if user_id in _sessions:
        _sessions[user_id]["lastActivity"] = time.time()

# Firestore Read Helper Functions

def get_city_data(city_id):
    '''
    Function to fetch global Elo and comparison count fo a city from Firestore.
    '''
    doc = db.collection("allCities").document(city_id).get()
    data = doc.to_dict()
    return {
        "globalElo": data.get("global_Elo", BASE_ELO),
        "comparisonCount": data.get("comparison_count", 0)
    }


def get_user_data(user_id):
    '''
    Function to fetch user's personal Elo ratings and comparison count from Firebase.
    Returns defaults if user does not exist (i.e., no posts have been created previously).
    '''
    doc = db.collection("userPosts").document(user_id).get()

    if not doc.exists:
        return {
            "personalElos": {},
            "comparisonCount": 0
        }
    data = doc.to_dict()

    return {
        "personalElos": data.get("personalElos", {}),
        "comparisonCount": data.get("comparisonCount", 0)
    }

def get_city_info(city_id):
    '''
    Function to fetch readable city info (name and country).
    This is used for displaying comparison for UI.
    '''
    doc = db.collection("allCities").document(city_id).get()
    data = doc.to_dict()
    return {
        "id": city_id,
        "city_name": data.get("city_name"),
        "country_name": data.get("country_name")
    }

# Elo Rating Logic

def expected_score(rating_a, rating_b):
    '''
    Function to calculate expected win probability using Elo formula.
    Returns value between 0 and 1.
    '''
    return 1 / (1 + 10 ** ((rating_b - rating_a) / 400))

def calculate_rating_updates(session, winner_id, loser_id):
    '''
    Function to update temporary personal and global Elo ratings after comparison.
    This is added to Firebase by frontend once user uploads the post.
    '''
    # Temporary personal Elo rating
    personal_elos = session["tempPersonalElos"]

    # Fetch current global Elo values
    winner_city = get_city_data(winner_id)
    loser_city = get_city_data(loser_id)

    # Use personal Elo if exits, otherwise fallback to global Elo
    winner_personal = personal_elos.get(winner_id, winner_city["globalElo"])
    loser_personal = personal_elos.get(loser_id, loser_city["globalElo"])

    # Expected probability that winner will win
    expected_win = expected_score(winner_personal, loser_personal)

    # Update personal Elo ratings
    winner_new_personal = winner_personal + K_FACTOR * (1 - expected_win)
    loser_new_personal = loser_personal + K_FACTOR * (0 - (1 - expected_win))

    personal_elos[winner_id] = winner_new_personal
    personal_elos[loser_id] = loser_new_personal

    # Global Elo updates move slower (30%)
    global_k = K_FACTOR * 0.3

    winner_global = winner_city["globalElo"]
    loser_global = loser_city["globalElo"]

    winner_expected_global = expected_score(winner_global, loser_global)

    winner_new_global = winner_global + global_k * (1 - winner_expected_global)
    loser_new_global = loser_global + global_k * (0 - (1 - winner_expected_global))

    session["tempGlobalElos"][winner_id] = winner_new_global
    session["tempGlobalElos"][loser_id] = loser_new_global

    return {
        "comparisonIncrement": 1
    }

# Ranking Helper Functions

def get_sorted_ranking(user_id):
    '''
    Function returns user's cities sorted by personal Elo (highest to lowest).
    '''
    user_data = get_user_data(user_id)
    personal_elos = user_data["personalElos"]
    return sorted(
        personal_elos.keys(),
        key=lambda cid: personal_elos[cid],
        reverse=True
    )


def calculate_display_score_from_elos(personal_elos, city_id):
    '''
    Function that converts Elo rating into 0-10 rating score to display.
    '''
    elo = personal_elos.get(city_id, BASE_ELO)
    scaled = 10 * (elo - MIN_ELO) / (MAX_ELO - MIN_ELO)
    return round(max(0, min(10, scaled)), 1)

# Rating Flow

def start_rating(user_id, city_id, feedback):
    '''
    Function to start rating process for a city.
    Creates session and retunrs first comparison if needed.
    '''
    cleanup_expired_sessions()
    ranked = get_sorted_ranking(user_id) # Get user's ranked cities

    # If user has never rated any cities
    if not ranked:
        # Assign inital Elo based on feedback
        initial_elo = INITIAL_ELO_MAP.get(feedback, BASE_ELO)
        # Convert to display score
        rating_value = calculate_display_score_from_elos(
            {city_id: initial_elo},
            city_id
        )
        # Return rating info since no comparisons needed
        return {
            "status": "done",
            "personalElos": {city_id: initial_elo},
            "globalElos": {},
            "comparisonIncrement": 0,
            "ratingValue": rating_value
        }

    # Copy user's personal Elos into temporary working version
    user_data = get_user_data(user_id)
    temp_elos = user_data["personalElos"].copy()
    # Assigne intial Elo to a new city
    temp_elos[city_id] = INITIAL_ELO_MAP.get(feedback, BASE_ELO)

    # Binary serach bounds based on feedback
    if feedback == "LIKE":
        left = 0
        right = len(ranked) // 2

    elif feedback == "DISLIKE":
        left = len(ranked) // 2
        right = len(ranked) - 1

    else:
        left = 0
        right = len(ranked) - 1

    # Creates a new rating session for user
    _sessions[user_id] = {
        "city_id": city_id,
        "left": left,
        "right": right,
        "ranked": ranked,
        "tempPersonalElos": temp_elos,
        "tempGlobalElos": {},
        "lastActivity": time.time()
    }

    return next_comparison(user_id) # Return first comparison

def submit_comparison(user_id, preferred):
    '''
    Function to handle user comparison choice and update Elo rating.
    '''
    try:
        cleanup_expired_sessions()
        # Session expired
        if user_id not in _sessions:
            return {
                "status": "error",
                "message": "Session expired or invalid"
            }
        
        touch_session(user_id)
        session = _sessions[user_id]

        left = session["left"]
        right = session["right"]
        ranked = session["ranked"]
        new_city = session["city_id"]

        mid = (left + right) // 2
        existing_city = ranked[mid]

        # Determine winner and loser
        if preferred == "new":
            winner = new_city
            loser = existing_city
            session["right"] = mid - 1
        else:
            winner = existing_city
            loser = new_city
            session["left"] = mid + 1

        # Update Elo ratings
        rating_updates = calculate_rating_updates(session, winner, loser)

        # Finished comparisons
        if session["left"] > session["right"]:
            final_personal_elos = session["tempPersonalElos"]
            final_global_elos = session["tempGlobalElos"]

            rating_value = calculate_display_score_from_elos(
                final_personal_elos,
                new_city
            )

            _sessions.pop(user_id) # Delete session

            return {
                "status": "done",
                "personalElos": final_personal_elos,
                "globalElos": final_global_elos,
                "comparisonIncrement": rating_updates["comparisonIncrement"],
                "ratingValue": rating_value
            }

        # Continue comparing
        return next_comparison(user_id)

    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }

def next_comparison(user_id):
    '''
    Returns next comparison pair for user.
    '''
    touch_session(user_id)
    session = _sessions[user_id]
    left = session["left"]
    right = session["right"]
    ranked = session["ranked"]
    new_city = session["city_id"]
    mid = (left + right) // 2
    existing_city = ranked[mid]

    return {
        "status": "compare",
        "new_city": get_city_info(new_city),
        "existing_city": get_city_info(existing_city)
    }