# 🧪 MedAware Complete Testing Guide

This guide walks you through testing the entire MedAware project from start to finish.

---

## 📋 Prerequisites Checklist

Before starting, ensure you have:

- ✅ **Node.js** (v18+) and **npm** installed
- ✅ **Python 3.8+** installed
- ✅ **MongoDB Atlas** account with connection string
- ✅ **Firebase** project with:
  - Authentication enabled (Email/Password + Google)
  - Service account key (`serviceAccountKey.json`) in `backend/` folder
- ✅ **OpenRouter API Key** (for Mistral LLM)

---

## 🔧 Step 1: Backend Setup

### 1.1 Install Python Dependencies

```bash
cd backend
pip install -r requirements.txt
```

**Expected output:** All packages installed successfully (Flask, PyMongo, Firebase Admin, Transformers, etc.)

### 1.2 Configure Environment Variables

Create/update `backend/.env` file:

```env
MONGO_URI="mongodb+srv://username:password@cluster.mongodb.net/?appName=Cluster0"
OPENROUTER_API_KEY="sk-or-v1-..."
```

**Note:** Replace with your actual MongoDB connection string and OpenRouter API key.

### 1.3 Verify Firebase Service Account

Ensure `backend/serviceAccountKey.json` exists and contains your Firebase service account credentials.

### 1.4 Start Backend Server

```bash
cd backend
python app.py
```

**Expected output:**
```
MongoDB connection successful!
 * Running on http://127.0.0.1:5000
```

**Test backend is running:**
- Open browser: `http://localhost:5000`
- Should see: `{"message": "MedAware Flask backend running"}`

---

## 🎨 Step 2: Frontend Setup

### 2.1 Install Node Dependencies

```bash
# From project root
npm install
```

**Expected output:** All packages installed (React, Firebase, React Router, etc.)

### 2.2 Verify Firebase Configuration

Check `src/firebaseConfig.ts` has your Firebase project credentials.

### 2.3 Start Frontend Development Server

```bash
npm run dev
```

**Expected output:**
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

**Open browser:** `http://localhost:5173`

---

## 🧪 Step 3: Complete Testing Flow

### ✅ Test 1: Authentication (Signup/Login)

#### 3.1.1 User Signup

1. Navigate to: `http://localhost:5173/signup`
2. Fill in:
   - Email: `test@example.com`
   - Password: `Test123!@#`
3. Click **"Sign Up"**

**Expected:**
- ✅ Redirects to `/onboarding`
- ✅ User is authenticated
- ✅ Firebase creates user account

#### 3.1.2 Google Sign-In (Optional)

1. Click **"Sign in with Google"**
2. Select Google account

**Expected:**
- ✅ Redirects to `/onboarding` or `/dashboard`
- ✅ User authenticated via Google

#### 3.1.3 User Login

1. Navigate to: `http://localhost:5173/login`
2. Enter credentials from signup
3. Click **"Login"**

**Expected:**
- ✅ Redirects to `/dashboard`
- ✅ User session maintained

---

### ✅ Test 2: Onboarding

1. After signup, you should be on `/onboarding`
2. Fill in:
   - **Age:** `25`
   - **Gender:** `Male` or `Female`
   - **Conditions:** Select `Diabetes` (or add custom)
   - **Allergies:** Select `Penicillin` (or add custom)
   - **Current Medications:** `Metformin 500mg`
3. Click **"Complete Onboarding"**

**Expected:**
- ✅ Success message displayed
- ✅ Redirects to `/dashboard`
- ✅ Data saved to MongoDB (`medaware.users` collection)

**Backend Check:**
```bash
# In MongoDB Atlas, check:
db.users.find({ uid: "firebase_user_id" })
```

---

### ✅ Test 3: Medication Logging

1. Navigate to: `/log-medication` (or click from sidebar)
2. Fill in:
   - **Medication Name:** `Paracetamol`
   - **Dosage:** `500mg`
   - **Frequency:** `Twice a day`
   - **Start Date:** Today's date
   - **Notes:** `After food`
3. Click **"Add Medication"**

**Expected:**
- ✅ Success toast notification
- ✅ Medication added to database
- ✅ Redirects to dashboard or shows in list

**Backend Check:**
```bash
# In MongoDB Atlas:
db.medications.find({ user_id: "firebase_user_id" })
```

**API Test (Optional):**
```bash
curl -X GET http://localhost:5000/medications/{user_id} \
  -H "Authorization: Bearer {firebase_id_token}"
```

---

### ✅ Test 4: Symptom Logging

1. Navigate to: `/log-symptom` (or click from sidebar)
2. Fill in:
   - **Description:** `Headache and dizziness since morning`
   - **Intensity:** `7` (on scale 1-10)
   - **Tags:** `headache`, `dizzy`
   - **Medication Context:** Select `Paracetamol` (if logged)
3. Click **"Log Symptom"`

**Expected:**
- ✅ Success toast notification
- ✅ Symptom saved to database
- ✅ Appears in dashboard/insights

**Backend Check:**
```bash
# In MongoDB Atlas:
db.symptoms.find({ user_id: "firebase_user_id" })
```

---

### ✅ Test 5: AI Assistant (Complete Flow)

This is the **main feature** with ClinicalBERT + Mistral + Insights Panel.

#### 5.1 Navigate to AI Assistant

1. Go to: `/assistant` (or click "AI Assistant" in sidebar)
2. You should see the chat interface

#### 5.2 Send a Symptom Message

Type in chat input:
```
I feel dizzy after taking paracetamol
```

Click **Send** or press Enter.

#### 5.3 Expected Response Flow

**Step 1: ClinicalBERT Analysis (System Message)**
- ⚕️ Loading: "Analyzing symptoms..."
- Then shows:
  ```
  ⚠️ High-risk pattern detected. 🧠 ClinicalBERT suggestions: 
  dizziness (0.85, risk: HIGH), headache (0.42, risk: MEDIUM), 
  chest pain (0.31, risk: HIGH). These are not diagnoses, but 
  patterns you may want to discuss with your clinician.
  ```

**Step 2: Mistral LLM Advice (AI Message)**
- 🤖 Loading: "Generating advice..."
- Then shows personalized advice like:
  ```
  I understand your concern. Based on your medication history 
  and the symptoms you've described, this could be related to 
  the recent changes in your dosage. I recommend monitoring 
  this closely...
  ```

**Step 3: Insights Panel (System Message)**
- Shows a card with:
  - 🧠 **Predicted pattern:** `dizziness`
  - ⚠️ **Risk level:** `HIGH RISK` (red badge)
  - **Top signals:** `dizziness (0.85), headache (0.42), chest pain (0.31)`
  - 📝 **Recent symptoms:** Last 5 symptoms from your log
  - 💊 **Related medications:** Medications you've logged

#### 5.4 Verify Backend Logs

Check backend terminal for:
```
127.0.0.1 - - [...] "POST /api/predict_symptom HTTP/1.1" 200 -
127.0.0.1 - - [...] "POST /api/agent_response HTTP/1.1" 200 -
```

#### 5.5 Verify MongoDB Predictions

```bash
# In MongoDB Atlas:
db.symptom_predictions.find({ user_id: "firebase_user_id" })
```

Should show:
```json
{
  "user_id": "...",
  "text": "I feel dizzy after taking paracetamol",
  "predictions": [
    { "label": "dizziness", "score": 0.85, "risk": "HIGH" },
    ...
  ],
  "overall_risk": "HIGH",
  "created_at": ISODate("...")
}
```

---

### ✅ Test 6: Dashboard & Insights

1. Navigate to: `/dashboard`
2. Check:
   - ✅ Recent medications displayed
   - ✅ Recent symptoms displayed
   - ✅ Charts/graphs (if implemented)

3. Navigate to: `/insights`
4. Check:
   - ✅ Symptom trends
   - ✅ Medication history
   - ✅ Risk patterns

---

### ✅ Test 7: Protected Routes

1. **Logout:**
   - Click logout button
   - Should redirect to `/login`

2. **Try accessing protected routes:**
   - `/dashboard` → Should redirect to `/login`
   - `/assistant` → Should redirect to `/login`
   - `/log-medication` → Should redirect to `/login`

3. **Login again:**
   - Should restore access to all protected routes

---

## 🐛 Troubleshooting

### Backend Issues

**Problem:** `ModuleNotFoundError: No module named 'ml.clinicalbert_service'`
- **Solution:** Ensure you're running from `backend/` directory and `ml/` folder exists at project root

**Problem:** `MongoDB connection failed`
- **Solution:** 
  - Check `.env` file has correct `MONGO_URI`
  - Verify MongoDB Atlas IP whitelist includes your IP
  - Check username/password encoding in connection string

**Problem:** `502 Bad Gateway` on `/api/agent_response`
- **Solution:**
  - Verify `OPENROUTER_API_KEY` in `.env`
  - Check OpenRouter API key is valid
  - Ensure backend can reach `https://openrouter.ai`

**Problem:** `Firebase Admin SDK error`
- **Solution:**
  - Verify `serviceAccountKey.json` exists in `backend/`
  - Check service account has proper permissions

### Frontend Issues

**Problem:** `Firebase: Error (auth/invalid-api-key)`
- **Solution:** Update `src/firebaseConfig.ts` with correct Firebase credentials

**Problem:** `CORS error` when calling backend
- **Solution:** 
  - Ensure backend is running on `http://localhost:5000`
  - Check `Flask-CORS` is installed and enabled in `app.py`

**Problem:** `Failed to analyze symptom`
- **Solution:**
  - Check backend is running
  - Verify ClinicalBERT model downloads correctly (first run may take time)
  - Check browser console for detailed error

**Problem:** Insights Panel not showing
- **Solution:**
  - Check browser console for errors
  - Verify `getSymptoms` and `getMedications` API calls succeed
  - Ensure user is logged in and has data

---

## 📊 Expected Database Collections

After complete testing, MongoDB should have:

1. **`users`** - User profiles from onboarding
2. **`medications`** - Logged medications
3. **`symptoms`** - Logged symptoms
4. **`symptom_predictions`** - ClinicalBERT predictions from chat

---

## ✅ Final Checklist

- [ ] Backend runs without errors
- [ ] Frontend runs without errors
- [ ] User can signup/login
- [ ] Onboarding data saves to MongoDB
- [ ] Medications can be logged
- [ ] Symptoms can be logged
- [ ] AI Assistant shows ClinicalBERT analysis
- [ ] AI Assistant shows Mistral LLM advice
- [ ] AI Assistant shows Insights Panel
- [ ] Protected routes redirect when logged out
- [ ] All API calls return 200 status codes

---

## 🎯 Quick Test Commands

```bash
# Backend health check
curl http://localhost:5000/

# Test ClinicalBERT (requires symptom_text)
curl -X POST http://localhost:5000/api/predict_symptom \
  -H "Content-Type: application/json" \
  -d '{"symptom_text": "I have a headache"}'

# Frontend health check
curl http://localhost:5173/
```

---

## 📝 Notes

- **First run:** ClinicalBERT model download may take 2-5 minutes
- **API Keys:** Never commit `.env` or `serviceAccountKey.json` to git
- **Development:** Backend runs in debug mode (auto-reload on changes)
- **Production:** Use environment variables and disable debug mode

---

**Happy Testing! 🚀**

