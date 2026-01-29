package com.repair.machinemanagement.dto;

import com.repair.machinemanagement.entity.Machine;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDate;

@Data
public class MachineRequest {
    @NotBlank(message = "Marque est obligatoire")
    private String marque;
    
    @NotBlank(message = "Modèle est obligatoire")
    private String modele;
    
    private String numeroSerie;
    
    @NotBlank(message = "Défaut est obligatoire")
    private String defaut;
    
    private String photoUrl;
    
    @NotNull(message = "Date de rendez-vous est obligatoire")
    private LocalDate rendezVous;
    
    private Double montant;
    
    private Boolean paye;
    
    private String remarqueTechnicien;
    
    @NotNull(message = "Client est obligatoire")
    private Long clientId;
    
    @NotNull(message = "Secrétaire est obligatoire")
    private Long secretaireId;
    
    private Long technicienId;
    
    private Machine.Statut statut;
}
