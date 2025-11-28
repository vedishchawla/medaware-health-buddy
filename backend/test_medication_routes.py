"""
Test script for Medication Routes
Make sure Flask server is running: python app.py
"""

import requests
import json

BASE_URL = "http://localhost:5000"

def print_section(title):
    print("\n" + "=" * 60)
    print(f"  {title}")
    print("=" * 60)

def test_add_medication_no_token():
    """Test adding medication without authentication token"""
    print_section("1. Add Medication (No Token)")
    try:
        response = requests.post(
            f"{BASE_URL}/medications/add",
            json={
                "user_id": "test_user",
                "medication_name": "Paracetamol",
                "dosage": "500mg",
                "frequency": "Twice a day",
                "start_date": "2025-01-01",
                "notes": "After food"
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

def test_add_medication_missing_fields():
    """Test adding medication with missing required fields"""
    print_section("2. Add Medication (Missing Fields - No Token)")
    try:
        response = requests.post(
            f"{BASE_URL}/medications/add",
            json={
                "dosage": "500mg"
                # Missing user_id and medication_name
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

def test_get_medications_no_token():
    """Test getting medications without authentication token"""
    print_section("3. Get Medications (No Token)")
    try:
        response = requests.get(f"{BASE_URL}/medications/test_user")
        print(f"   Status Code: {response.status_code}")
        print(f"   Response: {json.dumps(response.json(), indent=2)}")
        if response.status_code == 401:
            print("   ✅ Correctly rejected request without token!")
            return True
        return False
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False

def test_update_medication_no_token():
    """Test updating medication without authentication token"""
    print_section("4. Update Medication (No Token)")
    try:
        response = requests.put(
            f"{BASE_URL}/medications/update/507f1f77bcf86cd799439011",
            json={
                "dosage": "1000mg"
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

def main():
    print("\n" + "💊" * 30)
    print("  Medication Routes Test Suite")
    print("💊" * 30)
    print("\n⚠️  Note: These tests check authentication only.")
    print("   For full testing, use a valid Firebase ID token.\n")

    results = []

    results.append(("Add Medication (No Token)", test_add_medication_no_token()))
    results.append(("Add Medication (Missing Fields)", test_add_medication_missing_fields()))
    results.append(("Get Medications (No Token)", test_get_medications_no_token()))
    results.append(("Update Medication (No Token)", test_update_medication_no_token()))

    # Summary
    print_section("Test Summary")
    for test_name, passed in results:
        status = "✅ PASSED" if passed else "❌ FAILED"
        print(f"   {test_name}: {status}")

    all_passed = all(result[1] for result in results)

    print("\n" + "=" * 60)
    if all_passed:
        print("✅ All authentication tests passed!")
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

