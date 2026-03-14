"""
File: firebase_config.py
Function: Initializes firebase for backend.

This is needed for app.py and rate_cities.py since Firebase can only be intialized once.
"""

import firebase_admin
from firebase_admin import credentials, firestore
import json
import os

# Initialize Firebase ONLY if not already initialized
if not firebase_admin._apps:

    service_account_info = json.loads(os.environ["FIREBASE_SERVICE_ACCOUNT"])
    cred = credentials.Certificate(service_account_info)

    firebase_admin.initialize_app(cred)

# Export Firestore client
db = firestore.client()
