"""Zero-shot ClinicalBERT symptom classifier service."""

from transformers import pipeline


class SymptomClassifier:
    """Wraps HuggingFace zero-shot pipeline for symptom classification."""

    def __init__(self):
        model_name = "emilyalsentzer/Bio_ClinicalBERT"
        # Zero-shot classification pipeline
        self.classifier = pipeline(
            "zero-shot-classification",
            model=model_name,
            tokenizer=model_name,
            device="cpu",
        )
        # Symptom categories the model will choose from (more clinically-focused)
        self.labels = [
            "dizziness",
            "headache",
            "nausea",
            "vomiting",
            "abdominal pain",
            "diarrhea",
            "cough",
            "fever",
            "rash",
            "chest pain",
        ]

        # Simple risk mapping for highlighting
        self.risk_map = {
            "chest pain": "HIGH",
            "dizziness": "HIGH",
            "headache": "MEDIUM",
            "vomiting": "MEDIUM",
            "fever": "MEDIUM",
            "rash": "MEDIUM",
            "abdominal pain": "LOW",
            "diarrhea": "LOW",
            "cough": "LOW",
            "nausea": "LOW",
        }

    def predict(self, text: str):
        """Return predicted symptom label with confidence.

        Note: This is zero-shot, so treat results as suggestions, not diagnoses.
        """
        result = self.classifier(text, self.labels)
        labels = result["labels"]
        scores = [float(s) for s in result["scores"]]

        top_predictions = []
        highest_risk = "LOW"
        risk_rank = {"LOW": 1, "MEDIUM": 2, "HIGH": 3}

        for label, score in list(zip(labels, scores))[:3]:
            label_lower = label.lower()
            risk = self.risk_map.get(label_lower, "LOW")
            top_predictions.append({"label": label, "score": score, "risk": risk})
            if risk_rank[risk] > risk_rank[highest_risk]:
                highest_risk = risk

        return {
            "predicted_symptom": labels[0],
            "confidence": scores[0],
            "top_predictions": top_predictions,
            "overall_risk": highest_risk,
        }

