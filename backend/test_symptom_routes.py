"""
Test script for Symptom Routes
Make sure Flask server is running: python app.py
"""

import requests
import json

BASE_URL = "http://localhost:5000"

def print_section(title):
    print("\n" + "=" * 60)
    print(f"  {title}")
    print("=" * 60)

def test_add_symptom_no_token():
    """Test adding symptom without authentication token"""
    print_section("1. Add Symptom (No Token)")
    try:
        response = requests.post(
            f"{BASE_URL}/symptoms/add",
            json={
                "user_id": "test_user",
                "description": "Headache and dizziness",
                "intensity": 7,
                "tags": ["headache", "dizzy"],
                "med_context": ["Paracetamol"]
            }
        )
        print(f"   Status Code: {response.status_code}")
        print(f"   Response: {json.dumps(response.json(), indent=2)}")
        if response.status_code == 401:
            print("   ✅ Correctly rejected request without token!")
            return True
        return False
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False

def test_add_symptom_missing_fields():
    """Test adding symptom with missing required fields"""
    print_section("2. Add Symptom (Missing Fields - No Token)")
    try:
        response = requests.post(
            f"{BASE_URL}/symptoms/add",
            json={
                "description": "Headache"
                # Missing user_id and intensity
            }
        )
        print(f"   Status Code: {response.status_code}")
        print(f"   Response: {json.dumps(response.json(), indent=2)}")
        if response.status_code in [400, 401]:
            print("   ✅ Correctly rejected invalid request!")
            return True
        return False
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False

def test_add_symptom_invalid_intensity():
    """Test adding symptom with invalid intensity"""
    print_section("3. Add Symptom (Invalid Intensity - No Token)")
    try:
        response = requests.post(
            f"{BASE_URL}/symptoms/add",
            json={
                "user_id": "test_user",
                "description": "Headache",
                "intensity": 15  # Invalid: should be 1-10
            }
        )
        print(f"   Status Code: {response.status_code}")
        print(f"   Response: {json.dumps(response.json(), indent=2)}")
        if response.status_code in [400, 401]:
            print("   ✅ Correctly rejected invalid intensity!")
            return True
        return False
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False

def test_get_symptoms_no_token():
    """Test getting symptoms without authentication token"""
    print_section("4. Get Symptoms (No Token)")
    try:
        response = requests.get(f"{BASE_URL}/symptoms/test_user")
        print(f"   Status Code: {response.status_code}")
        print(f"   Response: {json.dumps(response.json(), indent=2)}")
        if response.status_code == 401:
            print("   ✅ Correctly rejected request without token!")
            return True
        return False
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False

def main():
    print("\n" + "🤒" * 30)
    print("  Symptom Routes Test Suite")
    print("🤒" * 30)
    print("\n⚠️  Note: These tests check authentication and validation only.")
    print("   For full testing, use a valid Firebase ID token.\n")

    results = []

    results.append(("Add Symptom (No Token)", test_add_symptom_no_token()))
    results.append(("Add Symptom (Missing Fields)", test_add_symptom_missing_fields()))
    results.append(("Add Symptom (Invalid Intensity)", test_add_symptom_invalid_intensity()))
    results.append(("Get Symptoms (No Token)", test_get_symptoms_no_token()))

    # Summary
    print_section("Test Summary")
    for test_name, passed in results:
        status = "✅ PASSED" if passed else "❌ FAILED"
        print(f"   {test_name}: {status}")

    all_passed = all(result[1] for result in results)

    print("\n" + "=" * 60)
    if all_passed:
        print("✅ All authentication and validation tests passed!")
        print("\n💡 Next steps:")
        print("   1. Get Firebase ID token from React app after login")
        print("   2. Test endpoints with valid token using Postman/Thunder Client")
        print("   3. Verify data in MongoDB Atlas")
    else:
        print("❌ Some tests failed. Check the errors above.")
    print("=" * 60 + "\n")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⚠️  Tests interrupted by user")
    except Exception as e:
        print(f"\n\n❌ Unexpected error: {e}")

