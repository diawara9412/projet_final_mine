"use client"

import React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Clock, 
  Wrench, 
  CheckCircle2, 
  AlertTriangle, 
  CreditCard, 
  Package,
  Calendar,
  User,
  ChevronRight
} from "lucide-react"
import type { Machine } from "@/lib/api"

const statusConfig: Record<Machine["statut"], { 
  label: string
  icon: React.ReactNode
  className: string
  bgClass: string
}> = {
  EN_ATTENTE: {
    label: "En attente",
    icon: <Clock className="h-4 w-4" />,
    className: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    bgClass: "bg-amber-500/10",
  },
  EN_COURS: {
    label: "En cours",
    icon: <Wrench className="h-4 w-4" />,
    className: "bg-primary/20 text-primary border-primary/30",
    bgClass: "bg-primary/10",
  },
  TERMINE: {
    label: "Termine",
    icon: <CheckCircle2 className="h-4 w-4" />,
    className: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    bgClass: "bg-emerald-500/10",
  },
  ANOMALIE: {
    label: "Anomalie",
    icon: <AlertTriangle className="h-4 w-4" />,
    className: "bg-red-500/20 text-red-400 border-red-500/30",
    bgClass: "bg-red-500/10",
  },
  PAYE: {
    label: "Paye",
    icon: <CreditCard className="h-4 w-4" />,
    className: "bg-teal-500/20 text-teal-400 border-teal-500/30",
    bgClass: "bg-teal-500/10",
  },
  REMIS_AU_CLIENT: {
    label: "Remis",
    icon: <Package className="h-4 w-4" />,
    className: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    bgClass: "bg-emerald-500/10",
  },
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

interface MachineCardProps {
  machine: Machine
  onClick?: () => void
}

export function MachineCard({ machine, onClick }: MachineCardProps) {
  const status = statusConfig[machine.statut]

  return (
    <Card 
      className="border-border/50 bg-card/80 hover:bg-card hover:border-primary/30 transition-all duration-200 cursor-pointer group"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`h-12 w-12 rounded-lg ${status.bgClass} flex items-center justify-center`}>
              <Wrench className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-foreground">
                {machine.marque} {machine.modele}
              </CardTitle>
              {machine.numeroSerie && (
                <p className="text-sm text-muted-foreground">
                  S/N: {machine.numeroSerie}
                </p>
              )}
            </div>
          </div>
          <Badge className={`${status.className} border flex items-center gap-1.5`}>
            {status.icon}
            {status.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Defaut */}
        <div className="p-3 rounded-lg bg-secondary/50">
          <p className="text-sm font-medium text-foreground mb-1">Probleme signale</p>
          <p className="text-sm text-muted-foreground line-clamp-2">{machine.defaut}</p>
        </div>

        {/* Details */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">RDV:</span>
            <span className="text-foreground font-medium">{formatDate(machine.rendezVous)}</span>
          </div>
          {machine.technicien && (
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Tech:</span>
              <span className="text-foreground font-medium">
                {machine.technicien.prenom} {machine.technicien.nom.charAt(0)}.
              </span>
            </div>
          )}
        </div>

        {/* Montant */}
        {machine.montant && (
          <div className="flex items-center justify-between pt-3 border-t border-border/50">
            <span className="text-sm text-muted-foreground">Montant estimatif</span>
            <span className="text-lg font-semibold text-foreground">{machine.montant.toFixed(2)} DH</span>
          </div>
        )}

        {/* Remarque technicien */}
        {machine.remarqueTechnicien && (
          <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
            <p className="text-sm font-medium text-primary mb-1">Note du technicien</p>
            <p className="text-sm text-muted-foreground">{machine.remarqueTechnicien}</p>
          </div>
        )}

        {/* Action */}
        <div className="flex items-center justify-end text-sm text-primary group-hover:translate-x-1 transition-transform">
          <span>Voir les details</span>
          <ChevronRight className="h-4 w-4 ml-1" />
        </div>
      </CardContent>
    </Card>
  )
}
