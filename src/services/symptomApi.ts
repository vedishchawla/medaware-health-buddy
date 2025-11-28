/**
 * Symptom API Service
 * Handles all API calls to the symptom backend endpoints
 */

const API_BASE_URL = "http://localhost:5000";

interface Symptom {
  _id?: string;
  user_id: string;
  description: string;
  intensity: number;
  tags?: string[];
  med_context?: string[];
  created_at?: string;
}

interface AddSymptomRequest {
  user_id: string;
  description: string;
  intensity: number;
  tags?: string[];
  med_context?: string[];
}

interface AddSymptomResponse {
  status: string;
  symptom_id: string;
}

interface GetSymptomsResponse {
  status: string;
  symptoms: Symptom[];
  count: number;
}

/**
 * Add a new symptom
 */
export const addSymptom = async (
  token: string,
  data: AddSymptomRequest
): Promise<AddSymptomResponse> => {
  const response = await fetch(`${API_BASE_URL}/symptoms/add`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to add symptom");
  }

  return response.json();
};

/**
 * Get all symptoms for a user
 */
export const getSymptoms = async (
  token: string,
  userId: string
): Promise<Symptom[]> => {
  const response = await fetch(`${API_BASE_URL}/symptoms/${userId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch symptoms");
  }

  const data: GetSymptomsResponse = await response.json();
  return data.symptoms;
};

export type { Symptom, AddSymptomRequest };

