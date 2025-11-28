"""
Test script for Symptom Classifier
Tests the ML model integration and symptom classification
"""

import sys
import os

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from ml.symptom_classifier import classify_symptom, load_model, get_model_info
from services.symptom_service import analyze_user_symptom, save_prediction_to_db, analyze_and_save


def test_classifier():
    """Test the symptom classifier directly"""
    print("=" * 60)
    print("Testing Symptom Classifier")
    print("=" * 60)
    
    # Test cases
    test_cases = [
        "I feel very dizzy and my head is spinning",
        "I have a severe headache on the right side",
        "I'm feeling nauseous and want to vomit",
        "I'm extremely tired and fatigued all the time",
        "My stomach hurts really bad",
        "I have a persistent cough that won't go away",
        "I have a high fever and feel hot",
        "My muscles are sore and painful",
        "I have a red rash on my arm",
        "I'm experiencing chest pain and tightness"
    ]
    
    print("\nLoading model (this may take a few minutes on first run)...")
    try:
        load_model()
        print("✅ Model loaded successfully!\n")
    except Exception as e:
        print(f"❌ Failed to load model: {e}")
        return False
    
    print("Testing classification:\n")
    for i, text in enumerate(test_cases, 1):
        try:
            prediction = classify_symptom(text)
            print(f"{i}. Text: {text[:50]}...")
            print(f"   Prediction: {prediction}\n")
        except Exception as e:
            print(f"{i}. Error: {e}\n")
    
    return True


def test_service():
    """Test the symptom service"""
    print("\n" + "=" * 60)
    print("Testing Symptom Service")
    print("=" * 60)
    
    test_user_id = "test_user_123"
    test_text = "I feel very dizzy and my head is spinning"
    
    try:
        print(f"\nAnalyzing symptom for user: {test_user_id}")
        print(f"Text: {test_text}\n")
        
        result = analyze_user_symptom(test_user_id, test_text)
        
        print("✅ Analysis successful!")
        print(f"   User ID: {result['user_id']}")
        print(f"   Raw Text: {result['raw_text']}")
        print(f"   Prediction: {result['prediction']}\n")
        
        return True
        
    except Exception as e:
        print(f"❌ Service test failed: {e}\n")
        return False


def test_database_save():
    """Test saving to database (requires MongoDB connection)"""
    print("\n" + "=" * 60)
    print("Testing Database Save")
    print("=" * 60)
    
    test_user_id = "test_user_123"
    test_text = "I have a severe headache"
    
    try:
        print(f"\nAnalyzing and saving symptom...")
        result = analyze_and_save(test_user_id, test_text)
        
        print("✅ Save successful!")
        print(f"   User ID: {result['user_id']}")
        print(f"   Prediction: {result['prediction']}")
        print(f"   Saved ID: {result['saved_id']}")
        print(f"   Saved At: {result['saved_at']}\n")
        
        return True
        
    except Exception as e:
        print(f"⚠️  Database save test failed: {e}")
        print("   (This is expected if MongoDB is not running)\n")
        return False


def main():
    print("\n" + "🤖" * 30)
    print("  Symptom Classifier Test Suite")
    print("🤖" * 30)
    
    results = []
    
    # Test classifier
    results.append(("Classifier", test_classifier()))
    
    # Test service
    results.append(("Service", test_service()))
    
    # Test database (optional)
    results.append(("Database Save", test_database_save()))
    
    # Summary
    print("=" * 60)
    print("Test Summary")
    print("=" * 60)
    for test_name, passed in results:
        status = "✅ PASSED" if passed else "❌ FAILED"
        print(f"   {test_name}: {status}")
    print("=" * 60 + "\n")


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⚠️  Tests interrupted by user")
    except Exception as e:
        print(f"\n\n❌ Unexpected error: {e}")
        import traceback
        traceback.print_exc()

