"""
Example usage of the Symptom Classifier Service

This demonstrates how to use the symptom classification system.
"""

from services.symptom_service import analyze_user_symptom, analyze_and_save

# Example 1: Basic classification
print("Example 1: Basic Symptom Classification")
print("=" * 60)

user_id = "123"
symptom_text = "I feel very dizzy and my head is spinning"

try:
    result = analyze_user_symptom(user_id, symptom_text)
    
    print(f"User ID: {result['user_id']}")
    print(f"Raw Text: {result['raw_text']}")
    print(f"Prediction: {result['prediction']}")
    print("\n✅ Classification successful!\n")
    
except Exception as e:
    print(f"❌ Error: {e}\n")

# Example 2: Classification with database save
print("\nExample 2: Classification + Database Save")
print("=" * 60)

try:
    result = analyze_and_save(user_id, symptom_text)
    
    print(f"User ID: {result['user_id']}")
    print(f"Raw Text: {result['raw_text']}")
    print(f"Prediction: {result['prediction']}")
    print(f"Saved ID: {result['saved_id']}")
    print(f"Saved At: {result['saved_at']}")
    print("\n✅ Analysis and save successful!\n")
    
except Exception as e:
    print(f"❌ Error: {e}")
    print("   (This is expected if MongoDB is not running)\n")

print("=" * 60)
print("Usage complete!")
print("=" * 60)

