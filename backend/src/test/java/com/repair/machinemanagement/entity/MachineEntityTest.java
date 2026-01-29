package com.repair.machinemanagement.entity;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.*;

class MachineEntityTest {

    private Machine machine;
    private Client client;
    private User secretaire;

    @BeforeEach
    void setUp() {
        client = Client.builder()
                .nom("Client Test")
                .prenom("Test")
                .adresse("Test Address")
                .numero("0612345678")
                .build();

        secretaire = User.builder()
                .nom("Secretaire")
                .prenom("Test")
                .email("sec@test.com")
                .password("pass")
                .role(User.Role.SECRETAIRE)
                .build();

        machine = Machine.builder()
                .marque("Dell")
                .modele("Inspiron 15")
                .numeroSerie("SN123456")
                .defaut("Écran cassé")
                .rendezVous(LocalDate.now().plusDays(7))
                .statut(Machine.Statut.EN_ATTENTE)
                .montant(150.0)
                .paye(false)
                .client(client)
                .secretaire(secretaire)
                .build();
    }

    @Test
    void testMachineCreation() {
        assertNotNull(machine);
        assertEquals("Dell", machine.getMarque());
        assertEquals("Inspiron 15", machine.getModele());
        assertEquals("Écran cassé", machine.getDefaut());
        assertEquals(Machine.Statut.EN_ATTENTE, machine.getStatut());
        assertFalse(machine.getPaye());
    }

    @Test
    void testMachineStatuts() {
        assertEquals(6, Machine.Statut.values().length);
        assertTrue(Machine.Statut.valueOf("EN_COURS") instanceof Machine.Statut);
        assertTrue(Machine.Statut.valueOf("TERMINE") instanceof Machine.Statut);
        assertTrue(Machine.Statut.valueOf("ANOMALIE") instanceof Machine.Statut);
        assertTrue(Machine.Statut.valueOf("EN_ATTENTE") instanceof Machine.Statut);
        assertTrue(Machine.Statut.valueOf("PAYE") instanceof Machine.Statut);
        assertTrue(Machine.Statut.valueOf("REMIS_AU_CLIENT") instanceof Machine.Statut);
    }

    @Test
    void testMachineRelationships() {
        assertNotNull(machine.getClient());
        assertNotNull(machine.getSecretaire());
        assertNull(machine.getTechnicien());
        assertEquals("Client Test", machine.getClient().getNom());
        assertEquals(User.Role.SECRETAIRE, machine.getSecretaire().getRole());
    }
}
