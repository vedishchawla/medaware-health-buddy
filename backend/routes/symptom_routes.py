from flask import Blueprint, request, jsonify
from ml.clinicalbert_service import SymptomClassifier

symptom_bp = Blueprint("symptom_bp", __name__)
classifier = SymptomClassifier()


@symptom_bp.route("/predict_symptom", methods=["POST"])
def predict_symptom():
    try:
        data = request.get_json() or {}
        text = data.get("symptom_text", "")
        if not text:
            return jsonify({"error": "symptom_text is required"}), 400
        result = classifier.predict(text)
        return jsonify(
            {
                "predicted_symptom": result["predicted_symptom"],
                "probability": result["confidence"],
            }
        )
    except Exception as e:
        return jsonify({"error": str(e)}), 500

