const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: "include", // Important: send cookies with every request
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Erreur serveur" }))
    throw new Error(error.error || error.message || "Erreur serveur")
  }

  return response.json()
}

export interface Machine {
  id: number
  marque: string
  modele: string
  numeroSerie: string | null
  defaut: string
  photoUrl: string | null
  rendezVous: string
  statut: "EN_ATTENTE" | "EN_COURS" | "TERMINE" | "ANOMALIE" | "PAYE" | "REMIS_AU_CLIENT"
  montant: number | null
  paye: boolean
  remarqueTechnicien: string | null
  dateRemise: string | null
  datePaiement: string | null
  createdAt: string
  updatedAt: string
  client: {
    id: number
    nom: string
    prenom: string
  }
  technicien: {
    id: number
    nom: string
    prenom: string
  } | null
}

export async function getClientMachines(clientId: number): Promise<Machine[]> {
  return apiRequest<Machine[]>(`/api/auth/client/${clientId}/machines`)
}

export async function changePassword(
  oldPassword: string,
  newPassword: string,
  confirmPassword: string
): Promise<{ message: string }> {
  return apiRequest("/api/auth/client/change-password", {
    method: "POST",
    body: JSON.stringify({ oldPassword, newPassword, confirmPassword }),
  })
}


// export async function getClientInfo(clientId: number) {
//   return apiRequest(`/api/auth/client/${clientId}`)
// }

export async function getClientInfo() {
  return apiRequest("/api/auth/client/me")
}


// Admin-specific endpoints
export async function getAllClients() {
  return apiRequest(`/api/auth/admin/clients`)
}

export async function getAllMachines(): Promise<Machine[]> {
  return apiRequest<Machine[]>(`/api/auth/admin/machines`)
}
