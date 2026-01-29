package com.repair.machinemanagement.service;

import com.repair.machinemanagement.dto.MachineRequest;
import com.repair.machinemanagement.entity.Client;
import com.repair.machinemanagement.entity.Machine;
import com.repair.machinemanagement.entity.User;
import com.repair.machinemanagement.exceptions.BadRequestException;
import com.repair.machinemanagement.exceptions.EmailSendException;
import com.repair.machinemanagement.exceptions.ResourceNotFoundException;
import com.repair.machinemanagement.repository.MachineRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MachineService {

    private final MachineRepository machineRepository;
    private final ClientService clientService;
    private final UserService userService;
    private final EmailService emailService;

    /* ===================== READ ===================== */

    public List<Machine> getAllMachines() {
        return machineRepository.findAll();
    }

    public Machine getMachineById(Long id) {
        return machineRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Machine non trouvée")
                );
    }

    public List<Machine> getMachinesByStatut(Machine.Statut statut) {
        return machineRepository.findByStatut(statut);
    }

    public List<Machine> getMachinesByClient(Long clientId) {
        return machineRepository.findByClientId(clientId);
    }

    public List<Machine> getMachinesBySecretaire(Long secretaireId) {
        return machineRepository.findBySecretaireId(secretaireId);
    }

    public List<Machine> getMachinesByTechnicien(Long technicienId) {
        return machineRepository.findByTechnicienId(technicienId);
    }

    public List<Machine> searchMachines(String keyword) {
        return machineRepository.searchMachines(keyword);
    }

    /* ===================== CREATE ===================== */

    public Machine createMachine(MachineRequest request) {

        Client client = clientService.getClientById(request.getClientId());
        User secretaire = userService.getUserById(request.getSecretaireId());

        if (secretaire.getRole() != User.Role.SECRETAIRE &&
                secretaire.getRole() != User.Role.ADMIN) {
            throw new BadRequestException(
                    "Seuls les secrétaires peuvent enregistrer des machines"
            );
        }

        User technicien = null;
        if (request.getTechnicienId() != null) {
            technicien = userService.getUserById(request.getTechnicienId());

            if (technicien.getRole() != User.Role.TECHNICIEN &&
                    technicien.getRole() != User.Role.ADMIN) {
                throw new BadRequestException("Technicien invalide");
            }
        }

        Machine machine = Machine.builder()
                .marque(request.getMarque())
                .modele(request.getModele())
                .numeroSerie(request.getNumeroSerie())
                .defaut(request.getDefaut())
                .photoUrl(request.getPhotoUrl())
                .rendezVous(request.getRendezVous())
                .statut(request.getStatut() != null
                        ? request.getStatut()
                        : Machine.Statut.EN_ATTENTE)
                .montant(request.getMontant())
                .paye(request.getPaye() != null ? request.getPaye() : false)
                .remarqueTechnicien(request.getRemarqueTechnicien())
                .client(client)
                .secretaire(secretaire)
                .technicien(technicien)
                .build();

        return machineRepository.save(machine);
    }

    /* ===================== UPDATE ===================== */
    public Machine updateMachine(Long id, MachineRequest request) {

        Machine machine = getMachineById(id);
        Machine.Statut ancienStatut = machine.getStatut(); // sauvegarde le statut actuel

        // Mise à jour des champs
        if (request.getClientId() != null) {
            Client client = clientService.getClientById(request.getClientId());
            machine.setClient(client);
        }

        if (request.getTechnicienId() != null) {
            User technicien = userService.getUserById(request.getTechnicienId());

            if (technicien.getRole() != User.Role.TECHNICIEN &&
                    technicien.getRole() != User.Role.ADMIN) {
                throw new BadRequestException("Technicien invalide");
            }

            machine.setTechnicien(technicien);
        }

        machine.setMarque(request.getMarque());
        machine.setModele(request.getModele());
        machine.setNumeroSerie(request.getNumeroSerie());
        machine.setDefaut(request.getDefaut());
        machine.setPhotoUrl(request.getPhotoUrl());
        machine.setRendezVous(request.getRendezVous());
        machine.setMontant(request.getMontant());
        machine.setPaye(request.getPaye());
        machine.setRemarqueTechnicien(request.getRemarqueTechnicien());

        if (request.getStatut() != null) {
            machine.setStatut(request.getStatut());
        }

        Machine updatedMachine = machineRepository.save(machine);

        // ✅ Si le statut a changé, envoi un email
        if (request.getStatut() != null && request.getStatut() != ancienStatut) {
            try {
                emailService.sendMachineStatusUpdate(updatedMachine.getClient(), updatedMachine);
            } catch (Exception e) {
                // On lance une exception personnalisée pour signaler l'échec de l'envoi
                throw new EmailSendException(
                        "Échec de l'envoi de l'email de mise à jour du statut pour le client "
                                + updatedMachine.getClient().getEmail(), e
                );
            }
        }

        return updatedMachine;
    }

    /* ===================== DELETE ===================== */

    public void deleteMachine(Long id) {
        Machine machine = getMachineById(id);
        machineRepository.delete(machine);
    }
}
