package com.repair.machinemanagement.controller;

import com.repair.machinemanagement.dto.ClientRequest;
import com.repair.machinemanagement.entity.Client;
import com.repair.machinemanagement.service.ClientService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/clients")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173","http://localhost:3001"})
public class ClientController {

    private final ClientService clientService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SECRETAIRE', 'TECHNICIEN')")
    public ResponseEntity<List<Client>> getAllClients() {
        return ResponseEntity.ok(clientService.getAllClients());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SECRETAIRE', 'TECHNICIEN')")
    public ResponseEntity<Client> getClientById(@PathVariable Long id) {
        return ResponseEntity.ok(clientService.getClientById(id));
    }

    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('ADMIN', 'SECRETAIRE', 'TECHNICIEN')")
    public ResponseEntity<List<Client>> searchClients(@RequestParam String keyword) {
        return ResponseEntity.ok(clientService.searchClients(keyword));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SECRETAIRE')")
    public ResponseEntity<Map<String, Object>> createClient(@Valid @RequestBody ClientRequest request) {
        Client client = clientService.createClient(request);
        Map<String, Object> response = new HashMap<>();
        response.put("client", client);
        response.put("message", "Client créé avec succès. Un email avec les identifiants a été envoyé.");
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SECRETAIRE')")
    public ResponseEntity<Client> updateClient(@PathVariable Long id, @Valid @RequestBody ClientRequest request) {
        return ResponseEntity.ok(clientService.updateClient(id, request));
    }

    @PostMapping("/{id}/resend-credentials")
    @PreAuthorize("hasAnyRole('ADMIN', 'SECRETAIRE')")
    public ResponseEntity<Map<String, String>> resendCredentials(@PathVariable Long id) {
        clientService.resendCredentials(id);
        return ResponseEntity.ok(Map.of("message", "Identifiants renvoyés avec succès"));
    }

    @PostMapping("/{id}/toggle-status")
    @PreAuthorize("hasAnyRole('ADMIN', 'SECRETAIRE')")
    public ResponseEntity<Map<String, Object>> toggleClientStatus(@PathVariable Long id) {
        Client client = clientService.toggleClientStatus(id);
        String status = client.getActive() ? "activé" : "désactivé";
        return ResponseEntity.ok(Map.of(
                "client", client,
                "message", "Compte client " + status
        ));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> deleteClient(@PathVariable Long id) {
        clientService.deleteClient(id);
        return ResponseEntity.ok(Map.of("message", "Client supprimé avec succès"));
    }
}
