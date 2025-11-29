"""Manual smoke test for /api/predict_symptom endpoint."""

import requests


def main():
    payload = {
        "symptom_text": "I am feeling very dizzy and lightheaded today",
    }
    response = requests.post("http://localhost:5000/api/predict_symptom", json=payload, timeout=60)
    print(response.json())


if __name__ == "__main__":
    main()

