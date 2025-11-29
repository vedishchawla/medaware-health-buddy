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
        # Symptom categories the model will choose from
        self.labels = [
            "dizziness",
            "headache",
            "nausea",
            "vomiting",
            "fatigue",
            "fever",
            "rash",
            "stomach pain",
            "insomnia",
            "anxiety",
        ]

    def predict(self, text: str):
        """Return predicted symptom label with confidence."""
        result = self.classifier(text, self.labels)
        return {
            "predicted_symptom": result["labels"][0],
            "confidence": float(result["scores"][0]),
        }

