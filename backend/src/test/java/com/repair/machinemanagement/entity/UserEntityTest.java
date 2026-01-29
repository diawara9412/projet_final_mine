package com.repair.machinemanagement.entity;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class UserEntityTest {

    private User user;

    @BeforeEach
    void setUp() {
        user = User.builder()
                .nom("Dupont")
                .prenom("Jean")
                .adresse("123 Rue de Paris")
                .numero("0612345678")
                .email("jean.dupont@test.com")
                .password("password123")
                .role(User.Role.ADMIN)
                .active(true)
                .build();
    }

    @Test
    void testUserCreation() {
        assertNotNull(user);
        assertEquals("Dupont", user.getNom());
        assertEquals("Jean", user.getPrenom());
        assertEquals("jean.dupont@test.com", user.getEmail());
        assertEquals(User.Role.ADMIN, user.getRole());
        assertTrue(user.getActive());
    }

    @Test
    void testUserRoles() {
        assertEquals(3, User.Role.values().length);
        assertTrue(User.Role.valueOf("ADMIN") instanceof User.Role);
        assertTrue(User.Role.valueOf("SECRETAIRE") instanceof User.Role);
        assertTrue(User.Role.valueOf("TECHNICIEN") instanceof User.Role);
    }

    @Test
    void testUserBuilder() {
        User newUser = User.builder()
                .nom("Martin")
                .prenom("Marie")
                .email("marie@test.com")
                .password("pass")
                .role(User.Role.SECRETAIRE)
                .build();

        assertEquals("Martin", newUser.getNom());
        assertEquals(User.Role.SECRETAIRE, newUser.getRole());
    }
}
