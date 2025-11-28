"""
Symptom Service
Integrates ML symptom classification with database operations
"""

from typing import Dict, Optional
from ml.symptom_classifier import classify_symptom
from utils.db import get_db
from datetime import datetime


def analyze_user_symptom(user_id: str, text: str) -> Dict[str, str]:
    """
    Analyze user symptom text and classify it using ClinicalBERT.
    
    Args:
        user_id: Firebase user ID
        text: Raw symptom description text
        
    Returns:
        Dict containing:
            - user_id: User ID
            - raw_text: Original input text
            - prediction: Predicted symptom label (e.g., "Headache", "Dizziness")
            
    Raises:
        ValueError: If user_id or text is empty
        RuntimeError: If classification fails
    """
    if not user_id or not user_id.strip():
        raise ValueError("user_id cannot be empty")
    
    if not text or not text.strip():
        raise ValueError("text cannot be empty")
    
    try:
        # Classify symptom using ML model
        predicted_label = classify_symptom(text)
        
        return {
            "user_id": user_id,
            "raw_text": text,
            "prediction": predicted_label
        }
        
    except Exception as e:
        raise RuntimeError(f"Failed to analyze symptom: {str(e)}")


def save_prediction_to_db(user_id: str, text: str, label: str) -> str:
    """
    Save symptom prediction to MongoDB symptoms collection.
    
    Args:
        user_id: Firebase user ID
        text: Original symptom description text
        label: Predicted symptom label from ML model
        
    Returns:
        str: MongoDB document ID of the saved record
        
    Raises:
        ValueError: If any required parameter is empty
        RuntimeError: If database operation fails
    """
    if not user_id or not user_id.strip():
        raise ValueError("user_id cannot be empty")
    
    if not text or not text.strip():
        raise ValueError("text cannot be empty")
    
    if not label or not label.strip():
        raise ValueError("label cannot be empty")
    
    try:
        # Get database connection
        db = get_db()
        
        # Prepare document
        symptom_doc = {
            "user_id": user_id,
            "description": text.strip(),
            "predicted_label": label,
            "ml_classified": True,
            "created_at": datetime.utcnow()
        }
        
        # Insert into symptoms collection
        result = db.symptoms.insert_one(symptom_doc)
        
        return str(result.inserted_id)
        
    except Exception as e:
        raise RuntimeError(f"Failed to save prediction to database: {str(e)}")


def analyze_and_save(user_id: str, text: str) -> Dict[str, any]:
    """
    Analyze symptom and save to database in one operation.
    
    Args:
        user_id: Firebase user ID
        text: Raw symptom description text
        
    Returns:
        Dict containing:
            - user_id: User ID
            - raw_text: Original input text
            - prediction: Predicted symptom label
            - saved_id: MongoDB document ID
            - saved_at: Timestamp when saved
            
    Raises:
        ValueError: If user_id or text is empty
        RuntimeError: If analysis or save operation fails
    """
    # Analyze symptom
    analysis_result = analyze_user_symptom(user_id, text)
    
    # Save to database
    saved_id = save_prediction_to_db(
        user_id,
        text,
        analysis_result["prediction"]
    )
    
    return {
        **analysis_result,
        "saved_id": saved_id,
        "saved_at": datetime.utcnow().isoformat()
    }

