from pathlib import Path

import firebase_admin
from firebase_admin import credentials, firestore

service_account_path = Path(__file__).with_name("serviceAccountKey.json")

if not firebase_admin._apps:
    cred = credentials.Certificate(service_account_path)
    firebase_admin.initialize_app(cred)

db = firestore.client()
