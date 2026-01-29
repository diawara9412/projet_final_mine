package com.repair.machinemanagement.repository;

import com.repair.machinemanagement.entity.Machine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MachineRepository extends JpaRepository<Machine, Long> {
    List<Machine> findByStatut(Machine.Statut statut);
    List<Machine> findByClientId(Long clientId);
    List<Machine> findBySecretaireId(Long secretaireId);
    List<Machine> findByTechnicienId(Long technicienId);
    
    @Query("SELECT m FROM Machine m WHERE " +
           "LOWER(m.marque) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(m.modele) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(m.client.nom) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(m.client.prenom) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Machine> searchMachines(@Param("keyword") String keyword);

    long countByStatut(Machine.Statut statut);
}
