/**
 * Medication API Service
 * Handles all API calls to the medication backend endpoints
 */

const API_BASE_URL = "http://localhost:5000";

interface Medication {
  _id?: string;
  user_id: string;
  medication_name: string;
  dosage: string;
  frequency: string;
  start_date: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

interface AddMedicationRequest {
  user_id: string;
  medication_name: string;
  dosage: string;
  frequency: string;
  start_date: string;
  notes?: string;
}

interface AddMedicationResponse {
  status: string;
  med_id: string;
}

interface GetMedicationsResponse {
  status: string;
  medications: Medication[];
  count: number;
}

interface UpdateMedicationRequest {
  medication_name?: string;
  dosage?: string;
  frequency?: string;
  start_date?: string;
  notes?: string;
}

/**
 * Add a new medication
 */
export const addMedication = async (
  token: string,
  data: AddMedicationRequest
): Promise<AddMedicationResponse> => {
  const response = await fetch(`${API_BASE_URL}/medications/add`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to add medication");
  }

  return response.json();
};

/**
 * Get all medications for a user
 */
export const getMedications = async (
  token: string,
  userId: string
): Promise<Medication[]> => {
  const response = await fetch(`${API_BASE_URL}/medications/${userId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch medications");
  }

  const data: GetMedicationsResponse = await response.json();
  return data.medications;
};

/**
 * Update a medication
 */
export const updateMedication = async (
  token: string,
  medId: string,
  data: UpdateMedicationRequest
): Promise<{ status: string; message: string }> => {
  const response = await fetch(`${API_BASE_URL}/medications/update/${medId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update medication");
  }

  return response.json();
};

export type { Medication, AddMedicationRequest, UpdateMedicationRequest };

