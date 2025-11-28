from flask import Flask
from flask_cors import CORS
from routes.onboarding import onboarding_bp


app = Flask(__name__)
CORS(app)


app.register_blueprint(onboarding_bp)


@app.get("/")
def home():
    return {"message": "MedAware Flask backend running"}


if __name__ == "__main__":
    app.run(debug=True)

