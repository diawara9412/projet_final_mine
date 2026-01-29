package com.repair.machinemanagement.dto;

import com.repair.machinemanagement.entity.User;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class UserRequest {
    @NotBlank(message = "Nom est obligatoire")
    private String nom;
    
    @NotBlank(message = "Prénom est obligatoire")
    private String prenom;
    
    @NotBlank(message = "Adresse est obligatoire")
    private String adresse;
    
    @NotBlank(message = "Numéro est obligatoire")
    private String numero;
    
    @NotBlank(message = "Email est obligatoire")
    @Email(message = "Email invalide")
    private String email;
    
    @NotBlank(message = "Mot de passe est obligatoire")
    @Size(min = 6, message = "Le mot de passe doit contenir au moins 6 caractères")
    private String password;
    
    @NotNull(message = "Rôle est obligatoire")
    private User.Role role;
}
