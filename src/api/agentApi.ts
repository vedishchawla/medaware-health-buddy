export interface AgentSymptom {
  description: string;
  predicted_symptom: string;
  risk: string;
}

export interface AgentMedication {
  name: string;
  dosage: string;
}

export interface AgentRequestPayload {
  user_id?: string;
  recent_symptoms: AgentSymptom[];
  medications: AgentMedication[];
}

export async function getAgentAdvice(payload: AgentRequestPayload) {
  const response = await fetch("http://localhost:5000/api/agent_response", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Failed to get agent advice");
  }

  return response.json();
}


