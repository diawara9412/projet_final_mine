"use client"

import React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth, isAdmin } from "@/lib/auth-context"
import { getClientMachines, getAllMachines, type Machine } from "@/lib/api"
import { MachineCard } from "@/components/machine-card"
import { MachineDetailModal } from "@/components/machine-detail-modal"
import AdminDashboard from "@/components/admin-dashboard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Loader2,
  Wrench,
  LogOut,
  Settings,
  Search,
  RefreshCw,
  User,
  Filter,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Package,
  LayoutGrid,
  List,
  Shield,
} from "lucide-react"

type StatusFilter = "all" | Machine["statut"]

const statusFilters: { value: StatusFilter; label: string; icon: React.ReactNode }[] = [
  { value: "all", label: "Toutes", icon: <LayoutGrid className="h-4 w-4" /> },
  { value: "EN_ATTENTE", label: "En attente", icon: <Clock className="h-4 w-4" /> },
  { value: "EN_COURS", label: "En cours", icon: <Wrench className="h-4 w-4" /> },
  { value: "TERMINE", label: "Termine", icon: <CheckCircle2 className="h-4 w-4" /> },
  { value: "ANOMALIE", label: "Anomalie", icon: <AlertTriangle className="h-4 w-4" /> },
  { value: "REMIS_AU_CLIENT", label: "Remis", icon: <Package className="h-4 w-4" /> },
]

export default function DashboardPage() {
  const { client, isAuthenticated, isLoading: authLoading, logout } = useAuth()
  const router = useRouter()

  const [machines, setMachines] = useState<Machine[]>([])
  const [filteredMachines, setFilteredMachines] = useState<Machine[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/")
    }
  }, [authLoading, isAuthenticated, router])

  useEffect(() => {
    if (client?.id) {
      loadMachines()
    }
  }, [client?.id])

  const loadMachines = async () => {
    if (!client) return
    setIsLoading(true)
    setError("")
    try {
      let data: Machine[]
      if (isAdmin(client)) {
        // Admin sees all machines
        data = await getAllMachines()
      } else {
        // Client sees only their machines
        data = await getClientMachines(client.id)
      }
      setMachines(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors du chargement")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    filterMachines()
  }, [machines, searchQuery, statusFilter])

  const filterMachines = () => {
    let filtered = [...machines]

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (m) =>
          m.marque.toLowerCase().includes(query) ||
          m.modele.toLowerCase().includes(query) ||
          m.defaut.toLowerCase().includes(query) ||
          m.numeroSerie?.toLowerCase().includes(query) ||
          // Admin can search by client name
          (isAdmin(client) &&
            (m.client.nom.toLowerCase().includes(query) || m.client.prenom.toLowerCase().includes(query)))
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((m) => m.statut === statusFilter)
    }

    setFilteredMachines(filtered)
  }

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  const handleMachineClick = (machine: Machine) => {
    setSelectedMachine(machine)
    setIsModalOpen(true)
  }

  // Statistiques
  const stats = {
    total: machines.length,
    enAttente: machines.filter((m) => m.statut === "EN_ATTENTE").length,
    enCours: machines.filter((m) => m.statut === "EN_COURS").length,
    termine: machines.filter((m) => m.statut === "TERMINE").length,
    anomalie: machines.filter((m) => m.statut === "ANOMALIE").length,
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Wrench className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-foreground">RepairTrack</h1>
                <p className="text-xs text-muted-foreground">
                  {isAdmin(client) ? "Espace Admin" : "Espace Client"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={loadMachines}
                disabled={isLoading}
                className="text-muted-foreground hover:text-foreground"
              >
                <RefreshCw className={`h-5 w-5 ${isLoading ? "animate-spin" : ""}`} />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      {isAdmin(client) ? (
                        <Shield className="h-4 w-4 text-primary" />
                      ) : (
                        <User className="h-4 w-4 text-primary" />
                      )}
                    </div>
                    <span className="hidden sm:inline text-foreground">
                      {client?.prenom} {client?.nom}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-popover border-border">
                  <DropdownMenuLabel className="text-foreground">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">
                        {client?.prenom} {client?.nom}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {isAdmin(client) ? client?.email : client?.identifiant}
                      </p>
                      {isAdmin(client) && (
                        <Badge variant="secondary" className="w-fit mt-1 bg-primary/10 text-primary">
                          <Shield className="h-3 w-3 mr-1" />
                          Administrateur
                        </Badge>
                      )}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-border" />
                  <DropdownMenuItem
                    onClick={() => router.push("/dashboard/settings")}
                    className="text-foreground hover:bg-secondary cursor-pointer"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Parametres
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-border" />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-destructive hover:bg-destructive/10 cursor-pointer"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Deconnexion
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Bonjour, {client?.prenom}
          </h2>
          <p className="text-muted-foreground">
            {isAdmin(client)
              ? "Tableau de bord administrateur - Vue d'ensemble"
              : "Voici le suivi de vos machines en reparation"}
          </p>
        </div>

        {/* Show Admin Dashboard for Admins */}
        {isAdmin(client) ? (
          <AdminDashboard />
        ) : (
          <>
            {/* Stats Cards - Client View */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
              <StatCard label="Total" value={stats.total} icon={<LayoutGrid />} />
              <StatCard label="En attente" value={stats.enAttente} icon={<Clock />} color="amber" />
              <StatCard label="En cours" value={stats.enCours} icon={<Wrench />} color="primary" />
              <StatCard label="Termine" value={stats.termine} icon={<CheckCircle2 />} color="emerald" />
              <StatCard label="Anomalie" value={stats.anomalie} icon={<AlertTriangle />} color="red" />
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher une machine..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-input border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>

              <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="border-border bg-transparent text-foreground hover:bg-secondary">
                  <Filter className="mr-2 h-4 w-4" />
                  {statusFilters.find((f) => f.value === statusFilter)?.label}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-popover border-border">
                {statusFilters.map((filter) => (
                  <DropdownMenuItem
                    key={filter.value}
                    onClick={() => setStatusFilter(filter.value)}
                    className={`cursor-pointer ${
                      statusFilter === filter.value
                        ? "bg-primary/10 text-primary"
                        : "text-foreground hover:bg-secondary"
                    }`}
                  >
                    {filter.icon}
                    <span className="ml-2">{filter.label}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="flex border border-border rounded-lg overflow-hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setViewMode("grid")}
                className={viewMode === "grid" ? "bg-primary/10 text-primary" : "text-muted-foreground"}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setViewMode("list")}
                className={viewMode === "list" ? "bg-primary/10 text-primary" : "text-muted-foreground"}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive mb-6">
            {error}
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Chargement de vos machines...</p>
          </div>
        ) : filteredMachines.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="h-20 w-20 rounded-full bg-secondary flex items-center justify-center mb-4">
              <Wrench className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">
              {searchQuery || statusFilter !== "all"
                ? "Aucune machine trouvee"
                : "Aucune machine en reparation"}
            </h3>
            <p className="text-muted-foreground max-w-md">
              {searchQuery || statusFilter !== "all"
                ? "Essayez de modifier vos filtres de recherche"
                : "Vos machines en reparation apparaitront ici une fois enregistrees par notre equipe."}
            </p>
          </div>
        ) : (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                : "flex flex-col gap-4"
            }
          >
            {filteredMachines.map((machine) => (
              <MachineCard
                key={machine.id}
                machine={machine}
                onClick={() => handleMachineClick(machine)}
              />
            ))}
          </div>
        )}

        {/* Results Count */}
        {!isLoading && filteredMachines.length > 0 && (
          <div className="mt-6 text-center">
            <Badge variant="secondary" className="bg-secondary text-secondary-foreground">
              {filteredMachines.length} machine{filteredMachines.length > 1 ? "s" : ""} affichee{filteredMachines.length > 1 ? "s" : ""}
            </Badge>
          </div>
        )}
          </>
        )}
      </main>

      {/* Machine Detail Modal */}
      <MachineDetailModal
        machine={selectedMachine}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </div>
  )
}

function StatCard({
  label,
  value,
  icon,
  color = "default",
}: {
  label: string
  value: number
  icon: React.ReactNode
  color?: "default" | "primary" | "amber" | "emerald" | "red"
}) {
  const colorClasses = {
    default: "text-muted-foreground bg-secondary/50",
    primary: "text-primary bg-primary/10",
    amber: "text-amber-400 bg-amber-500/10",
    emerald: "text-emerald-400 bg-emerald-500/10",
    red: "text-red-400 bg-red-500/10",
  }

  return (
    <div className="p-4 rounded-lg bg-card border border-border/50">
      <div className="flex items-center gap-3">
        <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
          {icon}
        </div>
        <div>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </div>
    </div>
  )
}
