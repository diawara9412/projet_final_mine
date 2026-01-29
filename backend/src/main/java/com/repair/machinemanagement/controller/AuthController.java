package com.repair.machinemanagement.controller;

import com.repair.machinemanagement.dto.*;
import com.repair.machinemanagement.entity.Client;
import com.repair.machinemanagement.entity.Machine;
import com.repair.machinemanagement.security.ClientDetailsImpl;
import com.repair.machinemanagement.security.JwtTokenProvider;
import com.repair.machinemanagement.service.AuthService;
import com.repair.machinemanagement.service.ClientAuthService;
import com.repair.machinemanagement.service.ClientService;
import com.repair.machinemanagement.service.MachineService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(
        origins = {"http://localhost:3001", "http://localhost:3000", "http://localhost:5173", "http://localhost:5174"},
        allowCredentials = "true"
)
public class AuthController {

    private final AuthService authService;
    private final ClientAuthService clientAuthService;
    private final ClientService clientService;
    private final MachineService machineService;
    private final JwtTokenProvider jwtTokenProvider;

    private static final String JWT_COOKIE_NAME = "auth_token";
    private static final int COOKIE_MAX_AGE = 24 * 60 * 60;

    /* ===================== AUTH ===================== */

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request,
                                   HttpServletResponse response) {

        LoginResponse loginResponse = authService.login(request);
        setAuthCookie(response, loginResponse.getToken());

        return ResponseEntity.ok(Map.of(
                "id", loginResponse.getId(),
                "nom", loginResponse.getNom(),
                "prenom", loginResponse.getPrenom(),
                "email", loginResponse.getEmail(),
                "role", loginResponse.getRole(),
                "message", loginResponse.getMessage()
        ));
    }

    @PostMapping("/client/login")
    public ResponseEntity<?> clientLogin(@Valid @RequestBody ClientLoginRequest request,
                                         HttpServletResponse response) {

        // 1️⃣ Tentative client
        try {
            ClientLoginResponse clientResponse = clientAuthService.login(request);
            setAuthCookie(response, clientResponse.getToken());

            return ResponseEntity.ok(Map.of(
                    "id", clientResponse.getId(),
                    "identifiant", clientResponse.getIdentifiant(),
                    "nom", clientResponse.getNom(),
                    "prenom", clientResponse.getPrenom(),
                    "email", clientResponse.getEmail(),
                    "role", clientResponse.getRole(),
                    "message", clientResponse.getMessage()
            ));
        } catch (Exception ignored) {
            // 2️⃣ Tentative staff
            LoginRequest staffRequest = new LoginRequest();
            staffRequest.setEmail(request.getIdentifiant());
            staffRequest.setPassword(request.getPassword());

            LoginResponse staffResponse = authService.login(staffRequest);
            setAuthCookie(response, staffResponse.getToken());

            return ResponseEntity.ok(Map.of(
                    "id", staffResponse.getId(),
                    "nom", staffResponse.getNom(),
                    "prenom", staffResponse.getPrenom(),
                    "email", staffResponse.getEmail(),
                    "role", staffResponse.getRole(),
                    "message", staffResponse.getMessage()
            ));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletResponse response) {
        clearAuthCookie(response);
        return ResponseEntity.ok(Map.of("message", "Déconnexion réussie"));
    }

    @GetMapping("/verify")
    public ResponseEntity<?> verify(@CookieValue(value = JWT_COOKIE_NAME, required = false) String token) {

        if (token == null || !jwtTokenProvider.validateToken(token)) {
            return ResponseEntity.status(401).body(Map.of("authenticated", false));
        }

        Map<String, Object> userInfo = jwtTokenProvider.getUserInfoFromToken(token);
        userInfo.put("authenticated", true);
        return ResponseEntity.ok(userInfo);
    }

    /* ===================== CLIENT ===================== */

    @GetMapping("/client/{clientId}")
    public Client getClient(@PathVariable Long clientId) {
        return clientService.getClientById(clientId);
    }

    @GetMapping("/client/{clientId}/machines")
    public List<Machine> getClientMachines(@PathVariable Long clientId) {
        return machineService.getMachinesByClient(clientId);
    }

    @PostMapping("/client/change-password")
    @PreAuthorize("hasRole('CLIENT')")
    public ResponseEntity<?> changePassword(
            @AuthenticationPrincipal ClientDetailsImpl clientDetails,
            @Valid @RequestBody PasswordChangeRequest request) {

        clientService.changePassword(clientDetails.getId(), request);
        return ResponseEntity.ok(Map.of("message", "Mot de passe modifié avec succès"));
    }
    @GetMapping("/client/me")
    @PreAuthorize("hasRole('CLIENT')")
    public Client getMe(@AuthenticationPrincipal ClientDetailsImpl client) {
        return clientService.getClientById(client.getId());
    }


    /* ===================== ADMIN ===================== */

    @GetMapping("/admin/clients")
    public List<Client> getAllClients() {
        return clientService.getAllClients();
    }

    @GetMapping("/admin/machines")
    public List<Machine> getAllMachines() {
        return machineService.getAllMachines();
    }

    /* ===================== COOKIE ===================== */

    private void setAuthCookie(HttpServletResponse response, String token) {
        Cookie cookie = new Cookie(JWT_COOKIE_NAME, token);
        cookie.setHttpOnly(true);
        cookie.setSecure(false);
        cookie.setPath("/");
        cookie.setMaxAge(COOKIE_MAX_AGE);
        cookie.setAttribute("SameSite", "Lax");
        response.addCookie(cookie);
    }

    private void clearAuthCookie(HttpServletResponse response) {
        Cookie cookie = new Cookie(JWT_COOKIE_NAME, "");
        cookie.setHttpOnly(true);
        cookie.setSecure(false);
        cookie.setPath("/");
        cookie.setMaxAge(0);
        response.addCookie(cookie);
    }
}
