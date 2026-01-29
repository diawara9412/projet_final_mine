// JWT Token management utilities using HttpOnly cookies

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

export interface User {
  id: number
  nom: string
  prenom: string
  email: string
  role: "ADMIN" | "SECRETAIRE" | "TECHNICIEN"
}

// Verify authentication status from backend
export const verifyAuth = async (): Promise<User | null> => {
  try {
    const response = await fetch(`${API_URL}/api/auth/verify`, {
      method: "GET",
      credentials: "include",
    })

    if (response.ok) {
      const data = await response.json()
      if (data.authenticated) {
        return {
          id: data.id,
          nom: data.nom || "",
          prenom: data.prenom || "",
          email: data.email || "",
          role: data.role,
        }
      }
    }
  } catch (error) {
    console.error("Auth verification error:", error)
  }
  return null
}

// Store user data in localStorage (for UI purposes only, not security)
export const setUserData = (user: User): void => {
  localStorage.setItem("user", JSON.stringify(user))
}

// Get the current user from localStorage
export const getUser = (): User | null => {
  if (typeof window === "undefined") return null
  const userData = localStorage.getItem("user")
  return userData ? JSON.parse(userData) : null
}

// Clear authentication data
export const clearAuth = async (): Promise<void> => {
  try {
    await fetch(`${API_URL}/api/auth/logout`, {
      method: "POST",
      credentials: "include",
    })
  } catch (error) {
    console.error("Logout error:", error)
  }
  localStorage.removeItem("user")
}

// Check if user is authenticated (from localStorage for quick check)
export const isAuthenticated = (): boolean => {
  return !!getUser()
}
