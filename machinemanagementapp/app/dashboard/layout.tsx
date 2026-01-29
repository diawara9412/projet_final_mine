"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { Laptop, LayoutDashboard, Users, UserCog, LogOut, Menu, Wrench, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { getUser, clearAuth, isAuthenticated, verifyAuth } from "@/lib/auth"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const checkAuthentication = async () => {
      if (!isAuthenticated()) {
        router.push("/")
        return
      }
      
      // Verify auth status from backend
      const verifiedUser = await verifyAuth()
      if (verifiedUser) {
        setUser(verifiedUser)
      } else {
        // Token is invalid, redirect to login
        clearAuth()
        router.push("/")
      }
    }
    
    checkAuthentication()
  }, [router])

  const handleLogout = () => {
    clearAuth()
    router.push("/")
  }

  const handleOpenClientPortal = () => {
    // Open client portal in new tab
    const clientPortalUrl = process.env.NEXT_PUBLIC_CLIENT_PORTAL_URL || "http://localhost:3001"
    window.open(clientPortalUrl, "_blank")
  }

  const getInitials = (nom: string, prenom: string) => {
    return `${nom[0]}${prenom[0]}`.toUpperCase()
  }

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["ADMIN", "SECRETAIRE", "TECHNICIEN"] },
    { name: "Machines", href: "/dashboard/machines", icon: Laptop, roles: ["ADMIN", "SECRETAIRE", "TECHNICIEN"] },
    { name: "Clients", href: "/dashboard/clients", icon: Users, roles: ["ADMIN", "SECRETAIRE"] },
    { name: "Utilisateurs", href: "/dashboard/users", icon: UserCog, roles: ["ADMIN"] },
    { name: "Réparations", href: "/dashboard/repairs", icon: Wrench, roles: ["TECHNICIEN", "ADMIN"] },
  ]

  const filteredNavigation = navigation.filter((item) => user && item.roles.includes(user.role))

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary rounded-lg">
            <Laptop className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-bold text-lg">RepairSys</h2>
            <p className="text-xs text-muted-foreground">Gestion de réparation</p>
          </div>
        </div>
      </div>

      <Separator />

      <nav className="flex-1 p-4 space-y-1">
        {filteredNavigation.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted text-foreground"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="font-medium">{item.name}</span>
            </Link>
          )
        })}
      </nav>

      <Separator />

      <div className="p-4">
        {user && (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <Avatar>
              <AvatarFallback className="bg-primary text-primary-foreground">
                {getInitials(user.nom, user.prenom)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">
                {user.prenom} {user.nom}
              </p>
              <p className="text-xs text-muted-foreground truncate">{user.role}</p>
            </div>
          </div>
        )}
        {user?.role === "ADMIN" && (
          <Button
            variant="outline"
            className="w-full mt-2 justify-start border-primary/20 hover:bg-primary/10 hover:text-primary"
            onClick={handleOpenClientPortal}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Portail Client
          </Button>
        )}
        <Button variant="ghost" className="w-full mt-2 justify-start" onClick={handleLogout}>
          <LogOut className="h-4 w-4 mr-2" />
          Déconnexion
        </Button>
      </div>
    </div>
  )

  if (!user) {
    return null
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-72 border-r bg-card flex-col">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="p-0 w-72">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden border-b bg-card p-4 flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => setMobileOpen(true)}>
            <Menu className="h-6 w-6" />
          </Button>
          <div className="flex items-center gap-2">
            <Laptop className="h-6 w-6 text-primary" />
            <span className="font-bold">RepairSys</span>
          </div>
          <div className="w-10" />
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">{children}</main>
      </div>
    </div>
  )
}
