import os
import sys
from typing import List, Dict, Any

# Ensure project root (which contains the `ml` package) is on sys.path
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
from routes.onboarding import onboarding_bp
from routes.medication_routes import medication_bp
from routes.symptom_routes import symptom_bp


app = Flask(__name__)
CORS(app)


app.register_blueprint(onboarding_bp)
app.register_blueprint(medication_bp)
app.register_blueprint(symptom_bp)


@app.get("/")
def home():
    return {"message": "MedAware Flask backend running"}


def _build_agent_prompt(payload: Dict[str, Any]) -> str:
    """Construct a structured prompt for the LLM (via OpenRouter).

    Includes recent symptoms, medications, and risk levels and asks for
    concise, friendly, actionable side‑effect advice.
    """
    user_id = payload.get("user_id") or "Unknown user"
    recent_symptoms: List[Dict[str, Any]] = payload.get("recent_symptoms") or []
    medications: List[Dict[str, Any]] = payload.get("medications") or []

    # Demo defaults if nothing is provided
    if not recent_symptoms:
        recent_symptoms = [
            {
                "description": "Headache and dizziness since this morning",
                "predicted_symptom": "dizziness",
                "risk": "MED",
            },
            {
                "description": "Mild chest tightness after walking up stairs",
                "predicted_symptom": "chest pain",
                "risk": "HIGH",
            },
        ]

    if not medications:
        medications = [
            {"name": "Metformin", "dosage": "500mg twice daily"},
            {"name": "Lisinopril", "dosage": "10mg once daily"},
        ]

    symptom_lines = [
        f"- {s.get('description', '')} "
        f"(model category: {s.get('predicted_symptom', 'unknown')}, "
        f"risk: {s.get('risk', 'LOW')})"
        for s in recent_symptoms
    ]
    med_lines = [
        f"- {m.get('name', 'Unknown')} – {m.get('dosage', '')}" for m in medications
    ]

    symptom_block = "\n".join(symptom_lines) or "- None reported"
    med_block = "\n".join(med_lines) or "- None reported"

    prompt = f"""
You are MedAware, a supportive clinical assistant helping patients understand possible
medication side effects and symptom risk. You are talking to a single user with id: {user_id}.

Recent symptoms:
{symptom_block}

Current medications:
{med_block}

Tasks:
- Briefly summarize what the pattern of symptoms might suggest, in user‑friendly language.
- Highlight any symptoms marked as HIGH risk in a calm but clear way.
- Suggest 2–3 next actions, such as: monitoring specific symptoms, logging more details,
  reviewing medication info, or contacting a clinician / emergency care when appropriate.
- Be concise (3–5 sentences), empathetic, and avoid making a formal diagnosis.
- Do NOT invent medications or change dosages; just give guidance and safety advice.

Return only the final user‑facing message, no bullet labels or meta‑commentary.
""".strip()

    return prompt


@app.route("/api/agent_response", methods=["POST"])
def agent_response():
    """Generate proactive agentic advice using Mistral via OpenRouter.

    Expects JSON payload with:
      - user_id: Firebase UID
      - recent_symptoms: list of {description, predicted_symptom, risk}
      - medications: list of {name, dosage}

    Returns:
      {
        "agent_message": "...",
        "highlighted_risks": ["symptom1", "symptom2", ...]
      }
    """
    try:
        payload = request.get_json(silent=True) or {}

        # Collect HIGH‑risk symptom categories for highlighting in the UI
        recent_symptoms: List[Dict[str, Any]] = payload.get("recent_symptoms") or []
        highlighted_risks = [
            s.get("predicted_symptom")
            for s in recent_symptoms
            if str(s.get("risk", "")).upper().startswith("HIGH")
        ]

        # Use OpenRouter API key (can still be stored in MISTRAL_API_KEY for now)
        openrouter_api_key = os.getenv("OPENROUTER_API_KEY") or os.getenv(
            "MISTRAL_API_KEY"
        )
        if not openrouter_api_key:
            return (
                jsonify(
                    {
                        "error": "OPENROUTER_API_KEY (or MISTRAL_API_KEY) is not configured on the server.",
                        "agent_message": "Our advanced agent is temporarily unavailable, but you can still review your logged symptoms and medications.",
                        "highlighted_risks": highlighted_risks,
                    }
                ),
                500,
            )

        prompt = _build_agent_prompt(payload)

        # Call Mistral model via OpenRouter chat completions API
        try:
            response = requests.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {openrouter_api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    # You can swap this for any compatible Mistral model on OpenRouter
                    "model": "mistralai/mistral-small",
                    "temperature": 0.7,
                    "max_tokens": 250,
                    "messages": [
                        {
                            "role": "system",
                            "content": "You are a supportive clinical assistant for the MedAware app.",
                        },
                        {"role": "user", "content": prompt},
                    ],
                },
                timeout=30,
            )
            response.raise_for_status()
        except requests.RequestException as exc:
            return (
                jsonify(
                    {
                        "error": f"OpenRouter API request failed: {exc}",
                        "agent_message": "I couldn't access our advanced analysis right now, but please continue to monitor your symptoms and contact a clinician if you feel worse.",
                        "highlighted_risks": highlighted_risks,
                    }
                ),
                502,
            )

        data = response.json()
        # Extract the assistant message text
        choice = (data.get("choices") or [{}])[0]
        message = (choice.get("message") or {}).get("content") or ""

        if not message:
            message = (
                "I've reviewed your symptoms and medications. Please keep tracking how "
                "you feel, pay attention to any worsening chest pain, severe dizziness, "
                "or trouble breathing, and reach out to a healthcare professional if "
                "you are concerned."
            )

        return jsonify(
            {
                "agent_message": message,
                "highlighted_risks": highlighted_risks,
            }
        )

    except Exception as exc:  # Catch-all safety net
        return (
            jsonify(
                {
                    "error": f"Unexpected error: {exc}",
                    "agent_message": "Something went wrong while generating advice. Please try again later or consult your clinician.",
                    "highlighted_risks": [],
                }
            ),
            500,
        )


if __name__ == "__main__":
    app.run(debug=True)

