package com.repair.machinemanagement.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO pour la réponse de connexion d'un client.
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ClientLoginResponse {
    private Long id;
    private String identifiant;
    private String nom;
    private String prenom;
    private String email;
    private String role;
    private String token;
    private String message;
}
