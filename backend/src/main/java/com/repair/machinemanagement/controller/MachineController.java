package com.repair.machinemanagement.controller;

import com.repair.machinemanagement.dto.MachineRequest;
import com.repair.machinemanagement.entity.Machine;
import com.repair.machinemanagement.service.MachineService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/machines")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173","http://localhost:3001"})
public class MachineController {
    
    private final MachineService machineService;
    
    @GetMapping
    public ResponseEntity<List<Machine>> getAllMachines() {
        return ResponseEntity.ok(machineService.getAllMachines());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Machine> getMachineById(@PathVariable Long id) {
        return ResponseEntity.ok(machineService.getMachineById(id));
    }
    
    @GetMapping("/statut/{statut}")
    public ResponseEntity<List<Machine>> getMachinesByStatut(@PathVariable Machine.Statut statut) {
        return ResponseEntity.ok(machineService.getMachinesByStatut(statut));
    }
    
    @GetMapping("/client/{clientId}")
    public ResponseEntity<List<Machine>> getMachinesByClient(@PathVariable Long clientId) {
        return ResponseEntity.ok(machineService.getMachinesByClient(clientId));
    }
    
    @GetMapping("/secretaire/{secretaireId}")
    public ResponseEntity<List<Machine>> getMachinesBySecretaire(@PathVariable Long secretaireId) {
        return ResponseEntity.ok(machineService.getMachinesBySecretaire(secretaireId));
    }
    
    @GetMapping("/technicien/{technicienId}")
    public ResponseEntity<List<Machine>> getMachinesByTechnicien(@PathVariable Long technicienId) {
        return ResponseEntity.ok(machineService.getMachinesByTechnicien(technicienId));
    }
    
    @GetMapping("/search")
    public ResponseEntity<List<Machine>> searchMachines(@RequestParam String keyword) {
        return ResponseEntity.ok(machineService.searchMachines(keyword));
    }
    
    @PostMapping
    public ResponseEntity<?> createMachine(@Valid @RequestBody MachineRequest request) {
        try {
            Machine machine = machineService.createMachine(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(machine);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<?> updateMachine(@PathVariable Long id, @Valid @RequestBody MachineRequest request) {
        try {
            Machine machine = machineService.updateMachine(id, request);
            return ResponseEntity.ok(machine);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteMachine(@PathVariable Long id) {
        try {
            machineService.deleteMachine(id);
            return ResponseEntity.ok("Machine supprimée avec succès");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
