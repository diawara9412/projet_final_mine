"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Clock, CheckCircle, AlertCircle, Timer, Pencil, Trash2 } from "lucide-react"
import { getMachines, deleteMachine, type Machine } from "@/lib/api"
import { toast } from "sonner"
import Link from "next/link"

export default function MachinesPage() {
  const [machines, setMachines] = useState<Machine[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [filterStatut, setFilterStatut] = useState<string>("ALL")

  useEffect(() => {
    fetchMachines()
  }, [])

  const fetchMachines = async () => {
    try {
      const data = await getMachines()
      setMachines(data)
    } catch (error) {
      toast.error("Erreur lors du chargement des machines")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette machine ?")) return

    try {
      await deleteMachine(id)
      toast.success("Machine supprimée avec succès")
      fetchMachines()
    } catch (error) {
      toast.error("Erreur lors de la suppression")
    }
  }

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

  // ✅ FILTRAGE LOCAL (STATUT + RECHERCHE)
  const filteredMachines = machines.filter((machine) => {
    const matchStatut =
      filterStatut === "ALL" || machine.statut === filterStatut

    const query = searchQuery.toLowerCase()

    const matchSearch =
      machine.marque.toLowerCase().includes(query) ||
      machine.modele.toLowerCase().includes(query) ||
      (machine.numeroSerie &&
        machine.numeroSerie.toLowerCase().includes(query))

    return matchStatut && matchSearch
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-balance">Machines</h1>
          <p className="text-muted-foreground mt-2">Gestion des machines en réparation</p>
        </div>
        <Link href="/dashboard/machines/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle machine
          </Button>
        </Link>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 flex gap-2">
          <Input
            placeholder="Rechercher une machine..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button variant="secondary" disabled>
            <Search className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex gap-2 flex-wrap">
          {["ALL","EN_ATTENTE","EN_COURS","TERMINE","ANOMALIE","PAYE","REMIS_AU_CLIENT"].map((statut) => (
            <Button
              key={statut}
              variant={filterStatut === statut ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatut(statut)}
            >
              {statut === "ALL" ? "Tous" : statut.replaceAll("_", " ")}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredMachines.map((machine) => (
          <Card key={machine.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="aspect-video bg-muted flex items-center justify-center">
              {machine.photoUrl ? (
                <img
                  src={machine.photoUrl}
                  alt={machine.marque}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-muted-foreground">Pas d'image</div>
              )}
            </div>

            <CardContent className="p-6 space-y-4">
              <div>
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-lg">
                    {machine.marque} {machine.modele}
                  </h3>
                  {getStatusBadge(machine.statut)}
                </div>
                {machine.numeroSerie && (
                  <p className="text-xs text-muted-foreground">
                    N°: {machine.numeroSerie}
                  </p>
                )}
              </div>

              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Client:</span>{" "}
                  <span className="font-medium">
                    {machine.client.prenom} {machine.client.nom}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Défaut:</span>{" "}
                  <span className="line-clamp-2">{machine.defaut}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">RDV:</span>{" "}
                  <span>{new Date(machine.rendezVous).toLocaleDateString("fr-FR")}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Link href={`/dashboard/machines/${machine.id}`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full bg-transparent">
                    <Pencil className="h-3 w-3 mr-1" />
                    Modifier
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(machine.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredMachines.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Aucune machine trouvée</p>
        </div>
      )}
    </div>
  )
}
