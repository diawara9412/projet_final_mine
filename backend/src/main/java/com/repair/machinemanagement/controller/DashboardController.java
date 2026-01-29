package com.repair.machinemanagement.controller;

import com.repair.machinemanagement.entity.Machine;
import com.repair.machinemanagement.service.ClientService;
import com.repair.machinemanagement.service.MachineService;
import com.repair.machinemanagement.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class DashboardController {
    
    private final MachineService machineService;
    private final ClientService clientService;
    private final UserService userService;
    
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        Map<String, Object> stats = new HashMap<>();
        
        stats.put("totalMachines", machineService.getAllMachines().size());
        stats.put("totalClients", clientService.getAllClients().size());
        stats.put("totalUsers", userService.getAllUsers().size());
        stats.put("enCours", machineService.getMachinesByStatut(Machine.Statut.EN_COURS).size());
        stats.put("termine", machineService.getMachinesByStatut(Machine.Statut.TERMINE).size());
        stats.put("anomalie", machineService.getMachinesByStatut(Machine.Statut.ANOMALIE).size());
        stats.put("enAttente", machineService.getMachinesByStatut(Machine.Statut.EN_ATTENTE).size());
        
        return ResponseEntity.ok(stats);
    }
}
