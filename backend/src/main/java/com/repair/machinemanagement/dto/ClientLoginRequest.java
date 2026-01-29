package com.repair.machinemanagement.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO pour la demande de connexion d'un client.
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ClientLoginRequest {
    
    @NotBlank(message = "Identifiant ou email est obligatoire")
    private String identifiant; // Peut être l'identifiant ou l'email
    
    @NotBlank(message = "Mot de passe est obligatoire")
    private String password;
}
