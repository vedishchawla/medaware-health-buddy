from flask import Blueprint, request, jsonify
from bson import ObjectId
from datetime import datetime

from ml.clinicalbert_service import SymptomClassifier
from utils.auth_middleware import verify_firebase_token
from utils.db import db

symptom_bp = Blueprint("symptom_bp", __name__)
classifier = SymptomClassifier()


def _convert_objectid_to_str(doc):
  """
  Convert MongoDB ObjectId and datetime values to JSON-safe types.
  """
  if isinstance(doc, dict):
      return {k: _convert_objectid_to_str(v) for k, v in doc.items()}
  if isinstance(doc, list):
      return [_convert_objectid_to_str(v) for v in doc]
  if isinstance(doc, ObjectId):
      return str(doc)
  if isinstance(doc, datetime):
      return doc.isoformat()
  return doc


@symptom_bp.route("/symptoms/add", methods=["POST"])
def add_symptom():
    """
    Add a new symptom entry (MongoDB).
    Requires Firebase authentication token.
    """
    uid, error, status = verify_firebase_token()
    if error:
        return error, status

    data = request.get_json() or {}

    user_id = data.get("user_id")
    description = data.get("description")
    intensity = data.get("intensity")

    if not user_id:
        return jsonify({"error": "user_id is required"}), 400
    if not description:
        return jsonify({"error": "description is required"}), 400
    if intensity is None:
        return jsonify({"error": "intensity is required"}), 400

    try:
        intensity = int(intensity)
        if not 1 <= intensity <= 10:
            return jsonify({"error": "intensity must be between 1 and 10"}), 400
    except (TypeError, ValueError):
        return jsonify({"error": "intensity must be a valid number"}), 400

    if user_id != uid:
        return jsonify({"error": "user_id does not match authenticated user"}), 403

    if "tags" in data and not isinstance(data["tags"], list):
        return jsonify({"error": "tags must be an array"}), 400
    if "med_context" in data and not isinstance(data.get("med_context", []), list):
        return jsonify({"error": "med_context must be an array"}), 400

    symptom_doc = {
        "user_id": user_id,
        "description": description.strip(),
        "intensity": intensity,
        "tags": data.get("tags", []),
        "med_context": data.get("med_context", []),
        "created_at": datetime.utcnow(),
    }

    try:
        result = db.symptoms.insert_one(symptom_doc)
        return (
            jsonify(
                {
                    "status": "success",
                    "symptom_id": str(result.inserted_id),
                }
            ),
            201,
        )
    except Exception as exc:
        return jsonify({"error": f"Failed to add symptom: {exc}"}), 500


@symptom_bp.route("/symptoms/<user_id>", methods=["GET"])
def get_symptoms(user_id: str):
    """
    Get all symptoms for a user from MongoDB.
    Requires Firebase authentication token.
    """
    uid, error, status = verify_firebase_token()
    if error:
        return error, status

    if user_id != uid:
        return jsonify({"error": "user_id does not match authenticated user"}), 403

    try:
        symptoms = list(
            db.symptoms.find({"user_id": user_id}).sort("created_at", -1)
        )
        symptoms = _convert_objectid_to_str(symptoms)
        return jsonify(
            {
                "status": "success",
                "symptoms": symptoms,
                "count": len(symptoms),
            }
        )
    except Exception as exc:
        return jsonify({"error": f"Failed to fetch symptoms: {exc}"}), 500


@symptom_bp.route("/symptoms/predictions/<user_id>", methods=["GET"])
def get_symptom_predictions(user_id: str):
    """
    Get all symptom predictions (AI insights) for a user from MongoDB.
    Requires Firebase authentication token.
    """
    uid, error, status = verify_firebase_token()
    if error:
        return error, status

    if user_id != uid:
        return jsonify({"error": "user_id does not match authenticated user"}), 403

    try:
        predictions = list(
            db.symptom_predictions.find({"user_id": user_id}).sort("created_at", -1)
        )
        predictions = _convert_objectid_to_str(predictions)
        return jsonify(
            {
                "status": "success",
                "predictions": predictions,
                "count": len(predictions),
            }
        )
    except Exception as exc:
        return jsonify({"error": f"Failed to fetch predictions: {exc}"}), 500


@symptom_bp.route("/api/predict_symptom", methods=["POST"])
def predict_symptom():
    """
    Zero-shot ClinicalBERT prediction endpoint used by the assistant.
    """
    try:
        data = request.get_json() or {}
        text = data.get("symptom_text", "")
        if not text:
            return jsonify({"error": "symptom_text is required"}), 400

        result = classifier.predict(text)

        # Optional logging to DB if user_id is provided
        user_id = data.get("user_id")
        if user_id:
            try:
                db.symptom_predictions.insert_one(
                    {
                        "user_id": user_id,
                        "text": text,
                        "predictions": result.get("top_predictions", []),
                        "overall_risk": result.get("overall_risk", "LOW"),
                        "created_at": datetime.utcnow(),
                    }
                )
            except Exception:
                # Don't break the API if logging fails
                pass

        return jsonify(
            {
                "predicted_symptom": result["predicted_symptom"],
                "probability": result["confidence"],
                "top_predictions": result.get("top_predictions", []),
                "overall_risk": result.get("overall_risk", "LOW"),
            }
        )
    except Exception as e:
        return jsonify({"error": str(e)}), 500

