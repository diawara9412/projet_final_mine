"use client"

import type React from "react"

import { hasRole, type Role } from "@/lib/role-guard"

interface RoleGateProps {
  allowedRoles: Role[]
  children: React.ReactNode
  fallback?: React.ReactNode
}

export default function RoleGate({ allowedRoles, children, fallback = null }: RoleGateProps) {
  if (!hasRole(allowedRoles)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
