import os
import sys

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from flask import Flask
from flask_cors import CORS
from routes.onboarding import onboarding_bp
from routes.medication_routes import medication_bp
from routes.symptom_routes import symptom_bp


app = Flask(__name__)
CORS(app)


app.register_blueprint(onboarding_bp)
app.register_blueprint(medication_bp)
app.register_blueprint(symptom_bp, url_prefix="/api")


@app.get("/")
def home():
    return {"message": "MedAware Flask backend running"}


if __name__ == "__main__":
    app.run(debug=True)

