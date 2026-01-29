"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createMachine, getClients, getUsersByRole, type Client, type User } from "@/lib/api"
import { toast } from "sonner"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function NewMachinePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
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
    clientId: "",
    technicienId: "",
  })

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      setCurrentUser(JSON.parse(userData))
    }

    const fetchData = async () => {
      try {
        const [clientsData, techniciensData] = await Promise.all([getClients(), getUsersByRole("TECHNICIEN")])
        setClients(clientsData)
        setTechniciens(techniciensData)
      } catch (error) {
        toast.error("Erreur lors du chargement des données")
      }
    }

    fetchData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await createMachine({
        ...formData,
        montant: formData.montant ? Number.parseFloat(formData.montant) : null,
        clientId: Number.parseInt(formData.clientId),
        secretaireId: currentUser.id,
        technicienId: formData.technicienId ? Number.parseInt(formData.technicienId) : null,
      })
      toast.success("Machine créée avec succès")
      router.push("/dashboard/machines")
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la création")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/machines">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-balance">Nouvelle machine</h1>
          <p className="text-muted-foreground mt-2">Enregistrer une nouvelle machine</p>
        </div>
      </div>

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
                    {techniciens.map((tech) => (
                      <SelectItem key={tech.id} value={tech.id.toString()}>
                        {tech.prenom} {tech.nom}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="montant">Montant (FCFA)</Label>
                <Input
                  id="montant"
                  type="number"
                  step="0.01"
                  value={formData.montant}
                  onChange={(e) => setFormData({ ...formData, montant: e.target.value })}
                />
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

            <div className="flex gap-4">
              <Button type="submit" disabled={loading}>
                {loading ? "Création..." : "Créer la machine"}
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
  )
}
