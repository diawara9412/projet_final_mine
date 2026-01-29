package com.repair.machinemanagement.entity;

import com.repair.machinemanagement.util.EncryptedStringConverter;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank(message = "Nom est obligatoire")
    @Column(nullable = false)
    @Convert(converter = EncryptedStringConverter.class)
    private String nom;
    
    @NotBlank(message = "Prénom est obligatoire")
    @Column(nullable = false)
    @Convert(converter = EncryptedStringConverter.class)
    private String prenom;

    @Convert(converter = EncryptedStringConverter.class)
    @NotBlank(message = "Adresse est obligatoire")
    private String adresse;
    
    @NotBlank(message = "Numéro est obligatoire")
    @Column(unique = true)
    @Convert(converter = EncryptedStringConverter.class)
    private String numero;
    
    @NotBlank(message = "Email est obligatoire")
    @Email(message = "Email invalide")
    @Column(unique = true, nullable = false)
    private String email;
    
    @NotBlank(message = "Mot de passe est obligatoire")
    @Column(nullable = false)
    private String password;
    
    @NotNull(message = "Rôle est obligatoire")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    private Boolean active = true;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    public enum Role {
        ADMIN, SECRETAIRE, TECHNICIEN
    }
}
