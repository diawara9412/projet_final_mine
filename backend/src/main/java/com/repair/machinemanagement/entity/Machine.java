package com.repair.machinemanagement.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "machines")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Machine {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank(message = "Marque est obligatoire")
    @Column(nullable = false)
    private String marque;
    
    @NotBlank(message = "Modèle est obligatoire")
    @Column(nullable = false)
    private String modele;
    
    @Column(name = "numero_serie")
    private String numeroSerie;
    
    @NotBlank(message = "Défaut est obligatoire")
    @Column(nullable = false, columnDefinition = "TEXT")
    private String defaut;
    
    @Column(name = "photo_url")
    private String photoUrl;
    
    @NotNull(message = "Date de rendez-vous est obligatoire")
    @Column(name = "rendez_vous")
    private LocalDate rendezVous;
    
    @NotNull(message = "Statut est obligatoire")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Statut statut;
    
    @Column(name = "montant")
    private Double montant;
    
    @Column(name = "paye")
    private Boolean paye = false;
    
    @Column(name = "remarque_technicien", columnDefinition = "TEXT")
    private String remarqueTechnicien;
    
    // Date de remise de la machine au client
    @Column(name = "date_remise")
    private LocalDateTime dateRemise;
    
    // Date de paiement
    @Column(name = "date_paiement")
    private LocalDateTime datePaiement;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "client_id", nullable = false)
    private Client client;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "secretaire_id", nullable = false)
    private User secretaire;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "technicien_id")
    private User technicien;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    public enum Statut {
        EN_ATTENTE,          // Machine en attente de réparation
        EN_COURS,            // Réparation en cours
        TERMINE,             // Réparation terminée
        ANOMALIE,            // Problème détecté
        PAYE,                // Client a payé
        REMIS_AU_CLIENT      // Machine remise au client
    }
}
