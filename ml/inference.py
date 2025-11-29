"""Inference utilities for the MedAware symptom classifier.

Loads the fine-tuned ClinicalBERT model from ./ml/model and exposes
`classify_symptom` for downstream services (e.g., Flask endpoint).
"""

import json
import os
from functools import lru_cache
from typing import Dict

import torch
from transformers import AutoModelForSequenceClassification, AutoTokenizer


MODEL_DIR = os.path.join(os.path.dirname(__file__), "model")
LABEL_MAP_PATH = os.path.join(MODEL_DIR, "label_map.json")

# Risk levels per category
RISK_RULES = {
    "nervous system disorder": "HIGH",
    "cardiac disorder": "HIGH",
    "skin disorder": "MEDIUM",
    "gastrointestinal disorder": "LOW",
}
DEFAULT_RISK = "LOW"


@lru_cache(maxsize=1)
def _load_labels() -> Dict[str, str]:
    """Load label mapping from disk."""
    if not os.path.exists(LABEL_MAP_PATH):
        raise FileNotFoundError(
            f"Label map not found at {LABEL_MAP_PATH}. "
            "Run `python ml/train.py` to generate the model."
        )
    with open(LABEL_MAP_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


@lru_cache(maxsize=1)
def _load_tokenizer():
    """Load tokenizer once and cache."""
    if not os.path.isdir(MODEL_DIR):
        raise FileNotFoundError(
            f"Model directory {MODEL_DIR} not found. Train the model first."
        )
    return AutoTokenizer.from_pretrained(MODEL_DIR)


@lru_cache(maxsize=1)
def _load_model():
    """Load model once and cache (CPU)."""
    if not os.path.isdir(MODEL_DIR):
        raise FileNotFoundError(
            f"Model directory {MODEL_DIR} not found. Train the model first."
        )
    model = AutoModelForSequenceClassification.from_pretrained(MODEL_DIR)
    model.eval()
    model.to("cpu")
    return model


def _map_risk(label: str) -> str:
    """Map predicted label to a risk level."""
    normalized = label.lower()
    for key, risk in RISK_RULES.items():
        if key in normalized:
            return risk
    return DEFAULT_RISK


def classify_symptom(text: str) -> Dict[str, str]:
    """Classify user symptom text into a category and risk level."""
    if not text or not text.strip():
        raise ValueError("Input text cannot be empty")

    tokenizer = _load_tokenizer()
    model = _load_model()
    labels = _load_labels()

    inputs = tokenizer(
        text,
        truncation=True,
        max_length=256,
        return_tensors="pt",
    )
    inputs = {k: v.to("cpu") for k, v in inputs.items()}

    with torch.no_grad():
        outputs = model(**inputs)
        logits = outputs.logits
        predicted_idx = torch.argmax(logits, dim=-1).item()

    label_key = str(predicted_idx)
    category = labels.get(label_key, "Other")
    risk = _map_risk(category)

    return {
        "category": category,
        "risk": risk,
    }

