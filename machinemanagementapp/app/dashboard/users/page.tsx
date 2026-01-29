"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Pencil, Trash2, Mail, Phone, MapPin, Shield } from "lucide-react"
import { getUsers, createUser, updateUser, deleteUser, type User } from "@/lib/api"
import { toast } from "sonner"
import ProtectedRoute from "@/components/protected-route"

function UsersPageContent() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [filterRole, setFilterRole] = useState<string>("ALL")

  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    adresse: "",
    numero: "",
    email: "",
    password: "",
    role: "SECRETAIRE" as "ADMIN" | "SECRETAIRE" | "TECHNICIEN",
  })

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const data = await getUsers()
      setUsers(data)
    } catch (error) {
      toast.error("Erreur lors du chargement des utilisateurs")
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
      password: "",
      role: "SECRETAIRE",
    })
    setEditingUser(null)
  }

  const handleOpenDialog = (user?: User) => {
    if (user) {
      setEditingUser(user)
      setFormData({
        nom: user.nom,
        prenom: user.prenom,
        adresse: user.adresse,
        numero: user.numero,
        email: user.email,
        password: "",
        role: user.role,
      })
    } else {
      resetForm()
    }
    setDialogOpen(true)
  }

  // ✅ Fonction pour parser correctement les erreurs backend
  const parseError = async (response: Response) => {
    try {
      const data = await response.json()
      return data.message || JSON.stringify(data)
    } catch {
      return await response.text()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (editingUser) {
        await updateUser(editingUser.id, formData)
        toast.success("Utilisateur modifié avec succès")
      } else {
        await createUser(formData)
        toast.success("Utilisateur créé avec succès")
      }
      setDialogOpen(false)
      resetForm()
      fetchUsers()
    } catch (error: any) {
      let message = "Erreur lors de l'opération"
      if (error instanceof Response) {
        message = await parseError(error)
      } else if (error.message) {
        message = error.message
      }
      toast.error(message)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")) return

    try {
      await deleteUser(id)
      toast.success("Utilisateur supprimé avec succès")
      fetchUsers()
    } catch (error) {
      toast.error("Erreur lors de la suppression")
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "ADMIN":
        return <Badge className="bg-purple-500">Admin</Badge>
      case "SECRETAIRE":
        return <Badge className="bg-blue-500">Secrétaire</Badge>
      case "TECHNICIEN":
        return <Badge className="bg-green-500">Technicien</Badge>
      default:
        return <Badge>{role}</Badge>
    }
  }

  const filteredUsers = filterRole === "ALL" ? users : users.filter((u) => u.role === filterRole)

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-balance">Utilisateurs</h1>
          <p className="text-muted-foreground mt-2">Gestion des comptes utilisateurs</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Nouvel utilisateur
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingUser ? "Modifier l'utilisateur" : "Nouvel utilisateur"}</DialogTitle>
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
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                  <Label htmlFor="password">Mot de passe {editingUser ? "" : "*"}</Label>
                  <Input
                    id="password"
                    type="password"
                    required={!editingUser}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder={editingUser ? "Laisser vide pour ne pas changer" : ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Rôle *</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value: any) => setFormData({ ...formData, role: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                      <SelectItem value="SECRETAIRE">Secrétaire</SelectItem>
                      <SelectItem value="TECHNICIEN">Technicien</SelectItem>
                    </SelectContent>
                  </Select>
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
              <div className="flex gap-4">
                <Button type="submit">{editingUser ? "Modifier" : "Créer"}</Button>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Annuler
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-2 flex-wrap">
        <Button variant={filterRole === "ALL" ? "default" : "outline"} size="sm" onClick={() => setFilterRole("ALL")}>
          Tous
        </Button>
        <Button
          variant={filterRole === "ADMIN" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilterRole("ADMIN")}
        >
          Admins
        </Button>
        <Button
          variant={filterRole === "SECRETAIRE" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilterRole("SECRETAIRE")}
        >
          Secrétaires
        </Button>
        <Button
          variant={filterRole === "TECHNICIEN" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilterRole("TECHNICIEN")}
        >
          Techniciens
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredUsers.map((user) => (
          <Card key={user.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>
                  {user.prenom} {user.nom}
                </span>
                {getRoleBadge(user.role)}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="truncate">{user.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{user.numero}</span>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <span>{user.adresse}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <span className={user.active ? "text-green-600" : "text-red-600"}>
                    {user.active ? "Actif" : "Inactif"}
                  </span>
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => handleOpenDialog(user)} className="flex-1">
                  <Pencil className="h-3 w-3 mr-1" />
                  Modifier
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(user.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredUsers.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Aucun utilisateur trouvé</p>
        </div>
      )}
    </div>
  )
}

export default function UsersPage() {
  return (
    <ProtectedRoute>
      <UsersPageContent />
    </ProtectedRoute>
  )
}
