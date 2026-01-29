"use client"

import React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth, isAdmin } from "@/lib/auth-context"
import { changePassword } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import {
  Loader2,
  Wrench,
  ArrowLeft,
  Key,
  User,
  Mail,
  Hash,
  Eye,
  EyeOff,
  CheckCircle2,
  Shield,
} from "lucide-react"

export default function SettingsPage() {
  const { client, isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()

  const [oldPassword, setOldPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showOldPassword, setShowOldPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/")
    }
  }, [authLoading, isAuthenticated, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    // Validation
    if (newPassword !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas")
      return
    }

    if (newPassword.length < 6) {
      setError("Le nouveau mot de passe doit contenir au moins 6 caracteres")
      return
    }


    setIsSubmitting(true)
    try {
     await changePassword(oldPassword, newPassword, confirmPassword)
      setSuccess("Mot de passe modifie avec succes")
      setOldPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors du changement de mot de passe")
    } finally {
      setIsSubmitting(false)
    }
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
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/dashboard")}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Wrench className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-foreground">Parametres</h1>
                <p className="text-xs text-muted-foreground">Gerez votre compte</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Profile Info Card */}
        <Card className="border-border/50 bg-card/80 mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <User className="h-5 w-5 text-primary" />
              Informations du compte
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Vos informations personnelles
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoItem icon={<User className="h-4 w-4" />} label="Nom complet" value={`${client?.prenom} ${client?.nom}`} />
              <InfoItem icon={<Hash className="h-4 w-4" />} label="Identifiant" value={client?.identifiant || client?.email || "-"} />
              <InfoItem icon={<Mail className="h-4 w-4" />} label="Email" value={client?.email || "-"} />
              <InfoItem 
                icon={<Shield className="h-4 w-4" />} 
                label="Role" 
                value={isAdmin(client) ? "Administrateur" : "Client"} 
              />
            </div>
          </CardContent>
        </Card>

        {/* Change Password Card */}
        <Card className="border-border/50 bg-card/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Key className="h-5 w-5 text-primary" />
              Changer le mot de passe
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Mettez a jour votre mot de passe pour securiser votre compte
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive" className="bg-destructive/10 border-destructive/30">
                  <AlertDescription className="text-destructive">{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="bg-emerald-500/10 border-emerald-500/30">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <AlertDescription className="text-emerald-400">{success}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="oldPassword" className="text-foreground">
                  Mot de passe actuel
                </Label>
                <div className="relative">
                  <Input
                    id="oldPassword"
                    type={showOldPassword ? "text" : "password"}
                    placeholder="Votre mot de passe actuel"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    required
                    className="bg-input border-border focus:border-primary focus:ring-primary pr-10 text-foreground placeholder:text-muted-foreground"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showOldPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Separator className="bg-border/50" />

              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-foreground">
                  Nouveau mot de passe
                </Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    placeholder="Minimum 6 caracteres"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                    className="bg-input border-border focus:border-primary focus:ring-primary pr-10 text-foreground placeholder:text-muted-foreground"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-foreground">
                  Confirmer le nouveau mot de passe
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirmez votre nouveau mot de passe"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    className="bg-input border-border focus:border-primary focus:ring-primary pr-10 text-foreground placeholder:text-muted-foreground"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Password strength indicator */}
              {newPassword && (
                <div className="space-y-2">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          newPassword.length >= level * 3
                            ? newPassword.length >= 12
                              ? "bg-emerald-500"
                              : newPassword.length >= 8
                              ? "bg-amber-500"
                              : "bg-red-500"
                            : "bg-secondary"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Force du mot de passe:{" "}
                    {newPassword.length >= 12
                      ? "Fort"
                      : newPassword.length >= 8
                      ? "Moyen"
                      : newPassword.length >= 6
                      ? "Faible"
                      : "Tres faible"}
                  </p>
                </div>
              )}

              <div className="pt-4">
                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Modification en cours...
                    </>
                  ) : (
                    "Modifier le mot de passe"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Security Tips */}
        <Card className="border-border/50 bg-card/50 mt-6">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-foreground mb-2">Conseils de securite</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>Utilisez un mot de passe unique pour chaque compte</li>
                  <li>Combinez lettres majuscules, minuscules, chiffres et symboles</li>
                  <li>Ne partagez jamais votre mot de passe</li>
                  <li>Changez regulierement votre mot de passe</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30">
      <div className="text-muted-foreground">{icon}</div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium text-foreground">{value}</p>
      </div>
    </div>
  )
}  