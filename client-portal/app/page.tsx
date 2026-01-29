"use client"

import React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Wrench, Shield, Clock, Eye, EyeOff } from "lucide-react"
import { useAuth, AuthProvider } from "@/lib/auth-context"

function LoginForm() {
  const [identifiant, setIdentifiant] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { login, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.push("/dashboard")
    }
  }, [isAuthenticated, isLoading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsSubmitting(true)

    try {
      await login(identifiant, password)
      router.push("/dashboard")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de connexion")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Wrench className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground">RepairTrack</h1>
              <p className="text-xs text-muted-foreground">Espace Client</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm shadow-2xl">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl font-bold text-foreground">Connexion</CardTitle>
              <CardDescription className="text-muted-foreground">
                Accedez a votre espace de suivi de reparation
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <Alert variant="destructive" className="bg-destructive/10 border-destructive/30">
                    <AlertDescription className="text-destructive">{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="identifiant" className="text-foreground">
                    Identifiant ou Email
                  </Label>
                  <Input
                    id="identifiant"
                    type="text"
                    placeholder="CLT-00001 ou votre@email.com"
                    value={identifiant}
                    onChange={(e) => setIdentifiant(e.target.value)}
                    required
                    className="bg-input border-border focus:border-primary focus:ring-primary text-foreground placeholder:text-muted-foreground"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-foreground">
                    Mot de passe
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Votre mot de passe"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="bg-input border-border focus:border-primary focus:ring-primary pr-10 text-foreground placeholder:text-muted-foreground"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Connexion en cours...
                    </>
                  ) : (
                    "Se connecter"
                  )}
                </Button>
              </form>

              <div className="mt-6 pt-6 border-t border-border/50">
                <p className="text-sm text-muted-foreground text-center">
                  Vos identifiants vous ont ete envoyes par email lors de votre inscription.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Features */}
          <div className="mt-8 grid grid-cols-3 gap-4">
            <FeatureCard
              icon={<Wrench className="h-5 w-5" />}
              title="Suivi en temps reel"
              description="Statut de reparation"
            />
            <FeatureCard
              icon={<Clock className="h-5 w-5" />}
              title="Notifications"
              description="Alertes par email"
            />
            <FeatureCard
              icon={<Shield className="h-5 w-5" />}
              title="Securise"
              description="Donnees protegees"
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-card/30 py-4">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            RepairTrack - Votre partenaire de confiance pour la reparation
          </p>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="text-center p-4 rounded-lg bg-card/50 border border-border/30">
      <div className="mx-auto h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mb-2 text-primary">
        {icon}
      </div>
      <h3 className="text-sm font-medium text-foreground">{title}</h3>
      <p className="text-xs text-muted-foreground mt-1">{description}</p>
    </div>
  )
}

export default function LoginPage() {
  return (
    <AuthProvider>
      <LoginForm />
    </AuthProvider>
  )
}
