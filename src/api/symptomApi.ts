export async function predictSymptom(text: string) {
  const response = await fetch("http://localhost:5000/api/predict_symptom", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ symptom_text: text }),
  });

  if (!response.ok) {
    throw new Error("Failed to analyze symptom");
  }

  return response.json();
}

