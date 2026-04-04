import firebase_admin
from firebase_admin import credentials, firestore, messaging

# 1. Setup - Use the same serviceAccountKey.json from your bulk import project
cred = credentials.Certificate("serviceAccountKey.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

def send_to_all_tokens(title, body):
    # Fetch all users who have an fcmToken
    users_ref = db.collection("users")
    docs = users_ref.get()
    
    tokens = []
    for doc in docs:
        user_data = doc.to_dict()
        token = user_data.get("fcmToken")
        if token:
            tokens.append(token)

    if not tokens:
        print("No tokens found in database.")
        return

    # Create the Multicast message
    message = messaging.MulticastMessage(
        notification=messaging.Notification(
            title=title,
            body=body,
        ),
        tokens=tokens,
    )

    # Send it!
    response = messaging.send_each_for_multicast(message)
    print(f"Successfully sent {response.success_count} notifications.")

# 2. The Listener - This "watches" the announcements collection
def on_snapshot(col_snapshot, changes, read_time):
    for change in changes:
        if change.type.name == 'ADDED':
            data = change.document.to_dict()
            print(f"New Announcement Detected: {data.get('content')}")
            
            # Trigger the push notification
            send_to_all_tokens(
                title="New Announcement",
                body=data.get('content')
            )

# 3. Start the watcher
announcements_ref = db.collection("announcements")
query_watch = announcements_ref.on_snapshot(on_snapshot)

print("Watcher is active... waiting for announcements from AdminTools.jsx")

# Keep the script running
import time
while True:
    time.sleep(1)