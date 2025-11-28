import firebase_admin
from firebase_admin import credentials, auth
from flask import request, jsonify

cred = credentials.Certificate("serviceAccountKey.json")
firebase_admin.initialize_app(cred)


def verify_firebase_token():
    token = request.headers.get("Authorization")

    if not token:
        return None, jsonify({"error": "Missing Authorization header"}), 401

    token = token.replace("Bearer ", "")

    try:
        decoded = auth.verify_id_token(token)
        uid = decoded["uid"]
        return uid, None, None
    except Exception:
        return None, jsonify({"error": "Invalid or expired token"}), 401

