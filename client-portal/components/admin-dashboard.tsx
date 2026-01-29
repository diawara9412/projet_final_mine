"use client"

import React from "react"
import { useState, useEffect } from "react"
import { getAllClients, getAllMachines, type Machine } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Loader2,
  Users,
  Wrench,
  Search,
  TrendingUp,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react"

interface Client {
  id: number
  identifiant: string
  nom: string
  prenom: string
  email: string
  numero: string
  adresse: string
  active: boolean
}

export default function AdminDashboard() {
  const [clients, setClients] = useState<Client[]>([])
  const [machines, setMachines] = useState<Machine[]>([])
  const [isLoadingClients, setIsLoadingClients] = useState(true)
  const [isLoadingMachines, setIsLoadingMachines] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoadingClients(true)
    setIsLoadingMachines(true)
    setError("")

    try {
      const [clientsData, machinesData] = await Promise.all([
        getAllClients(),
        getAllMachines(),
      ])
      setClients(clientsData)
      setMachines(machinesData)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors du chargement")
    } finally {
      setIsLoadingClients(false)
      setIsLoadingMachines(false)
    }
  }

  const filteredClients = clients.filter((c) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      c.nom?.toLowerCase().includes(query) ||
      c.prenom?.toLowerCase().includes(query) ||
      c.email?.toLowerCase().includes(query) ||
      c.identifiant?.toLowerCase().includes(query)
    )
  })

  // Statistics
  const stats = {
    totalClients: clients.length,
    activeClients: clients.filter((c) => c.active).length,
    totalMachines: machines.length,
    machinesInProgress: machines.filter((m) => m.statut === "EN_COURS").length,
    machinesPending: machines.filter((m) => m.statut === "EN_ATTENTE").length,
    machinesCompleted: machines.filter((m) => m.statut === "TERMINE").length,
    machinesWithIssues: machines.filter((m) => m.statut === "ANOMALIE").length,
    totalRevenue: machines
      .filter((m) => m.paye && m.montant)
      .reduce((sum, m) => sum + (m.montant || 0), 0),
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Clients"
          value={stats.totalClients}
          subtitle={`${stats.activeClients} actifs`}
          icon={<Users className="h-5 w-5" />}
          color="blue"
        />
        <StatCard
          title="Total Machines"
          value={stats.totalMachines}
          subtitle={`${stats.machinesInProgress} en cours`}
          icon={<Wrench className="h-5 w-5" />}
          color="purple"
        />
        <StatCard
          title="En Attente"
          value={stats.machinesPending}
          subtitle="Machines"
          icon={<Clock className="h-5 w-5" />}
          color="amber"
        />
        <StatCard
          title="Termine"
          value={stats.machinesCompleted}
          subtitle="Reparations"
          icon={<CheckCircle2 className="h-5 w-5" />}
          color="green"
        />
      </div>

      {/* Revenue and Issues */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <DollarSign className="h-5 w-5 text-emerald-500" />
              Revenus Totaux
            </CardTitle>
            <CardDescription>Paiements recus</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {stats.totalRevenue.toLocaleString("fr-FR")} FCFA
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {machines.filter((m) => m.paye).length} machines payees
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Anomalies
            </CardTitle>
            <CardDescription>Machines avec problemes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{stats.machinesWithIssues}</div>
            <p className="text-sm text-muted-foreground mt-2">Necessite attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Clients List */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Users className="h-5 w-5 text-primary" />
            Liste des Clients
          </CardTitle>
          <CardDescription>Tous les clients enregistres</CardDescription>
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un client..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive mb-4">
              {error}
            </div>
          )}

          {isLoadingClients ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : filteredClients.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery ? "Aucun client trouve" : "Aucun client enregistre"}
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredClients.map((client) => (
                <div
                  key={client.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground">
                        {client.prenom} {client.nom}
                      </p>
                      {client.active ? (
                        <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-400 text-xs">
                          Actif
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-red-500/10 text-red-400 text-xs">
                          Inactif
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-1">
                      <p className="text-sm text-muted-foreground">{client.identifiant}</p>
                      <p className="text-sm text-muted-foreground">{client.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-foreground">
                      {machines.filter((m) => m.client.id === client.id).length}
                    </p>
                    <p className="text-xs text-muted-foreground">machines</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <TrendingUp className="h-5 w-5 text-primary" />
            Activite Recente
          </CardTitle>
          <CardDescription>Dernieres machines enregistrees</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingMachines ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : machines.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">Aucune machine enregistree</div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {machines
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .slice(0, 10)
                .map((machine) => (
                  <div
                    key={machine.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-secondary/30"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-foreground">
                        {machine.marque} {machine.modele}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Client: {machine.client.prenom} {machine.client.nom}
                      </p>
                    </div>
                    <Badge
                      variant="secondary"
                      className={
                        machine.statut === "EN_COURS"
                          ? "bg-blue-500/10 text-blue-400"
                          : machine.statut === "EN_ATTENTE"
                          ? "bg-amber-500/10 text-amber-400"
                          : machine.statut === "TERMINE"
                          ? "bg-emerald-500/10 text-emerald-400"
                          : machine.statut === "ANOMALIE"
                          ? "bg-red-500/10 text-red-400"
                          : "bg-secondary"
                      }
                    >
                      {machine.statut.replace(/_/g, " ")}
                    </Badge>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function StatCard({
  title,
  value,
  subtitle,
  icon,
  color,
}: {
  title: string
  value: number
  subtitle: string
  icon: React.ReactNode
  color: "blue" | "purple" | "amber" | "green"
}) {
  const colorClasses = {
    blue: "text-blue-400 bg-blue-500/10",
    purple: "text-purple-400 bg-purple-500/10",
    amber: "text-amber-400 bg-amber-500/10",
    green: "text-emerald-400 bg-emerald-500/10",
  }

  return (
    <Card className="border-border/50">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold text-foreground mt-2">{value}</p>
            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
          </div>
          <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
