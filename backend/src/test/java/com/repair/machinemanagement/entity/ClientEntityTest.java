package com.repair.machinemanagement.entity;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class ClientEntityTest {

    private Client client;

    @BeforeEach
    void setUp() {
        client = Client.builder()
                .nom("Durand")
                .prenom("Pierre")
                .adresse("456 Avenue des Champs")
                .numero("0698765432")
                .email("pierre.durand@test.com")
                .autres("Client VIP")
                .build();
    }

    @Test
    void testClientCreation() {
        assertNotNull(client);
        assertEquals("Durand", client.getNom());
        assertEquals("Pierre", client.getPrenom());
        assertEquals("pierre.durand@test.com", client.getEmail());
        assertEquals("Client VIP", client.getAutres());
    }

    @Test
    void testClientBuilder() {
        Client newClient = Client.builder()
                .nom("Bernard")
                .prenom("Sophie")
                .adresse("789 Rue de Lyon")
                .numero("0612348765")
                .build();

        assertEquals("Bernard", newClient.getNom());
        assertNull(newClient.getEmail());
    }
}
