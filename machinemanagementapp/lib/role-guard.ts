import { getUser } from "./auth"

export type Role = "ADMIN" | "SECRETAIRE" | "TECHNICIEN"

// Check if user has one of the allowed roles
export const hasRole = (allowedRoles: Role[]): boolean => {
  const user = getUser()
  if (!user || !user.role) return false
  return allowedRoles.includes(user.role)
}

// Get current user role
export const getUserRole = (): Role | null => {
  const user = getUser()
  return user?.role || null
}

// Role-based permissions for each page
export const pagePermissions = {
  "/dashboard": ["ADMIN", "SECRETAIRE", "TECHNICIEN"],
  "/dashboard/machines": ["ADMIN", "SECRETAIRE", "TECHNICIEN"],
  "/dashboard/machines/new": ["ADMIN", "SECRETAIRE", "TECHNICIEN"],
  "/dashboard/machines/[id]": ["ADMIN", "SECRETAIRE", "TECHNICIEN"],
  "/dashboard/clients": ["ADMIN", "SECRETAIRE"],
  "/dashboard/users": ["ADMIN"],
  "/dashboard/repairs": ["ADMIN", "TECHNICIEN"],
} as const

// Check if user can access a specific page
export const canAccessPage = (path: string): boolean => {
  const user = getUser()
  if (!user || !user.role) return false

  // Match dynamic routes like /dashboard/machines/123
  let matchedPath = path
  if (path.match(/\/dashboard\/machines\/\d+/)) {
    matchedPath = "/dashboard/machines/[id]"
  }

  const allowedRoles = pagePermissions[matchedPath as keyof typeof pagePermissions]
  if (!allowedRoles) return true // If page is not in permissions, allow access

  return allowedRoles.includes(user.role as Role)
}
