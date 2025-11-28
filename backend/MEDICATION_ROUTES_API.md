# 💊 Medication Routes API Documentation

## Overview

Medication routes for managing user medications in the MedAware application. All endpoints require Firebase authentication.

---

## 🔐 Authentication

All endpoints require a Firebase ID token in the Authorization header:

```
Authorization: Bearer <firebase_id_token>
```

---

## 📍 Endpoints

### 1. Add Medication

**POST** `/medications/add`

Add a new medication entry for the authenticated user.

**Request Body:**
```json
{
  "user_id": "firebase_user_uid",
  "medication_name": "Paracetamol",
  "dosage": "500mg",
  "frequency": "Twice a day",
  "start_date": "2025-01-01",
  "notes": "After food"
}
```

**Required Fields:**
- `user_id` (string) - Must match authenticated user's UID
- `medication_name` (string)

**Optional Fields:**
- `dosage` (string)
- `frequency` (string)
- `start_date` (string)
- `notes` (string)

**Success Response (201):**
```json
{
  "status": "success",
  "med_id": "507f1f77bcf86cd799439011"
}
```

**Error Responses:**
- `400` - Missing required fields
- `401` - Missing or invalid authentication token
- `403` - user_id doesn't match authenticated user
- `500` - Server error

---

### 2. Get User Medications

**GET** `/medications/<user_id>`

Retrieve all medications for a specific user.

**URL Parameters:**
- `user_id` (string) - Must match authenticated user's UID

**Success Response (200):**
```json
{
  "status": "success",
  "medications": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "user_id": "firebase_user_uid",
      "medication_name": "Paracetamol",
      "dosage": "500mg",
      "frequency": "Twice a day",
      "start_date": "2025-01-01",
      "notes": "After food",
      "created_at": "2025-01-01T10:00:00",
      "updated_at": "2025-01-01T10:00:00"
    }
  ],
  "count": 1
}
```

**Notes:**
- Medications are sorted by `created_at` (newest first)
- Returns empty array if user has no medications

**Error Responses:**
- `401` - Missing or invalid authentication token
- `403` - user_id doesn't match authenticated user
- `500` - Server error

---

### 3. Update Medication

**PUT** `/medications/update/<med_id>`

Update an existing medication entry.

**URL Parameters:**
- `med_id` (string) - MongoDB ObjectId of the medication

**Request Body (all fields optional):**
```json
{
  "medication_name": "Updated Name",
  "dosage": "1000mg",
  "frequency": "Once a day",
  "start_date": "2025-01-15",
  "notes": "Updated notes"
}
```

**Success Response (200):**
```json
{
  "status": "success",
  "message": "Medication updated successfully"
}
```

**Error Responses:**
- `400` - Invalid medication ID format or no fields to update
- `401` - Missing or invalid authentication token
- `403` - User doesn't have permission to update this medication
- `404` - Medication not found
- `500` - Server error

**Notes:**
- Only provided fields will be updated
- `updated_at` timestamp is automatically updated
- User can only update their own medications

---

## 🗄️ MongoDB Schema

**Collection:** `medications`

**Document Structure:**
```json
{
  "_id": ObjectId("..."),
  "user_id": "firebase_user_uid",
  "medication_name": "Paracetamol",
  "dosage": "500mg",
  "frequency": "Twice a day",
  "start_date": "2025-01-01",
  "notes": "After food",
  "created_at": ISODate("2025-01-01T10:00:00Z"),
  "updated_at": ISODate("2025-01-01T10:00:00Z")
}
```

---

## 🧪 Testing

### Using Postman/Thunder Client

1. **Get Firebase ID Token:**
   - Login to React app
   - Open browser console
   - Run: `await auth.currentUser?.getIdToken()`
   - Copy the token

2. **Test Add Medication:**
   ```
   POST http://localhost:5000/medications/add
   Headers:
     Authorization: Bearer <your_token>
     Content-Type: application/json
   Body:
     {
       "user_id": "<your_firebase_uid>",
       "medication_name": "Paracetamol",
       "dosage": "500mg",
       "frequency": "Twice a day",
       "start_date": "2025-01-01",
       "notes": "After food"
     }
   ```

3. **Test Get Medications:**
   ```
   GET http://localhost:5000/medications/<your_firebase_uid>
   Headers:
     Authorization: Bearer <your_token>
   ```

4. **Test Update Medication:**
   ```
   PUT http://localhost:5000/medications/update/<med_id>
   Headers:
     Authorization: Bearer <your_token>
     Content-Type: application/json
   Body:
     {
       "dosage": "1000mg"
     }
   ```

### Using Test Script

```bash
cd backend
python test_medication_routes.py
```

---

## ✅ Features

- ✅ Firebase authentication required
- ✅ User can only access their own medications
- ✅ Automatic timestamp management (created_at, updated_at)
- ✅ ObjectId to string conversion for JSON responses
- ✅ Input validation
- ✅ Error handling
- ✅ CORS enabled

---

## 📝 Notes

- All timestamps are stored in UTC
- Medication IDs are MongoDB ObjectIds (converted to strings in responses)
- User must be authenticated to access any endpoint
- User can only view/update their own medications

