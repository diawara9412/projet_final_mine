"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { getMachines, updateMachine, getClients, getUsersByRole, type Machine, type Client, type User } from "@/lib/api"
import { toast } from "sonner"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function EditMachinePage() {
  const router = useRouter()
  const params = useParams()
  const machineId = params.id as string

  const [loading, setLoading] = useState(false)
  const [machine, setMachine] = useState<Machine | null>(null)
  const [clients, setClients] = useState<Client[]>([])
  const [techniciens, setTechniciens] = useState<User[]>([])
  const [currentUser, setCurrentUser] = useState<any>(null)

  const [formData, setFormData] = useState({
    marque: "",
    modele: "",
    numeroSerie: "",
    defaut: "",
    photoUrl: "",
    rendezVous: "",
    montant: "",
    paye: false,
    clientId: "",
    technicienId: "",
    statut: "EN_ATTENTE",
    remarqueTechnicien: "",
  })

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      setCurrentUser(JSON.parse(userData))
    }

    const fetchData = async () => {
      try {
        const [machinesData, clientsData, techniciensData] = await Promise.all([
          getMachines(),
          getClients(),
          getUsersByRole("TECHNICIEN"),
        ])

        const currentMachine = machinesData.find((m) => m.id === Number.parseInt(machineId))
        if (currentMachine) {
          setMachine(currentMachine)
          setFormData({
            marque: currentMachine.marque,
            modele: currentMachine.modele,
            numeroSerie: currentMachine.numeroSerie || "",
            defaut: currentMachine.defaut,
            photoUrl: currentMachine.photoUrl || "",
            rendezVous: currentMachine.rendezVous,
            montant: currentMachine.montant?.toString() || "",
            paye: currentMachine.paye,
            clientId: currentMachine.client.id.toString(),
            technicienId: currentMachine.technicien?.id.toString() || "",
            statut: currentMachine.statut,
            remarqueTechnicien: currentMachine.remarqueTechnicien || "",
          })
        }

        setClients(clientsData)
        setTechniciens(techniciensData)
      } catch (error) {
        toast.error("Erreur lors du chargement des données")
      }
    }

    fetchData()
  }, [machineId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await updateMachine(Number.parseInt(machineId), {
        ...formData,
        montant: formData.montant ? Number.parseFloat(formData.montant) : null,
        clientId: Number.parseInt(formData.clientId),
        secretaireId: machine?.secretaire.id,
        technicienId: formData.technicienId ? Number.parseInt(formData.technicienId) : null,
      })
      toast.success("Machine modifiée avec succès")
      router.push("/dashboard/machines")
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la modification")
    } finally {
      setLoading(false)
    }
  }

  if (!machine) {
    return <div>Chargement...</div>
  }

  const canEditStatus = currentUser?.role === "TECHNICIEN" || currentUser?.role === "ADMIN"
  const canEditRemarque = currentUser?.role === "TECHNICIEN" || currentUser?.role === "ADMIN"

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/machines">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-balance">Modifier la machine</h1>
          <p className="text-muted-foreground mt-2">Mettre à jour les informations de la machine</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informations de la machine</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="marque">Marque *</Label>
                    <Input
                      id="marque"
                      required
                      value={formData.marque}
                      onChange={(e) => setFormData({ ...formData, marque: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="modele">Modèle *</Label>
                    <Input
                      id="modele"
                      required
                      value={formData.modele}
                      onChange={(e) => setFormData({ ...formData, modele: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="numeroSerie">Numéro de série</Label>
                    <Input
                      id="numeroSerie"
                      value={formData.numeroSerie}
                      onChange={(e) => setFormData({ ...formData, numeroSerie: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="rendezVous">Date de rendez-vous *</Label>
                    <Input
                      id="rendezVous"
                      type="date"
                      required
                      value={formData.rendezVous}
                      onChange={(e) => setFormData({ ...formData, rendezVous: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="clientId">Client *</Label>
                    <Select
                      value={formData.clientId}
                      onValueChange={(value) => setFormData({ ...formData, clientId: value })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un client" />
                      </SelectTrigger>
                      <SelectContent>
                        {clients.map((client) => (
                          <SelectItem key={client.id} value={client.id.toString()}>
                            {client.prenom} {client.nom}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="technicienId">Technicien</Label>
                    <Select
                      value={formData.technicienId}
                      onValueChange={(value) => setFormData({ ...formData, technicienId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un technicien" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Aucun</SelectItem>
                        {techniciens.map((tech) => (
                          <SelectItem key={tech.id} value={tech.id.toString()}>
                            {tech.prenom} {tech.nom}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="statut">Statut</Label>
                    <Select
                      value={formData.statut}
                      onValueChange={(value) => setFormData({ ...formData, statut: value })}
                      disabled={!canEditStatus}
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
                    <Label htmlFor="montant">Montant (€)</Label>
                    <Input
                      id="montant"
                      type="number"
                      step="0.01"
                      value={formData.montant}
                      onChange={(e) => setFormData({ ...formData, montant: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="paye"
                    checked={formData.paye}
                    onCheckedChange={(checked) => setFormData({ ...formData, paye: checked as boolean })}
                  />
                  <Label htmlFor="paye" className="cursor-pointer">
                    Machine payée
                  </Label>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="photoUrl">URL de la photo</Label>
                  <Input
                    id="photoUrl"
                    type="url"
                    value={formData.photoUrl}
                    onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="defaut">Défaut expliqué par le client *</Label>
                  <Textarea
                    id="defaut"
                    required
                    rows={4}
                    value={formData.defaut}
                    onChange={(e) => setFormData({ ...formData, defaut: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="remarqueTechnicien">Remarque du technicien</Label>
                  <Textarea
                    id="remarqueTechnicien"
                    rows={4}
                    value={formData.remarqueTechnicien}
                    onChange={(e) => setFormData({ ...formData, remarqueTechnicien: e.target.value })}
                    placeholder="Si la machine n'a pas pu être réparée, expliquez pourquoi..."
                    disabled={!canEditRemarque}
                  />
                </div>

                <div className="flex gap-4">
                  <Button type="submit" disabled={loading}>
                    {loading ? "Modification..." : "Enregistrer les modifications"}
                  </Button>
                  <Link href="/dashboard/machines">
                    <Button type="button" variant="outline">
                      Annuler
                    </Button>
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informations client</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Nom complet</p>
                <p className="font-medium">
                  {machine.client.prenom} {machine.client.nom}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Téléphone</p>
                <p className="font-medium">{machine.client.numero}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Adresse</p>
                <p className="font-medium">{machine.client.adresse}</p>
              </div>
              {machine.client.email && (
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{machine.client.email}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Historique</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Créée le</p>
                <p className="font-medium">{new Date(machine.createdAt).toLocaleString("fr-FR")}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Modifiée le</p>
                <p className="font-medium">{new Date(machine.updatedAt).toLocaleString("fr-FR")}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Secrétaire</p>
                <p className="font-medium">
                  {machine.secretaire.prenom} {machine.secretaire.nom}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
