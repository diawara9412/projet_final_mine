"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

interface Client {
  id: number
  identifiant: string
  nom: string
  prenom: string
  email: string
  role: string
}

// Helper to check if user is admin
export function isAdmin(client: Client | null): boolean {
  return client?.role === "ADMIN"
}

// Helper to check if user is client
export function isClient(client: Client | null): boolean {
  return client?.role === "CLIENT"
}

interface AuthContextType {
  client: Client | null
  isLoading: boolean
  login: (identifiant: string, password: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
  refreshAuth: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [client, setClient] = useState<Client | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check authentication status from backend on mount
  const checkAuth = async () => {
    try {
      const response = await fetch(`${API_URL}/api/auth/verify`, {
        method: "GET",
        credentials: "include", // Important: send cookies
      })

      if (response.ok) {
        const data = await response.json()
        if (data.authenticated) {
          setClient({
            id: data.id,
            identifiant: data.identifiant || data.email,
            nom: data.nom || "",
            prenom: data.prenom || "",
            email: data.email || "",
            role: data.role,
          })
        } else {
          setClient(null)
        }
      } else {
        setClient(null)
      }
    } catch (error) {
      console.error("Auth verification error:", error)
      setClient(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    checkAuth()
  }, [])

  const login = async (identifiant: string, password: string) => {
    const response = await fetch(`${API_URL}/api/auth/client/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Important: receive cookies
      body: JSON.stringify({ identifiant, password }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Identifiant ou mot de passe incorrect")
    }

    const data = await response.json()
    setClient({
      id: data.id,
      identifiant: data.identifiant,
      nom: data.nom,
      prenom: data.prenom,
      email: data.email,
      role: data.role,
    })
  }

  const logout = async () => {
    try {
      await fetch(`${API_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      })
    } catch (error) {
      console.error("Logout error:", error)
    }
    setClient(null)
  }

  const refreshAuth = async () => {
    await checkAuth()
  }

  return (
    <AuthContext.Provider
      value={{
        client,
        isLoading,
        login,
        logout,
        isAuthenticated: !!client,
        refreshAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
