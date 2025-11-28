# 🧪 MedAware Backend Testing Guide

## 📋 Prerequisites Checklist

Before testing, ensure you have:

- [ ] MongoDB Atlas account and cluster created
- [ ] `.env` file in `backend/` folder with `MONGO_URI=your_connection_string`
- [ ] `serviceAccountKey.json` in `backend/` folder (Firebase Admin SDK)
- [ ] Python 3 installed
- [ ] All dependencies installed

---

## 🚀 Step-by-Step Testing

### **STEP 1: Install Dependencies**

```bash
cd backend
pip install -r requirements.txt
```

**Expected Output:** All packages installed successfully

---

### **STEP 2: Verify .env File**

Check that your `.env` file exists in `backend/` folder:

```bash
# Windows PowerShell
Get-Content .env

# Or check manually
# .env should contain:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/
```

**Expected:** Your MongoDB connection string is visible

---

### **STEP 3: Test MongoDB Connection**

Create a test script to verify MongoDB connection:

```python
# test_db.py (create this file temporarily)
from utils.db import db
from config import MONGO_URI

print(f"Connecting to MongoDB...")
print(f"URI: {MONGO_URI[:20]}...")  # Show first 20 chars only

try:
    # Test connection
    db.command('ping')
    print("✅ MongoDB connection successful!")
    print(f"Database name: {db.name}")
except Exception as e:
    print(f"❌ MongoDB connection failed: {e}")
```

Run it:
```bash
python test_db.py
```

**Expected Output:** `✅ MongoDB connection successful!`

---

### **STEP 4: Start Flask Backend**

```bash
python app.py
```

**Expected Output:**
```
 * Running on http://127.0.0.1:5000
 * Debug mode: on
```

---

### **STEP 5: Test Backend Health Check**

Open browser or use curl:

```bash
# Browser
http://localhost:5000/

# Or curl
curl http://localhost:5000/
```

**Expected Response:**
```json
{
  "message": "MedAware Flask backend running"
}
```

---

### **STEP 6: Test Firebase Authentication (Manual)**

You need a Firebase ID token. Get it from your React app:

1. Start your React app: `npm run dev`
2. Login/Signup in the app
3. Open browser DevTools (F12) → Console
4. Run this in console:
```javascript
// Get Firebase ID token
const { getIdToken } = useAuth();
// Or directly:
import { auth } from './firebaseConfig';
const token = await auth.currentUser?.getIdToken();
console.log(token);
```

Copy the token.

---

### **STEP 7: Test Onboarding Endpoint (Using Postman/Thunder Client)**

**Request:**
- **Method:** POST
- **URL:** `http://localhost:5000/onboarding`
- **Headers:**
  ```
  Content-Type: application/json
  Authorization: Bearer YOUR_FIREBASE_ID_TOKEN_HERE
  ```
- **Body (JSON):**
  ```json
  {
    "age": 25,
    "gender": "female",
    "conditions": ["diabetes", "hypertension"],
    "allergies": ["penicillin"],
    "current_medications": ["Metformin 500mg"]
  }
  ```

**Expected Response (200 OK):**
```json
{
  "message": "Onboarding data stored successfully"
}
```

**If Error (401):**
```json
{
  "error": "Missing Authorization header"
}
```
or
```json
{
  "error": "Invalid or expired token"
}
```

---

### **STEP 8: Verify Data in MongoDB Atlas**

1. Go to MongoDB Atlas Dashboard
2. Navigate to: **Browse Collections**
3. Database: `medaware`
4. Collection: `users`
5. You should see a document like:
   ```json
   {
     "_id": ObjectId("..."),
     "uid": "firebase_user_uid_here",
     "profile": {
       "uid": "firebase_user_uid_here",
       "age": 25,
       "gender": "female",
       "conditions": ["diabetes", "hypertension"],
       "allergies": ["penicillin"],
       "current_medications": ["Metformin 500mg"]
     }
   }
   ```

---

### **STEP 9: Test Full Flow from React App**

1. **Start Backend:**
   ```bash
   cd backend
   python app.py
   ```

2. **Start Frontend:**
   ```bash
   npm run dev
   ```

3. **Test Flow:**
   - Go to `http://localhost:8080/signup` (or your dev port)
   - Create an account (email or Google)
   - You'll be redirected to `/onboarding`
   - Fill out the form:
     - Age: 25
     - Gender: Select from dropdown
     - Conditions: `diabetes, hypertension` (comma-separated)
     - Allergies: `penicillin`
     - Medications: `Metformin 500mg`
   - Click "Save & Continue"
   - Check browser console for any errors
   - Verify data appears in MongoDB Atlas

---

## 🔍 Troubleshooting

### **Issue: MongoDB Connection Failed**

**Check:**
- MongoDB Atlas IP whitelist includes `0.0.0.0/0` (or your IP)
- Connection string is correct in `.env`
- Network connectivity

**Fix:**
```python
# Test connection manually
from pymongo import MongoClient
client = MongoClient("your_connection_string")
client.server_info()  # Should not throw error
```

---

### **Issue: Firebase Token Invalid**

**Check:**
- `serviceAccountKey.json` is in `backend/` folder
- Token is not expired (tokens expire after 1 hour)
- Token is from the same Firebase project

**Fix:**
- Get a fresh token from React app
- Verify Firebase project ID matches

---

### **Issue: CORS Error**

**Check:**
- Flask-CORS is installed
- Backend is running on port 5000
- Frontend is making requests to correct URL

**Fix:**
```python
# In app.py, CORS should be enabled
CORS(app)  # Allows all origins in development
```

---

### **Issue: Data Not Appearing in MongoDB**

**Check:**
- Check backend console for errors
- Verify `upsert=True` is working
- Check MongoDB Atlas filters (might be filtering results)

**Fix:**
```python
# Add logging in onboarding.py
print(f"Storing data for UID: {uid}")
print(f"Data: {profile_data}")
```

---

## ✅ Success Criteria

You've successfully tested when:

- ✅ Backend starts without errors
- ✅ Health check returns success
- ✅ MongoDB connection works
- ✅ Firebase token verification works
- ✅ Onboarding endpoint saves data
- ✅ Data appears in MongoDB Atlas
- ✅ Full flow works from React app

---

## 📝 Quick Test Script

Save this as `test_backend.py` in backend folder:

```python
import requests
import json

# Test 1: Health check
print("1. Testing health check...")
response = requests.get("http://localhost:5000/")
print(f"   Status: {response.status_code}")
print(f"   Response: {response.json()}\n")

# Test 2: Onboarding (without token - should fail)
print("2. Testing onboarding without token...")
response = requests.post(
    "http://localhost:5000/onboarding",
    json={"age": 25, "gender": "female"}
)
print(f"   Status: {response.status_code}")
print(f"   Response: {response.json()}\n")

# Test 3: Onboarding (with invalid token - should fail)
print("3. Testing onboarding with invalid token...")
response = requests.post(
    "http://localhost:5000/onboarding",
    headers={"Authorization": "Bearer invalid_token"},
    json={"age": 25, "gender": "female"}
)
print(f"   Status: {response.status_code}")
print(f"   Response: {response.json()}\n")

print("✅ Basic tests completed!")
print("⚠️  For full test, use a valid Firebase ID token")
```

Run: `python test_backend.py`

