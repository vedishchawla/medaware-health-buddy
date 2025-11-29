# 🚀 MedAware Quick Start Guide

## ⚡ Fast Setup (5 minutes)

### 1️⃣ Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
pip install -r requirements.txt

# Create .env file (if not exists)
# Add these lines:
# MONGO_URI="your_mongodb_connection_string"
# OPENROUTER_API_KEY="your_openrouter_key"

# Start server
python app.py
```

**✅ Backend running on:** `http://localhost:5000`

---

### 2️⃣ Frontend Setup

```bash
# From project root
npm install
npm run dev
```

**✅ Frontend running on:** `http://localhost:5173`

---

## 🧪 Quick Test Flow

### Step 1: Signup
- Go to: `http://localhost:5173/signup`
- Create account: `test@example.com` / `Test123!@#`

### Step 2: Onboarding
- Fill age, gender, conditions, allergies, medications
- Click "Complete Onboarding"

### Step 3: Log Medication
- Go to: `/log-medication`
- Add: `Paracetamol`, `500mg`, `Twice daily`

### Step 4: Log Symptom
- Go to: `/log-symptom`
- Add: `Headache`, Intensity: `7`

### Step 5: Test AI Assistant ⭐
- Go to: `/assistant`
- Type: `"I feel dizzy after taking paracetamol"`
- **Expected:**
  1. ClinicalBERT analysis (system message)
  2. Mistral LLM advice (AI message)
  3. Insights Panel (with risk, predictions, recent data)

---

## ✅ Success Indicators

**Backend:**
- ✅ Terminal shows: `MongoDB connection successful!`
- ✅ Terminal shows: `Running on http://127.0.0.1:5000`
- ✅ Browser `http://localhost:5000` returns: `{"message": "MedAware Flask backend running"}`

**Frontend:**
- ✅ Browser opens: `http://localhost:5173`
- ✅ No console errors
- ✅ Can navigate between pages

**AI Assistant:**
- ✅ ClinicalBERT shows risk analysis
- ✅ Mistral shows personalized advice
- ✅ Insights Panel shows data summary

---

## 🐛 Common Issues

| Issue | Solution |
|-------|----------|
| Backend won't start | Check Python version (3.8+), install requirements.txt |
| MongoDB connection failed | Verify MONGO_URI in .env, check IP whitelist |
| 502 on agent_response | Verify OPENROUTER_API_KEY in .env |
| CORS errors | Ensure backend is running on port 5000 |
| ClinicalBERT slow | First run downloads model (2-5 min), normal |

---

## 📋 Pre-Flight Checklist

Before testing, ensure:

- [ ] `backend/.env` exists with `MONGO_URI` and `OPENROUTER_API_KEY`
- [ ] `backend/serviceAccountKey.json` exists (Firebase Admin)
- [ ] `src/firebaseConfig.ts` has your Firebase credentials
- [ ] MongoDB Atlas cluster is running and accessible
- [ ] Backend dependencies installed (`pip install -r requirements.txt`)
- [ ] Frontend dependencies installed (`npm install`)

---

**Ready to test? Start with Step 1 above! 🎯**

