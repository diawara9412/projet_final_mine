"use client"

import React from "react"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Clock,
  Wrench,
  CheckCircle2,
  AlertTriangle,
  CreditCard,
  Package,
  Calendar,
  User,
  FileText,
  Info,
  History,
} from "lucide-react"
import type { Machine } from "@/lib/api"

const statusConfig: Record<
  Machine["statut"],
  {
    label: string
    icon: React.ReactNode
    className: string
    bgClass: string
    description: string
  }
> = {
  EN_ATTENTE: {
    label: "En attente",
    icon: <Clock className="h-4 w-4" />,
    className: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    bgClass: "bg-amber-500/10",
    description: "Votre machine est en attente de prise en charge par un technicien.",
  },
  EN_COURS: {
    label: "En cours de reparation",
    icon: <Wrench className="h-4 w-4" />,
    className: "bg-primary/20 text-primary border-primary/30",
    bgClass: "bg-primary/10",
    description: "Un technicien travaille actuellement sur votre machine.",
  },
  TERMINE: {
    label: "Reparation terminee",
    icon: <CheckCircle2 className="h-4 w-4" />,
    className: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    bgClass: "bg-emerald-500/10",
    description: "La reparation est terminee. Vous pouvez venir recuperer votre machine.",
  },
  ANOMALIE: {
    label: "Anomalie detectee",
    icon: <AlertTriangle className="h-4 w-4" />,
    className: "bg-red-500/20 text-red-400 border-red-500/30",
    bgClass: "bg-red-500/10",
    description: "Un probleme a ete detecte. Nous vous contacterons pour plus de details.",
  },
  PAYE: {
    label: "Paiement effectue",
    icon: <CreditCard className="h-4 w-4" />,
    className: "bg-teal-500/20 text-teal-400 border-teal-500/30",
    bgClass: "bg-teal-500/10",
    description: "Le paiement a ete recu. Merci de votre confiance.",
  },
  REMIS_AU_CLIENT: {
    label: "Remis au client",
    icon: <Package className="h-4 w-4" />,
    className: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    bgClass: "bg-emerald-500/10",
    description: "Votre machine vous a ete remise. Bonne utilisation!",
  },
}

const statusOrder: Machine["statut"][] = [
  "EN_ATTENTE",
  "EN_COURS",
  "TERMINE",
  "PAYE",
  "REMIS_AU_CLIENT",
]

function formatDate(dateString: string | null): string {
  if (!dateString) return "-"
  const date = new Date(dateString)
  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

function formatDateTime(dateString: string | null): string {
  if (!dateString) return "-"
  const date = new Date(dateString)
  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

interface MachineDetailModalProps {
  machine: Machine | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MachineDetailModal({ machine, open, onOpenChange }: MachineDetailModalProps) {
  if (!machine) return null

  const status = statusConfig[machine.statut]
  const currentStatusIndex = statusOrder.indexOf(machine.statut)
  const isAnomaly = machine.statut === "ANOMALIE"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-card border-border/50 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl text-foreground">
            <div className={`h-10 w-10 rounded-lg ${status.bgClass} flex items-center justify-center`}>
              <Wrench className="h-5 w-5 text-primary" />
            </div>
            {machine.marque} {machine.modele}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status Badge & Description */}
          <div className={`p-4 rounded-lg ${status.bgClass} border ${status.className}`}>
            <div className="flex items-center gap-2 mb-2">
              <Badge className={`${status.className} border`}>
                {status.icon}
                <span className="ml-1.5">{status.label}</span>
              </Badge>
            </div>
            <p className="text-sm text-foreground/80">{status.description}</p>
          </div>

          {/* Timeline */}
          {!isAnomaly && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
                <History className="h-4 w-4 text-muted-foreground" />
                Progression
              </h3>
              <div className="flex items-center gap-1">
                {statusOrder.map((s, index) => {
                  const isCompleted = index <= currentStatusIndex
                  const isCurrent = index === currentStatusIndex
                  return (
                    <div key={s} className="flex items-center flex-1">
                      <div
                        className={`h-2 flex-1 rounded-full transition-colors ${
                          isCompleted ? "bg-primary" : "bg-secondary"
                        } ${isCurrent ? "animate-pulse" : ""}`}
                      />
                      {index < statusOrder.length - 1 && <div className="w-1" />}
                    </div>
                  )
                })}
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Attente</span>
                <span>Reparation</span>
                <span>Termine</span>
                <span>Paye</span>
                <span>Remis</span>
              </div>
            </div>
          )}

          <Separator className="bg-border/50" />

          {/* Details */}
          <div className="grid grid-cols-2 gap-4">
            <DetailItem
              icon={<FileText className="h-4 w-4" />}
              label="Numero de serie"
              value={machine.numeroSerie || "Non specifie"}
            />
            <DetailItem
              icon={<Calendar className="h-4 w-4" />}
              label="Date de rendez-vous"
              value={formatDate(machine.rendezVous)}
            />
            <DetailItem
              icon={<User className="h-4 w-4" />}
              label="Technicien assigne"
              value={
                machine.technicien
                  ? `${machine.technicien.prenom} ${machine.technicien.nom}`
                  : "Non assigne"
              }
            />
            <DetailItem
              icon={<Calendar className="h-4 w-4" />}
              label="Date de creation"
              value={formatDateTime(machine.createdAt)}
            />
          </div>

          {/* Defaut */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              Probleme signale
            </h3>
            <div className="p-3 rounded-lg bg-secondary/50">
              <p className="text-sm text-foreground">{machine.defaut}</p>
            </div>
          </div>

          {/* Remarque Technicien */}
          {machine.remarqueTechnicien && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
                <Info className="h-4 w-4 text-muted-foreground" />
                Note du technicien
              </h3>
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                <p className="text-sm text-foreground">{machine.remarqueTechnicien}</p>
              </div>
            </div>
          )}

          <Separator className="bg-border/50" />

          {/* Financial Info */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              Informations de paiement
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-secondary/50">
                <p className="text-sm text-muted-foreground mb-1">Montant estimatif</p>
                <p className="text-2xl font-bold text-foreground">
                  {machine.montant ? `${machine.montant.toFixed(2)} DH` : "-"}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-secondary/50">
                <p className="text-sm text-muted-foreground mb-1">Statut de paiement</p>
                <Badge
                  className={
                    machine.paye
                      ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30 border"
                      : "bg-amber-500/20 text-amber-400 border-amber-500/30 border"
                  }
                >
                  {machine.paye ? "Paye" : "En attente"}
                </Badge>
                {machine.datePaiement && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Paye le {formatDate(machine.datePaiement)}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Remise Info */}
          {machine.dateRemise && (
            <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
              <div className="flex items-center gap-2 text-emerald-400">
                <Package className="h-5 w-5" />
                <span className="font-medium">Machine remise le {formatDateTime(machine.dateRemise)}</span>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function DetailItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="text-muted-foreground mt-0.5">{icon}</div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium text-foreground">{value}</p>
      </div>
    </div>
  )
}
