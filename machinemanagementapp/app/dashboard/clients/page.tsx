"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Search, Pencil, Trash2, Phone, Mail, MapPin } from "lucide-react"
import { getClients, createClient, updateClient, deleteClient, type Client } from "@/lib/api"
import { toast } from "sonner"
import ProtectedRoute from "@/components/protected-route"

function ClientsPageContent() {
  const [clients, setClients] = useState<Client[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)

  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    adresse: "",
    numero: "",
    email: "",
    autres: "",
  })

  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = async () => {
    try {
      const data = await getClients()
      setClients(data)
    } catch (error) {
      toast.error("Erreur lors du chargement des clients")
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      nom: "",
      prenom: "",
      adresse: "",
      numero: "",
      email: "",
      autres: "",
    })
    setEditingClient(null)
  }

  const handleOpenDialog = (client?: Client) => {
    if (client) {
      setEditingClient(client)
      setFormData({
        nom: client.nom,
        prenom: client.prenom,
        adresse: client.adresse,
        numero: client.numero,
        email: client.email || "",
        autres: client.autres || "",
      })
    } else {
      resetForm()
    }
    setDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (editingClient) {
        await updateClient(editingClient.id, formData)
        toast.success("Client modifié avec succès")
      } else {
        await createClient(formData)
        toast.success("Client créé avec succès")
      }
      setDialogOpen(false)
      resetForm()
      fetchClients()
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de l'opération")
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce client ?")) return

    try {
      await deleteClient(id)
      toast.success("Client supprimé avec succès")
      fetchClients()
    } catch (error) {
      toast.error("Erreur lors de la suppression")
    }
  }

  // ✅ FILTRAGE LOCAL CLIENTS
  const filteredClients = clients.filter((client) => {
    const query = searchQuery.toLowerCase()

    return (
      client.nom.toLowerCase().includes(query) ||
      client.prenom.toLowerCase().includes(query) ||
      client.numero.toLowerCase().includes(query) ||
      (client.email && client.email.toLowerCase().includes(query))
    )
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-balance">Clients</h1>
          <p className="text-muted-foreground mt-2">Gestion de la base clients</p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Nouveau client
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingClient ? "Modifier le client" : "Nouveau client"}</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="nom">Nom *</Label>
                  <Input
                    id="nom"
                    required
                    value={formData.nom}
                    onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="prenom">Prénom *</Label>
                  <Input
                    id="prenom"
                    required
                    value={formData.prenom}
                    onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="numero">Numéro de téléphone *</Label>
                  <Input
                    id="numero"
                    required
                    value={formData.numero}
                    onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="adresse">Adresse *</Label>
                <Input
                  id="adresse"
                  required
                  value={formData.adresse}
                  onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="autres">Autres informations</Label>
                <Input
                  id="autres"
                  value={formData.autres}
                  onChange={(e) => setFormData({ ...formData, autres: e.target.value })}
                />
              </div>

              <div className="flex gap-4">
                <Button type="submit">{editingClient ? "Modifier" : "Créer"}</Button>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Annuler
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="Rechercher un client..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Button variant="secondary" disabled>
          <Search className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredClients.map((client) => (
          <Card key={client.id}>
            <CardHeader>
              <CardTitle>
                {client.prenom} {client.nom}
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{client.numero}</span>
                </div>

                {client.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="truncate">{client.email}</span>
                  </div>
                )}

                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <span>{client.adresse}</span>
                </div>

                {client.autres && (
                  <div className="pt-2 border-t">
                    <p className="text-muted-foreground text-xs">Autres informations</p>
                    <p>{client.autres}</p>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => handleOpenDialog(client)} className="flex-1">
                  <Pencil className="h-3 w-3 mr-1" />
                  Modifier
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(client.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredClients.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Aucun client trouvé</p>
        </div>
      )}
    </div>
  )
}

export default function ClientsPage() {
  return (
    <ProtectedRoute>
      <ClientsPageContent />
    </ProtectedRoute>
  )
}
