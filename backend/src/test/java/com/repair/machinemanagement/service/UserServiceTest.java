package com.repair.machinemanagement.service;

import com.repair.machinemanagement.dto.UserRequest;
import com.repair.machinemanagement.entity.User;
import com.repair.machinemanagement.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserService userService;

    private User testUser;
    private UserRequest userRequest;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(1L)
                .nom("Dupont")
                .prenom("Jean")
                .adresse("123 Rue de Paris")
                .numero("0612345678")
                .email("jean@test.com")
                .password("encodedPassword")
                .role(User.Role.ADMIN)
                .active(true)
                .build();

        userRequest = new UserRequest();
        userRequest.setNom("Martin");
        userRequest.setPrenom("Marie");
        userRequest.setAdresse("456 Avenue Lyon");
        userRequest.setNumero("0698765432");
        userRequest.setEmail("marie@test.com");
        userRequest.setPassword("password123");
        userRequest.setRole(User.Role.SECRETAIRE);
    }

    @Test
    void testGetAllUsers() {
        when(userRepository.findAll()).thenReturn(Arrays.asList(testUser));

        List<User> users = userService.getAllUsers();

        assertEquals(1, users.size());
        verify(userRepository).findAll();
    }

    @Test
    void testGetUserById() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));

        User found = userService.getUserById(1L);

        assertNotNull(found);
        assertEquals("Dupont", found.getNom());
        verify(userRepository).findById(1L);
    }

    @Test
    void testGetUserByIdNotFound() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> userService.getUserById(99L));
    }

    @Test
    void testCreateUser() {
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(userRepository.existsByNumero(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        User created = userService.createUser(userRequest);

        assertNotNull(created);
        verify(userRepository).save(any(User.class));
        verify(passwordEncoder).encode("password123");
    }

    @Test
    void testCreateUserEmailAlreadyExists() {
        when(userRepository.existsByEmail(anyString())).thenReturn(true);

        assertThrows(RuntimeException.class, () -> userService.createUser(userRequest));
    }

    @Test
    void testUpdateUser() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        User updated = userService.updateUser(1L, userRequest);

        assertNotNull(updated);
        verify(userRepository).save(any(User.class));
    }

    @Test
    void testDeleteUser() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        doNothing().when(userRepository).delete(any(User.class));

        userService.deleteUser(1L);

        verify(userRepository).delete(testUser);
    }
}
