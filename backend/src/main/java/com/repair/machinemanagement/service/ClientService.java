package com.repair.machinemanagement.service;

import com.repair.machinemanagement.dto.ClientRequest;
import com.repair.machinemanagement.dto.PasswordChangeRequest;
import com.repair.machinemanagement.entity.Client;
import com.repair.machinemanagement.exceptions.AlreadyExistException;
import com.repair.machinemanagement.exceptions.BadRequestException;
import com.repair.machinemanagement.exceptions.ResourceNotFoundException;
import com.repair.machinemanagement.repository.ClientRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ClientService {

    private final ClientRepository clientRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    private static final String CHARACTERS =
            "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
    private static final int PASSWORD_LENGTH = 10;

    /* ===================== READ ===================== */

    public List<Client> getAllClients() {
        return clientRepository.findAll();
    }

    public Client getClientById(Long id) {
        return clientRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Client non trouvé")
                );
    }

    public Client getClientByIdentifiant(String identifiant) {
        return clientRepository.findByIdentifiant(identifiant)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Client non trouvé")
                );
    }

    public Client getClientByEmailOrIdentifiant(String login) {
        return clientRepository.findByEmailOrIdentifiant(login, login)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Client non trouvé")
                );
    }

    public List<Client> searchClients(String keyword) {
        return clientRepository
                .findByNomContainingIgnoreCaseOrPrenomContainingIgnoreCase(
                        keyword, keyword
                );
    }

    /* ===================== CREATE ===================== */

    @Transactional
    public Client createClient(ClientRequest request) {

        if (clientRepository.existsByNumero(request.getNumero())) {
            throw new AlreadyExistException("Numéro de téléphone déjà utilisé");
        }

        if (request.getEmail() != null &&
                clientRepository.existsByEmail(request.getEmail())) {
            throw new AlreadyExistException("Email déjà utilisé");
        }

        String identifiant = generateUniqueIdentifiant();
        String plainPassword = generateRandomPassword();

        Client client = Client.builder()
                .nom(request.getNom())
                .prenom(request.getPrenom())
                .adresse(request.getAdresse())
                .numero(request.getNumero())
                .email(request.getEmail())
                .identifiant(identifiant)
                .password(passwordEncoder.encode(plainPassword))
                .active(true)
                .credentialsSent(false)
                .autres(request.getAutres())
                .build();

        Client savedClient = clientRepository.save(client);

        if (request.getEmail() != null &&
                !request.getEmail().isBlank() &&
                (request.getSendCredentials() == null || request.getSendCredentials())) {
            try {
                emailService.sendClientCredentials(savedClient, plainPassword);
                savedClient.setCredentialsSent(true);
                clientRepository.save(savedClient);
                log.info("Identifiants envoyés au client : {}", savedClient.getIdentifiant());
            } catch (Exception e) {
                log.warn("Échec envoi email au client {}", savedClient.getIdentifiant());
            }
        }

        return savedClient;
    }

    /* ===================== UPDATE ===================== */

    @Transactional
    public Client updateClient(Long id, ClientRequest request) {

        Client client = getClientById(id);

        if (!client.getNumero().equals(request.getNumero()) &&
                clientRepository.existsByNumero(request.getNumero())) {
            throw new AlreadyExistException("Numéro de téléphone déjà utilisé");
        }

        if (request.getEmail() != null &&
                !request.getEmail().equals(client.getEmail()) &&
                clientRepository.existsByEmail(request.getEmail())) {
            throw new AlreadyExistException("Email déjà utilisé");
        }

        client.setNom(request.getNom());
        client.setPrenom(request.getPrenom());
        client.setAdresse(request.getAdresse());
        client.setNumero(request.getNumero());
        client.setEmail(request.getEmail());
        client.setAutres(request.getAutres());

        return clientRepository.save(client);
    }

    /* ===================== PASSWORD ===================== */
    @Transactional
    public void changePassword(Long clientId, PasswordChangeRequest request) {

        Client client = getClientById(clientId);

        if (!passwordEncoder.matches(request.getOldPassword(), client.getPassword())) {
            throw new BadRequestException("Ancien mot de passe incorrect");
        }

        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("Les mots de passe ne correspondent pas");
        }

        client.setPassword(passwordEncoder.encode(request.getNewPassword()));
        clientRepository.save(client);
    }

    /* ===================== CREDENTIALS ===================== */

    @Transactional
    public void resendCredentials(Long clientId) {

        Client client = getClientById(clientId);

        if (client.getEmail() == null || client.getEmail().isBlank()) {
            throw new BadRequestException(
                    "Le client ne possède pas d'adresse email"
            );
        }

        String newPassword = generateRandomPassword();
        client.setPassword(passwordEncoder.encode(newPassword));
        clientRepository.save(client);

        emailService.sendClientCredentials(client, newPassword);
        client.setCredentialsSent(true);
        clientRepository.save(client);

        log.info("Identifiants renvoyés au client {}", client.getIdentifiant());
    }

    /* ===================== STATUS / DELETE ===================== */

    @Transactional
    public Client toggleClientStatus(Long clientId) {
        Client client = getClientById(clientId);
        client.setActive(!client.getActive());
        return clientRepository.save(client);
    }

    public void deleteClient(Long id) {
        Client client = getClientById(id);
        clientRepository.delete(client);
    }

    /* ===================== UTILS ===================== */

    private String generateUniqueIdentifiant() {
        long count = clientRepository.count() + 1;
        String identifiant;
        do {
            identifiant = String.format("CLT-%05d", count++);
        } while (clientRepository.existsByIdentifiant(identifiant));
        return identifiant;
    }

    private String generateRandomPassword() {
        SecureRandom random = new SecureRandom();
        StringBuilder sb = new StringBuilder(PASSWORD_LENGTH);
        for (int i = 0; i < PASSWORD_LENGTH; i++) {
            sb.append(CHARACTERS.charAt(
                    random.nextInt(CHARACTERS.length())
            ));
        }
        return sb.toString();
    }
}
