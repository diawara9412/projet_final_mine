package com.repair.machinemanagement.repository;

import com.repair.machinemanagement.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    List<User> findByRole(User.Role role);
    Boolean existsByEmail(String email);
    Boolean existsByNumero(String numero);
    Boolean existsByRole(User.Role role);
}
