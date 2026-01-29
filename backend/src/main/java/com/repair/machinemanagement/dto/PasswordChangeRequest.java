package com.repair.machinemanagement.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO pour la demande de changement de mot de passe.
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class PasswordChangeRequest {
    
    @NotBlank(message = "Ancien mot de passe est obligatoire")
    private String oldPassword;
    
    @NotBlank(message = "Nouveau mot de passe est obligatoire")
    @Size(min = 8, message = "Le mot de passe doit contenir au moins 8 caractères")
    private String newPassword;
    
    @NotBlank(message = "Confirmation du mot de passe est obligatoire")
    private String confirmPassword;
}
