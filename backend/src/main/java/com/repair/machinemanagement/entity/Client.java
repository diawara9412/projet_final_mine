package com.repair.machinemanagement.entity;

import com.repair.machinemanagement.util.EncryptedStringConverter;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "clients")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Client {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Convert(converter = EncryptedStringConverter.class)
    @NotBlank(message = "Nom est obligatoire")
    @Column(nullable = false)
    private String nom;
    @Convert(converter = EncryptedStringConverter.class)
    @NotBlank(message = "Prénom est obligatoire")
    @Column(nullable = false)
    private String prenom;
    
    @NotBlank(message = "Adresse est obligatoire")
    @Convert(converter = EncryptedStringConverter.class)
    @Column(columnDefinition = "TEXT")
    private String adresse;
    
    @NotBlank(message = "Numéro est obligatoire")
    @Column(unique = true)
    @Convert(converter = EncryptedStringConverter.class)
    private String numero;

    @Convert(converter = EncryptedStringConverter.class)
    // Identifiant unique pour la connexion du client (généré automatiquement)
    @Column(unique = true, name = "identifiant")
    private String identifiant;
    
    @Email(message = "Email invalide")
    @Column(unique = true)
    private String email;
    
    // Mot de passe hashé avec BCrypt pour la connexion client
    @Column(name = "password")
    private String password;
    
    // Indique si le compte client est actif
    @Column(name = "active")
    @Builder.Default
    private Boolean active = true;
    
    // Indique si les identifiants ont été envoyés par email
    @Column(name = "credentials_sent")
    @Builder.Default
    private Boolean credentialsSent = false;
    
    private String autres;
    
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
}
