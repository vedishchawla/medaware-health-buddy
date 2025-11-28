from flask import Blueprint, request, jsonify
from utils.auth_middleware import verify_firebase_token
from utils.db import db


onboarding_bp = Blueprint("onboarding", __name__)


@onboarding_bp.route("/onboarding", methods=["POST"])
def save_onboarding():
    uid, error, status = verify_firebase_token()
    if error:
        return error, status

    data = request.json

    profile_data = {
        "uid": uid,
        "age": data.get("age"),
        "gender": data.get("gender"),
        "conditions": data.get("conditions", []),
        "allergies": data.get("allergies", []),
        "current_medications": data.get("current_medications", [])
    }

    db.users.update_one(
        {"uid": uid},
        {"$set": {"profile": profile_data}},
        upsert=True
    )

    return jsonify({"message": "Onboarding data stored successfully"}), 200

