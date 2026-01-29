"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Laptop, Users, UserCog, Clock, CheckCircle, AlertCircle, Timer } from "lucide-react"
import { getDashboardStats, getMachines, type DashboardStats, type Machine } from "@/lib/api"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentMachines, setRecentMachines] = useState<Machine[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, machinesData] = await Promise.all([getDashboardStats(), getMachines()])
        setStats(statsData)
        setRecentMachines(machinesData.slice(0, 5))
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const getStatusBadge = (statut: string) => {
    switch (statut) {
      case "EN_COURS":
        return (
          <Badge className="bg-blue-500">
            <Clock className="h-3 w-3 mr-1" />
            En cours
          </Badge>
        )
      case "TERMINE":
        return (
          <Badge className="bg-green-500">
            <CheckCircle className="h-3 w-3 mr-1" />
            Terminé
          </Badge>
        )
      case "ANOMALIE":
        return (
          <Badge className="bg-red-500">
            <AlertCircle className="h-3 w-3 mr-1" />
            Anomalie
          </Badge>
        )
      case "EN_ATTENTE":
        return (
          <Badge className="bg-yellow-500">
            <Timer className="h-3 w-3 mr-1" />
            En attente
          </Badge>
        )
      default:
        return <Badge>{statut}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-balance">Dashboard</h1>
          <p className="text-muted-foreground mt-2">Vue d'ensemble de l'activité</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-3">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-balance">Dashboard</h1>
        <p className="text-muted-foreground mt-2">Vue d'ensemble de l'activité</p>
      </div>

      {stats && (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Laptop className="h-4 w-4 text-primary" />
                  Total Machines
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.totalMachines}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Users className="h-4 w-4 text-green-500" />
                  Total Clients
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.totalClients}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <UserCog className="h-4 w-4 text-blue-500" />
                  Utilisateurs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.totalUsers}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4 text-yellow-500" />
                  En cours
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.enCours}</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">En attente</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{stats.enAttente}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Terminées</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.termine}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Anomalies</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{stats.anomalie}</div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Machines récentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentMachines.map((machine) => (
              <div key={machine.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="font-medium">
                    {machine.marque} {machine.modele}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Client: {machine.client.prenom} {machine.client.nom}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-sm text-muted-foreground">
                    RDV: {new Date(machine.rendezVous).toLocaleDateString("fr-FR")}
                  </div>
                  {getStatusBadge(machine.statut)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
