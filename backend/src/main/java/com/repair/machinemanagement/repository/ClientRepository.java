package com.repair.machinemanagement.repository;

import com.repair.machinemanagement.entity.Client;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClientRepository extends JpaRepository<Client, Long> {

    List<Client> findByNomContainingIgnoreCaseOrPrenomContainingIgnoreCase(String nom, String prenom);

    Boolean existsByNumero(String numero);

    Boolean existsByEmail(String email);

    Boolean existsByIdentifiant(String identifiant);

    Optional<Client> findByEmailIgnoreCase(String email);

    Optional<Client> findByIdentifiantIgnoreCase(String identifiant);

    default Optional<Client> findByEmailOrIdentifiant(String login) {
        Optional<Client> byEmail = findByEmailIgnoreCase(login);
        if (byEmail.isPresent()) return byEmail;
        return findByIdentifiantIgnoreCase(login);
    }
    // AJOUT POUR LES TESTS
    Optional<Client> findByNumero(String numero);

    Optional<Client> findByEmail(String email);

    // Recherche par identifiant pour la connexion client
    Optional<Client> findByIdentifiant(String identifiant);

    // Recherche par email ou identifiant pour la connexion
    Optional<Client> findByEmailOrIdentifiant(String email, String identifiant);

    @Query("SELECT c FROM Client c WHERE c.nom LIKE %:keyword% OR c.prenom LIKE %:keyword%")
    List<Client> searchClients(@Param("keyword") String keyword);

    // Compter le nombre de clients pour générer l'identifiant
    long count();
}
