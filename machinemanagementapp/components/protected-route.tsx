"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { canAccessPage } from "@/lib/role-guard"
import { isAuthenticated } from "@/lib/auth"

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Check authentication
    if (!isAuthenticated()) {
      router.push("/")
      return
    }

    // Check role-based access
    if (!canAccessPage(pathname)) {
      router.push("/dashboard")
    }
  }, [pathname, router])

  // If user doesn't have access, don't render children
  if (!isAuthenticated() || !canAccessPage(pathname)) {
    return null
  }

  return <>{children}</>
}
