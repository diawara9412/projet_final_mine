package com.repair.machinemanagement.service;
import com.repair.machinemanagement.dto.ClientLoginRequest;
import com.repair.machinemanagement.dto.ClientLoginResponse;
import com.repair.machinemanagement.entity.Client;
import com.repair.machinemanagement.exceptions.BadRequestException;
import com.repair.machinemanagement.exceptions.ResourceNotFoundException;
import com.repair.machinemanagement.exceptions.UnauthorizedException;
import com.repair.machinemanagement.repository.ClientRepository;
import com.repair.machinemanagement.security.ClientDetailsImpl;
import com.repair.machinemanagement.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

/**
 * Service d'authentification pour les clients (portail-client).
 * Connexion via EMAIL ou IDENTIFIANT (insensible à la casse).
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ClientAuthService {

    private final ClientRepository clientRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    public ClientLoginResponse login(ClientLoginRequest request) {

        if (request.getIdentifiant() == null || request.getPassword() == null) {
            throw new BadRequestException("Email et mot de passe sont obligatoires");
        }

        String login = request.getIdentifiant().trim();

        Optional<Client> clientOpt = clientRepository.findByEmailIgnoreCase(login);
        if (clientOpt.isEmpty()) {
            clientOpt = clientRepository.findByIdentifiantIgnoreCase(login);
        }

        Client client = clientOpt.orElseThrow(() ->
                new ResourceNotFoundException("Email ou mot de passe incorrect")
        );

        if (!Boolean.TRUE.equals(client.getActive())) {
            throw new UnauthorizedException(null,
                    "Votre compte est désactivé. Contactez l'administration");
        }

        if (!passwordEncoder.matches(request.getPassword(), client.getPassword())) {
            throw new UnauthorizedException(null,
                    "Email ou mot de passe incorrect");
        }

        ClientDetailsImpl clientDetails = ClientDetailsImpl.build(client);

        Authentication authentication = new UsernamePasswordAuthenticationToken(
                clientDetails,
                null,
                clientDetails.getAuthorities()
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        String jwt = tokenProvider.generateClientToken(clientDetails);

        log.info("Client connecté : {}", client.getEmail());

        return ClientLoginResponse.builder()
                .id(client.getId())
                .identifiant(client.getIdentifiant())
                .nom(client.getNom())
                .prenom(client.getPrenom())
                .email(client.getEmail())
                .role("CLIENT")
                .token(jwt)
                .message("Connexion réussie")
                .build();
    }
}
