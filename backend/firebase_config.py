import firebase_admin
from firebase_admin import credentials, firestore

# Replace 'your-key-filename.json' with the actual name of the file you downloaded
cred = credentials.Certificate("serviceAccountKey.json")
firebase_admin.initialize_app(cred)

db = firestore.client()