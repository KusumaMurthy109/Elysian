"""
File: firebase_config.py
Function: Initializes firebase for backend.

This is needed for app.py and rate_cities.py since Firebase can only be intialized once.
"""

import firebase_admin
from firebase_admin import credentials, firestore

# Initialize Firebase ONLY if not already initialized
if not firebase_admin._apps:

    cred = credentials.Certificate("elysianproject-2b9ce-firebase-adminsdk-fbsvc-542db33246.json package-lock.json")

    firebase_admin.initialize_app(cred)

# Export Firestore client
db = firestore.client()
