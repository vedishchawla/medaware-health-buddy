from flask import Blueprint, request, jsonify
from bson import ObjectId
from datetime import datetime
from utils.auth_middleware import verify_firebase_token
from utils.db import db

symptom_bp = Blueprint("symptoms", __name__)


def convert_objectid_to_str(doc):
    """
    Convert MongoDB ObjectId and other non-JSON types to JSON-safe format.
    """
    if isinstance(doc, dict):
        return {key: convert_objectid_to_str(value) for key, value in doc.items()}
    elif isinstance(doc, list):
        return [convert_objectid_to_str(item) for item in doc]
    elif isinstance(doc, ObjectId):
        return str(doc)
    elif isinstance(doc, datetime):
        return doc.isoformat()
    else:
        return doc


@symptom_bp.route("/symptoms/add", methods=["POST"])
def add_symptom():
    """
    Add a new symptom entry.
    Requires Firebase authentication token.
    """
    uid, error, status = verify_firebase_token()
    if error:
        return error, status

    data = request.json

    # Validate request body
    if not data:
        return jsonify({"error": "Request body is required"}), 400

    user_id = data.get("user_id")
    description = data.get("description")
    intensity = data.get("intensity")

    # Validate required fields
    if not user_id:
        return jsonify({"error": "user_id is required"}), 400

    if not description:
        return jsonify({"error": "description is required"}), 400

    if intensity is None:
        return jsonify({"error": "intensity is required"}), 400

    # Validate intensity is a number and in valid range (1-10)
    try:
        intensity = int(intensity)
        if intensity < 1 or intensity > 10:
            return jsonify({"error": "intensity must be between 1 and 10"}), 400
    except (ValueError, TypeError):
        return jsonify({"error": "intensity must be a valid number"}), 400

    # Validate that user_id matches authenticated user
    if user_id != uid:
        return jsonify({"error": "user_id does not match authenticated user"}), 403

    # Prepare symptom document
    symptom_doc = {
        "user_id": user_id,
        "description": description.strip(),
        "intensity": intensity,
        "tags": data.get("tags", []),
        "med_context": data.get("med_context", []),
        "created_at": datetime.utcnow()
    }

    # Validate tags and med_context are arrays if provided
    if "tags" in data and not isinstance(data["tags"], list):
        return jsonify({"error": "tags must be an array"}), 400

    if "med_context" in data and not isinstance(data["med_context"], list):
        return jsonify({"error": "med_context must be an array"}), 400

    try:
        # Insert into symptoms collection
        result = db.symptoms.insert_one(symptom_doc)
        symptom_id = str(result.inserted_id)

        return jsonify({
            "status": "success",
            "symptom_id": symptom_id
        }), 201

    except Exception as e:
        return jsonify({"error": f"Failed to add symptom: {str(e)}"}), 500


@symptom_bp.route("/symptoms/<user_id>", methods=["GET"])
def get_symptoms(user_id):
    """
    Get all symptoms for a specific user.
    Requires Firebase authentication token.
    """
    uid, error, status = verify_firebase_token()
    if error:
        return error, status

    # Validate that user_id matches authenticated user
    if user_id != uid:
        return jsonify({"error": "user_id does not match authenticated user"}), 403

    try:
        # Fetch all symptoms for the user, sorted by created_at (newest first)
        symptoms = list(
            db.symptoms.find({"user_id": user_id})
            .sort("created_at", -1)
        )

        # Convert ObjectId to string for JSON response
        symptoms = convert_objectid_to_str(symptoms)

        return jsonify({
            "status": "success",
            "symptoms": symptoms,
            "count": len(symptoms)
        }), 200

    except Exception as e:
        return jsonify({"error": f"Failed to fetch symptoms: {str(e)}"}), 500

