from flask import Blueprint, request, jsonify
from bson import ObjectId
from datetime import datetime
from utils.auth_middleware import verify_firebase_token
from utils.db import db

medication_bp = Blueprint("medications", __name__)


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


@medication_bp.route("/medications/add", methods=["POST"])
def add_medication():
    """
    Add a new medication entry.
    Requires Firebase authentication token.
    """
    uid, error, status = verify_firebase_token()
    if error:
        return error, status

    data = request.json

    # Validate required fields
    if not data:
        return jsonify({"error": "Request body is required"}), 400

    user_id = data.get("user_id")
    medication_name = data.get("medication_name")

    if not user_id:
        return jsonify({"error": "user_id is required"}), 400

    if not medication_name:
        return jsonify({"error": "medication_name is required"}), 400

    # Validate that user_id matches authenticated user
    if user_id != uid:
        return jsonify({"error": "user_id does not match authenticated user"}), 403

    # Prepare medication document
    medication_doc = {
        "user_id": user_id,
        "medication_name": medication_name,
        "dosage": data.get("dosage", ""),
        "frequency": data.get("frequency", ""),
        "start_date": data.get("start_date", ""),
        "notes": data.get("notes", ""),
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }

    try:
        # Insert into medications collection
        result = db.medications.insert_one(medication_doc)
        med_id = str(result.inserted_id)

        return jsonify({
            "status": "success",
            "med_id": med_id
        }), 201

    except Exception as e:
        return jsonify({"error": f"Failed to add medication: {str(e)}"}), 500


@medication_bp.route("/medications/<user_id>", methods=["GET"])
def get_medications(user_id):
    """
    Get all medications for a specific user.
    Requires Firebase authentication token.
    """
    uid, error, status = verify_firebase_token()
    if error:
        return error, status

    # Validate that user_id matches authenticated user
    if user_id != uid:
        return jsonify({"error": "user_id does not match authenticated user"}), 403

    try:
        # Fetch all medications for the user, sorted by created_at (newest first)
        medications = list(
            db.medications.find({"user_id": user_id})
            .sort("created_at", -1)
        )

        # Convert ObjectId to string for JSON response
        medications = convert_objectid_to_str(medications)

        return jsonify({
            "status": "success",
            "medications": medications,
            "count": len(medications)
        }), 200

    except Exception as e:
        return jsonify({"error": f"Failed to fetch medications: {str(e)}"}), 500


@medication_bp.route("/medications/update/<med_id>", methods=["PUT"])
def update_medication(med_id):
    """
    Update a medication entry by medication ID.
    Requires Firebase authentication token.
    """
    uid, error, status = verify_firebase_token()
    if error:
        return error, status

    data = request.json

    if not data:
        return jsonify({"error": "Request body is required"}), 400

    try:
        # Validate ObjectId format
        object_id = ObjectId(med_id)
    except Exception:
        return jsonify({"error": "Invalid medication ID format"}), 400

    # Check if medication exists and belongs to the authenticated user
    medication = db.medications.find_one({"_id": object_id})

    if not medication:
        return jsonify({"error": "Medication not found"}), 404

    if medication.get("user_id") != uid:
        return jsonify({"error": "You don't have permission to update this medication"}), 403

    # Prepare update fields (only update provided fields)
    update_fields = {}
    allowed_fields = ["medication_name", "dosage", "frequency", "start_date", "notes"]

    for field in allowed_fields:
        if field in data:
            update_fields[field] = data[field]

    if not update_fields:
        return jsonify({"error": "No valid fields to update"}), 400

    # Add updated_at timestamp
    update_fields["updated_at"] = datetime.utcnow()

    try:
        # Update the medication
        db.medications.update_one(
            {"_id": object_id},
            {"$set": update_fields}
        )

        return jsonify({
            "status": "success",
            "message": "Medication updated successfully"
        }), 200

    except Exception as e:
        return jsonify({"error": f"Failed to update medication: {str(e)}"}), 500

