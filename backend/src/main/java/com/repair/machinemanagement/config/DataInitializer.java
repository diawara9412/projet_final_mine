package com.repair.machinemanagement.config;

import com.repair.machinemanagement.entity.User;
import com.repair.machinemanagement.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Vérifie si un admin existe déjà
        boolean adminExists = userRepository.existsByRole(User.Role.ADMIN);

        if (!adminExists) {
            User admin = User.builder()
                    .nom("Administrateur")
                    .prenom("Principal")
                    .adresse("123 Rue de la Réparation, 75001 Paris")
                    .numero("0612345678")
                    .email("admin@repair.com")
                    .password(passwordEncoder.encode("admin123"))
                    .role(User.Role.ADMIN)
                    .active(true)
                    .build();

            userRepository.save(admin);

            System.out.println("✔ Administrateur créé automatiquement !");
        } else {
            System.out.println("✔ Administrateur déjà existant, création ignorée.");
        }
    }
}
