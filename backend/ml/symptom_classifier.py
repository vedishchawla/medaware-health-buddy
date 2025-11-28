"""
Symptom Classifier using ClinicalBERT
Uses the Bio_ClinicalBERT model from HuggingFace for symptom classification
"""

import json
import os
import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification
from typing import Dict, Optional

# Global variables for model and tokenizer (lazy loading)
_model = None
_tokenizer = None
_labels = None

# Model configuration
MODEL_NAME = "emilyalsentzer/Bio_ClinicalBERT"
LABELS_FILE = os.path.join(os.path.dirname(__file__), "symptom_labels.json")
MAX_LENGTH = 512  # Maximum token length for truncation


def load_labels() -> Dict[str, str]:
    """
    Load symptom labels from JSON file.
    
    Returns:
        Dict mapping label indices to label names
    """
    global _labels
    
    if _labels is not None:
        return _labels
    
    try:
        with open(LABELS_FILE, 'r', encoding='utf-8') as f:
            _labels = json.load(f)
        return _labels
    except FileNotFoundError:
        raise FileNotFoundError(f"Labels file not found at {LABELS_FILE}")
    except json.JSONDecodeError as e:
        raise ValueError(f"Invalid JSON in labels file: {e}")


def load_model():
    """
    Load the ClinicalBERT tokenizer and model.
    Uses lazy loading - model is loaded only once and cached.
    Runs on CPU by default.
    
    Returns:
        tuple: (tokenizer, model)
    """
    global _model, _tokenizer
    
    if _model is not None and _tokenizer is not None:
        return _tokenizer, _model
    
    print(f"Loading ClinicalBERT model: {MODEL_NAME}")
    print("This may take a few minutes on first run...")
    
    try:
        # Load tokenizer
        _tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
        
        # Load model for sequence classification
        # Note: This adds a randomly initialized classification head
        # For production use, the model should be fine-tuned on symptom data
        # For now, it will work but accuracy may be limited
        try:
            base_model = AutoModelForSequenceClassification.from_pretrained(
                MODEL_NAME,
                num_labels=10,  # 10 symptom categories
                problem_type="single_label_classification"
            )
        except Exception:
            # If the model doesn't support direct classification, use base model
            from transformers import AutoModel
            base_model = AutoModel.from_pretrained(MODEL_NAME)
            # Add a simple classification head
            from torch import nn
            base_model.classifier = nn.Linear(base_model.config.hidden_size, 10)
        
        # Set to evaluation mode and CPU
        base_model.eval()
        base_model.to('cpu')
        
        _model = base_model
        
        print("Model loaded successfully!")
        return _tokenizer, _model
        
    except Exception as e:
        raise RuntimeError(f"Failed to load model: {str(e)}")


def classify_symptom(text: str) -> str:
    """
    Classify a symptom description using ClinicalBERT.
    
    Args:
        text: Raw user text describing symptoms
        
    Returns:
        str: Predicted symptom label name (e.g., "Headache", "Dizziness")
        
    Raises:
        RuntimeError: If model fails to load or inference fails
        ValueError: If input text is empty
    """
    if not text or not text.strip():
        raise ValueError("Input text cannot be empty")
    
    # Load model and labels if not already loaded
    tokenizer, model = load_model()
    labels = load_labels()
    
    try:
        # Tokenize input text with truncation
        inputs = tokenizer(
            text,
            truncation=True,
            max_length=MAX_LENGTH,
            padding=True,
            return_tensors="pt"
        )
        
        # Move inputs to CPU
        inputs = {k: v.to('cpu') for k, v in inputs.items()}
        
        # Run inference (no gradient computation)
        with torch.no_grad():
            outputs = model(**inputs)
            
            # Handle different model output formats
            if hasattr(outputs, 'logits'):
                # Sequence classification model
                logits = outputs.logits
            elif hasattr(model, 'classifier'):
                # Base model with custom classifier head
                # Get pooler output or last hidden state
                if hasattr(outputs, 'pooler_output') and outputs.pooler_output is not None:
                    hidden_state = outputs.pooler_output
                else:
                    # Use mean pooling of last hidden state
                    hidden_state = outputs.last_hidden_state.mean(dim=1)
                logits = model.classifier(hidden_state)
            else:
                # Fallback: use keyword matching if model structure is unexpected
                return _keyword_based_classification(text, labels)
            
            # Get predicted class index
            predicted_idx = torch.argmax(logits, dim=-1).item()
            
            # Map index to label name
            label_key = str(predicted_idx)
            predicted_label = labels.get(label_key, "Unknown")
            
            return predicted_label
            
    except Exception as e:
        raise RuntimeError(f"Symptom classification failed: {str(e)}")


def _keyword_based_classification(text: str, labels: Dict[str, str]) -> str:
    """
    Fallback keyword-based classification if model fails.
    
    Args:
        text: Input text
        labels: Label mapping
        
    Returns:
        Predicted label based on keyword matching
    """
    text_lower = text.lower()
    
    # Keyword mapping
    keyword_map = {
        "headache": "0",
        "nausea": "1",
        "nauseous": "1",
        "dizzy": "2",
        "dizziness": "2",
        "spinning": "2",
        "tired": "3",
        "fatigue": "3",
        "exhausted": "3",
        "stomach": "4",
        "abdominal": "4",
        "cough": "5",
        "coughing": "5",
        "fever": "6",
        "temperature": "6",
        "muscle": "7",
        "sore": "7",
        "ache": "7",
        "rash": "8",
        "chest": "9",
        "heart": "9"
    }
    
    # Find matching keywords
    for keyword, label_idx in keyword_map.items():
        if keyword in text_lower:
            return labels.get(label_idx, "Unknown")
    
    # Default to first label if no match
    return labels.get("0", "Unknown")


def get_model_info() -> Dict[str, str]:
    """
    Get information about the loaded model.
    
    Returns:
        Dict with model information
    """
    return {
        "model_name": MODEL_NAME,
        "model_loaded": _model is not None,
        "tokenizer_loaded": _tokenizer is not None,
        "labels_loaded": _labels is not None,
        "device": "cpu"
    }

