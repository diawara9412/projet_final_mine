package com.repair.machinemanagement.service;

import com.repair.machinemanagement.dto.LoginRequest;
import com.repair.machinemanagement.dto.LoginResponse;
import com.repair.machinemanagement.entity.User;
import com.repair.machinemanagement.exceptions.ResourceNotFoundException;
import com.repair.machinemanagement.exceptions.UnauthorizedException;
import com.repair.machinemanagement.repository.UserRepository;
import com.repair.machinemanagement.security.JwtTokenProvider;
import com.repair.machinemanagement.security.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

/**
 * Service d'authentification pour les utilisateurs internes
 * (ADMIN, TECHNICIEN, SECRETAIRE, etc.)
 */
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;

    public LoginResponse login(LoginRequest request) {

        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail().trim(),
                            request.getPassword()
                    )
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);

            String jwt = tokenProvider.generateToken(authentication);

            UserDetailsImpl userDetails =
                    (UserDetailsImpl) authentication.getPrincipal();

            User user = userRepository.findByEmail(userDetails.getEmail())
                    .orElseThrow(() ->
                            new ResourceNotFoundException("Utilisateur introuvable")
                    );

            return LoginResponse.builder()
                    .id(user.getId())
                    .nom(user.getNom())
                    .prenom(user.getPrenom())
                    .email(user.getEmail())
                    .role(user.getRole().name())
                    .token(jwt)
                    .message("Connexion réussie")
                    .build();

        } catch (BadCredentialsException ex) {
            throw new UnauthorizedException(
                    null,
                    "Email ou mot de passe incorrect"
            );
        } catch (DisabledException ex) {
            throw new UnauthorizedException(
                    null,
                    "Votre compte est désactivé. Contactez l’administrateur."
            );
        }
    }
}
