from flask import Flask
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


if __name__ == "__main__":
    app.run(debug=True)

