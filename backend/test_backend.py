"""
Quick Backend API Test Script
Make sure your Flask server is running before running this script.
Start server: python app.py
"""

import requests
import json

BASE_URL = "http://localhost:5000"

def print_section(title):
    print("\n" + "=" * 50)
    print(f"  {title}")
    print("=" * 50)

def test_health_check():
    print_section("1. Health Check Test")
    try:
        response = requests.get(f"{BASE_URL}/")
        print(f"   Status Code: {response.status_code}")
        print(f"   Response: {json.dumps(response.json(), indent=2)}")
        if response.status_code == 200:
            print("   ✅ Health check passed!")
            return True
        else:
            print("   ❌ Health check failed!")
            return False
    except requests.exceptions.ConnectionError:
        print("   ❌ Cannot connect to backend!")
        print("   💡 Make sure Flask server is running: python app.py")
        return False
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False

def test_onboarding_no_token():
    print_section("2. Onboarding Test (No Token)")
    try:
        response = requests.post(
            f"{BASE_URL}/onboarding",
            json={
                "age": 25,
                "gender": "female",
                "conditions": ["diabetes"],
                "allergies": ["penicillin"],
                "current_medications": ["Metformin"]
            }
        )
        print(f"   Status Code: {response.status_code}")
        print(f"   Response: {json.dumps(response.json(), indent=2)}")
        if response.status_code == 401:
            print("   ✅ Correctly rejected request without token!")
            return True
        else:
            print("   ⚠️  Unexpected response")
            return False
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False

def test_onboarding_invalid_token():
    print_section("3. Onboarding Test (Invalid Token)")
    try:
        response = requests.post(
            f"{BASE_URL}/onboarding",
            headers={"Authorization": "Bearer invalid_token_12345"},
            json={
                "age": 25,
                "gender": "female",
                "conditions": ["diabetes"],
                "allergies": ["penicillin"],
                "current_medications": ["Metformin"]
            }
        )
        print(f"   Status Code: {response.status_code}")
        print(f"   Response: {json.dumps(response.json(), indent=2)}")
        if response.status_code == 401:
            print("   ✅ Correctly rejected invalid token!")
            return True
        else:
            print("   ⚠️  Unexpected response")
            return False
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False

def main():
    print("\n" + "🚀" * 25)
    print("  MedAware Backend API Test Suite")
    print("🚀" * 25)
    
    results = []
    
    # Run tests
    results.append(("Health Check", test_health_check()))
    results.append(("No Token Test", test_onboarding_no_token()))
    results.append(("Invalid Token Test", test_onboarding_invalid_token()))
    
    # Summary
    print_section("Test Summary")
    for test_name, passed in results:
        status = "✅ PASSED" if passed else "❌ FAILED"
        print(f"   {test_name}: {status}")
    
    all_passed = all(result[1] for result in results)
    
    print("\n" + "=" * 50)
    if all_passed:
        print("✅ All basic tests passed!")
        print("\n💡 Next step: Test with a real Firebase ID token")
        print("   Get token from React app after login, then test manually")
    else:
        print("❌ Some tests failed. Check the errors above.")
    print("=" * 50 + "\n")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⚠️  Tests interrupted by user")
    except Exception as e:
        print(f"\n\n❌ Unexpected error: {e}")

