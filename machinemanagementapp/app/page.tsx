"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Laptop, Lock, Mail } from "lucide-react"
import { toast } from "sonner"
import { login } from "@/lib/api"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await login(email, password)

      // Backend now returns user data without token (token is in HttpOnly cookie)
      const user = {
        id: response.id,
        nom: response.nom,
        prenom: response.prenom,
        email: response.email,
        role: response.role,
      }

      // Store user data in localStorage (for UI purposes)
      localStorage.setItem("user", JSON.stringify(user))
      toast.success("Connexion réussie!")
      router.push("/dashboard")
    } catch (error) {
      console.error("Login error:", error)
      toast.error(error instanceof Error ? error.message : "Erreur de connexion. Vérifiez que le serveur est démarré.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary rounded-2xl">
              <Laptop className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-balance">Gestion de Réparation</h1>
          <p className="text-muted-foreground mt-2">Système de gestion d'ordinateurs</p>
        </div>

        <Card className="border-2">
          <CardHeader>
            <CardTitle>Connexion</CardTitle>
            <CardDescription>Entrez vos identifiants pour accéder au système</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="votre@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Connexion..." : "Se connecter"}
              </Button>
            </form>

            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground text-center">Compte de test: admin@repair.com / admin123</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
