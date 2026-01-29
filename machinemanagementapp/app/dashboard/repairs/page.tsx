"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Clock, CheckCircle, AlertCircle, Timer, Save } from "lucide-react"
import { getMachines, updateMachine, type Machine } from "@/lib/api"
import { toast } from "sonner"
import ProtectedRoute from "@/components/protected-route"

function RepairsPageContent() {
  const [machines, setMachines] = useState<Machine[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editData, setEditData] = useState<{ statut: string; remarque: string }>({ statut: "", remarque: "" })

  useEffect(() => {
    fetchMachines()
  }, [])

  const fetchMachines = async () => {
    try {
      const data = await getMachines()
      const activeMachines = data.filter((m) => m.statut !== "TERMINE")
      setMachines(activeMachines)
    } catch (error) {
      toast.error("Erreur lors du chargement des machines")
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (machine: Machine) => {
    setEditingId(machine.id)
    setEditData({
      statut: machine.statut,
      remarque: machine.remarqueTechnicien || "",
    })
  }

  const handleSave = async (machine: Machine) => {
    try {
      await updateMachine(machine.id, {
        marque: machine.marque,
        modele: machine.modele,
        numeroSerie: machine.numeroSerie,
        defaut: machine.defaut,
        photoUrl: machine.photoUrl,
        rendezVous: machine.rendezVous,
        montant: machine.montant,
        paye: machine.paye,
        clientId: machine.client.id,
        secretaireId: machine.secretaire.id,
        technicienId: machine.technicien?.id,
        statut: editData.statut as any,
        remarqueTechnicien: editData.remarque,
      })
      toast.success("Réparation mise à jour")
      setEditingId(null)
      fetchMachines()
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la mise à jour")
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-balance">Réparations</h1>
        <p className="text-muted-foreground mt-2">Gestion des réparations en cours</p>
      </div>

      <div className="grid gap-6">
        {machines.map((machine) => (
          <Card key={machine.id}>
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-shrink-0">
                  <div className="w-48 h-32 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                    {machine.photoUrl ? (
                      <img
                        src={machine.photoUrl || "/placeholder.svg"}
                        alt={machine.marque}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-muted-foreground text-sm">Pas d'image</span>
                    )}
                  </div>
                </div>

                <div className="flex-1 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-bold">
                        {machine.marque} {machine.modele}
                      </h3>
                      {machine.numeroSerie && (
                        <p className="text-sm text-muted-foreground">N°: {machine.numeroSerie}</p>
                      )}
                    </div>
                    {getStatusBadge(machine.statut)}
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Client</p>
                      <p className="font-medium">
                        {machine.client.prenom} {machine.client.nom}
                      </p>
                      <p className="text-sm">{machine.client.numero}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Rendez-vous</p>
                      <p className="font-medium">{new Date(machine.rendezVous).toLocaleDateString("fr-FR")}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Défaut signalé</p>
                    <p className="text-sm">{machine.defaut}</p>
                  </div>

                  {editingId === machine.id ? (
                    <div className="space-y-4 pt-4 border-t">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Statut de la réparation</label>
                        <Select
                          value={editData.statut}
                          onValueChange={(value) => setEditData({ ...editData, statut: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                             <SelectItem value="EN_ATTENTE">En attente</SelectItem>
                                <SelectItem value="EN_COURS">En cours</SelectItem>
                                <SelectItem value="TERMINE">Terminé</SelectItem>
                                <SelectItem value="ANOMALIE">Anomalie</SelectItem>
                                <SelectItem value="PAYE">PAYE</SelectItem>
                                <SelectItem value="REMIS_AU_CLIENT">Remis au client</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Remarque technique</label>
                        <Textarea
                          rows={3}
                          value={editData.remarque}
                          onChange={(e) => setEditData({ ...editData, remarque: e.target.value })}
                          placeholder="Ajouter une remarque sur la réparation ou expliquer pourquoi la machine n'a pas pu être réparée..."
                        />
                      </div>

                      <div className="flex gap-2">
                        <Button onClick={() => handleSave(machine)} size="sm">
                          <Save className="h-4 w-4 mr-2" />
                          Enregistrer
                        </Button>
                        <Button onClick={() => setEditingId(null)} variant="outline" size="sm">
                          Annuler
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2 pt-4 border-t">
                      {machine.remarqueTechnicien && (
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Remarque technique</p>
                          <p className="text-sm">{machine.remarqueTechnicien}</p>
                        </div>
                      )}
                      <Button onClick={() => handleEdit(machine)} variant="outline" size="sm">
                        Mettre à jour la réparation
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {machines.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Aucune réparation en cours</p>
        </div>
      )}
    </div>
  )
}

export default function RepairsPage() {
  return (
    <ProtectedRoute>
      <RepairsPageContent />
    </ProtectedRoute>
  )
}
