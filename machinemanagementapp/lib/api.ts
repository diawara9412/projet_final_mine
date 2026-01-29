const API_BASE_URL = "http://localhost:8080/api"

export interface User {
  id: number
  nom: string
  prenom: string
  adresse: string
  numero: string
  email: string
  role: "ADMIN" | "SECRETAIRE" | "TECHNICIEN"
  active: boolean
}

export interface Client {
  id: number
  nom: string
  prenom: string
  adresse: string
  numero: string
  email?: string
  autres?: string
  createdAt: string
}

export interface Machine {
  id: number
  marque: string
  modele: string
  numeroSerie?: string
  defaut: string
  photoUrl?: string
  rendezVous: string
  statut: "EN_COURS" | "TERMINE" | "ANOMALIE" | "EN_ATTENTE"
  montant?: number
  paye: boolean
  remarqueTechnicien?: string
  client: Client
  secretaire: User
  technicien?: User
  createdAt: string
  updatedAt: string
}

export interface DashboardStats {
  totalMachines: number
  totalClients: number
  totalUsers: number
  enCours: number
  termine: number
  anomalie: number
  enAttente: number
}

const fetchWithAuth = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  }

  return fetch(url, {
    ...options,
    headers,
    credentials: "include", // Important: send cookies with every request
  })
}

// Auth
export const login = async (email: string, password: string) => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include", // Important: receive cookies
    body: JSON.stringify({ email, password }),
  })
  if (!response.ok) throw new Error(await response.text())
  return response.json()
}

// Users
export const getUsers = async (): Promise<User[]> => {
  const response = await fetchWithAuth(`${API_BASE_URL}/users`)
  if (!response.ok) throw new Error("Failed to fetch users")
  return response.json()
}

export const getUsersByRole = async (role: string): Promise<User[]> => {
  const response = await fetchWithAuth(`${API_BASE_URL}/users/role/${role}`)
  if (!response.ok) throw new Error("Failed to fetch users")
  return response.json()
}

export const createUser = async (data: any): Promise<User> => {
  const response = await fetchWithAuth(`${API_BASE_URL}/users`, {
    method: "POST",
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error(await response.text())
  return response.json()
}

export const updateUser = async (id: number, data: any): Promise<User> => {
  const response = await fetchWithAuth(`${API_BASE_URL}/users/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error(await response.text())
  return response.json()
}

export const deleteUser = async (id: number): Promise<void> => {
  const response = await fetchWithAuth(`${API_BASE_URL}/users/${id}`, {
    method: "DELETE",
  })
  if (!response.ok) throw new Error(await response.text())
}

// Clients
export const getClients = async (): Promise<Client[]> => {
  const response = await fetchWithAuth(`${API_BASE_URL}/clients`)
  if (!response.ok) throw new Error("Failed to fetch clients")
  return response.json()
}

export const createClient = async (data: any): Promise<Client> => {
  const response = await fetchWithAuth(`${API_BASE_URL}/clients`, {
    method: "POST",
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error(await response.text())
  return response.json()
}

export const updateClient = async (id: number, data: any): Promise<Client> => {
  const response = await fetchWithAuth(`${API_BASE_URL}/clients/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error(await response.text())
  return response.json()
}

export const deleteClient = async (id: number): Promise<void> => {
  const response = await fetchWithAuth(`${API_BASE_URL}/clients/${id}`, {
    method: "DELETE",
  })
  if (!response.ok) throw new Error(await response.text())
}

export const searchClients = async (keyword: string): Promise<Client[]> => {
  const response = await fetchWithAuth(`${API_BASE_URL}/clients/search?keyword=${encodeURIComponent(keyword)}`)
  if (!response.ok) throw new Error("Failed to search clients")
  return response.json()
}

// Machines
export const getMachines = async (): Promise<Machine[]> => {
  const response = await fetchWithAuth(`${API_BASE_URL}/machines`)
  if (!response.ok) throw new Error("Failed to fetch machines")
  return response.json()
}

export const getMachinesByStatut = async (statut: string): Promise<Machine[]> => {
  const response = await fetchWithAuth(`${API_BASE_URL}/machines/statut/${statut}`)
  if (!response.ok) throw new Error("Failed to fetch machines")
  return response.json()
}

export const createMachine = async (data: any): Promise<Machine> => {
  const response = await fetchWithAuth(`${API_BASE_URL}/machines`, {
    method: "POST",
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error(await response.text())
  return response.json()
}

export const updateMachine = async (id: number, data: any): Promise<Machine> => {
  const response = await fetchWithAuth(`${API_BASE_URL}/machines/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error(await response.text())
  return response.json()
}

export const deleteMachine = async (id: number): Promise<void> => {
  const response = await fetchWithAuth(`${API_BASE_URL}/machines/${id}`, {
    method: "DELETE",
  })
  if (!response.ok) throw new Error(await response.text())
}

export const searchMachines = async (keyword: string): Promise<Machine[]> => {
  const response = await fetchWithAuth(`${API_BASE_URL}/machines/search?keyword=${encodeURIComponent(keyword)}`)
  if (!response.ok) throw new Error("Failed to search machines")
  return response.json()
}

// Dashboard
export const getDashboardStats = async (): Promise<DashboardStats> => {
  const response = await fetchWithAuth(`${API_BASE_URL}/dashboard/stats`)
  if (!response.ok) throw new Error("Failed to fetch dashboard stats")
  return response.json()
}
