# 🤒 Symptom Routes API Documentation

## Overview

Symptom routes for logging and retrieving user symptoms in the MedAware application. All endpoints require Firebase authentication.

---

## 🔐 Authentication

All endpoints require a Firebase ID token in the Authorization header:

```
Authorization: Bearer <firebase_id_token>
```

---

## 📍 Endpoints

### 1. Add Symptom

**POST** `/symptoms/add`

Add a new symptom entry for the authenticated user.

**Request Body:**
```json
{
  "user_id": "firebase_user_uid",
  "description": "Headache and dizziness",
  "intensity": 7,
  "tags": ["headache", "dizzy"],
  "med_context": ["Paracetamol"]
}
```

**Required Fields:**
- `user_id` (string) - Must match authenticated user's UID
- `description` (string) - Description of the symptom
- `intensity` (integer) - Intensity level from 1-10

**Optional Fields:**
- `tags` (array of strings) - Tags to categorize the symptom
- `med_context` (array of strings) - Current medications context

**Validation Rules:**
- `intensity` must be between 1 and 10
- `tags` must be an array if provided
- `med_context` must be an array if provided

**Success Response (201):**
```json
{
  "status": "success",
  "symptom_id": "507f1f77bcf86cd799439011"
}
```

**Error Responses:**
- `400` - Missing required fields or invalid input
- `401` - Missing or invalid authentication token
- `403` - user_id doesn't match authenticated user
- `500` - Server error

**Example Error (400):**
```json
{
  "error": "intensity must be between 1 and 10"
}
```

---

### 2. Get User Symptoms

**GET** `/symptoms/<user_id>`

Retrieve all symptoms for a specific user.

**URL Parameters:**
- `user_id` (string) - Must match authenticated user's UID

**Success Response (200):**
```json
{
  "status": "success",
  "symptoms": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "user_id": "firebase_user_uid",
      "description": "Headache and dizziness",
      "intensity": 7,
      "tags": ["headache", "dizzy"],
      "med_context": ["Paracetamol"],
      "created_at": "2025-01-01T10:00:00"
    }
  ],
  "count": 1
}
```

**Notes:**
- Symptoms are sorted by `created_at` (newest first)
- Returns empty array if user has no symptoms
- All ObjectIds are converted to strings

**Error Responses:**
- `401` - Missing or invalid authentication token
- `403` - user_id doesn't match authenticated user
- `500` - Server error

---

## 🗄️ MongoDB Schema

**Collection:** `symptoms`

**Document Structure:**
```json
{
  "_id": ObjectId("..."),
  "user_id": "firebase_user_uid",
  "description": "Headache and dizziness",
  "intensity": 7,
  "tags": ["headache", "dizzy"],
  "med_context": ["Paracetamol"],
  "created_at": ISODate("2025-01-01T10:00:00Z")
}
```

**Field Descriptions:**
- `_id`: MongoDB ObjectId (converted to string in responses)
- `user_id`: Firebase user UID
- `description`: Text description of the symptom
- `intensity`: Integer from 1-10 indicating severity
- `tags`: Array of strings for categorization
- `med_context`: Array of strings listing relevant medications
- `created_at`: Timestamp when symptom was logged (UTC)

---

## 🧪 Testing

### Using Postman/Thunder Client

1. **Get Firebase ID Token:**
   - Login to React app
   - Open browser console
   - Run: `await auth.currentUser?.getIdToken()`
   - Copy the token

2. **Test Add Symptom:**
   ```
   POST http://localhost:5000/symptoms/add
   Headers:
     Authorization: Bearer <your_token>
     Content-Type: application/json
   Body:
     {
       "user_id": "<your_firebase_uid>",
       "description": "Headache and dizziness",
       "intensity": 7,
       "tags": ["headache", "dizzy"],
       "med_context": ["Paracetamol"]
     }
   ```

3. **Test Get Symptoms:**
   ```
   GET http://localhost:5000/symptoms/<your_firebase_uid>
   Headers:
     Authorization: Bearer <your_token>
   ```

### Using Test Script

```bash
cd backend
python test_symptom_routes.py
```

---

## ✅ Features

- ✅ Firebase authentication required
- ✅ User can only access their own symptoms
- ✅ Automatic timestamp management (created_at)
- ✅ ObjectId to string conversion for JSON responses
- ✅ Input validation (intensity range, array types)
- ✅ Error handling with descriptive messages
- ✅ CORS enabled
- ✅ Clean JSON responses

---

## 📝 Validation Rules

### Intensity
- Must be an integer
- Must be between 1 and 10 (inclusive)
- Error message: "intensity must be between 1 and 10"

### Tags
- Optional field
- Must be an array if provided
- Can contain any strings

### Med Context
- Optional field
- Must be an array if provided
- Typically contains medication names

### Description
- Required field
- Must be a non-empty string
- Whitespace is trimmed

---

## 🔍 Example Use Cases

### Logging a Simple Symptom
```json
{
  "user_id": "abc123",
  "description": "Mild headache",
  "intensity": 3
}
```

### Logging with Full Context
```json
{
  "user_id": "abc123",
  "description": "Severe headache with nausea after taking medication",
  "intensity": 8,
  "tags": ["headache", "nausea", "medication-related"],
  "med_context": ["Paracetamol 500mg", "Ibuprofen 200mg"]
}
```

---

## 🚨 Error Handling

All errors return JSON with an `error` field:

```json
{
  "error": "Description of what went wrong"
}
```

Common errors:
- Missing required fields → 400
- Invalid intensity value → 400
- Invalid array types → 400
- Authentication failure → 401
- User ID mismatch → 403
- Server errors → 500

---

## 📊 Notes

- All timestamps are stored in UTC
- Symptom IDs are MongoDB ObjectIds (converted to strings in responses)
- User must be authenticated to access any endpoint
- User can only view their own symptoms
- Symptoms are sorted by creation date (newest first)

