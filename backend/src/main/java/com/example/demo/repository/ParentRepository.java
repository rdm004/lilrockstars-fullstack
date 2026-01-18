package com.example.demo.repository;

import com.example.demo.model.Parent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ParentRepository extends JpaRepository<Parent, Long> {

    // ✅ New “official” methods (case-insensitive)
    Optional<Parent> findByEmailIgnoreCase(String email);
    boolean existsByEmailIgnoreCase(String email);

    // ✅ Backward compatible methods (fixes: cannot find symbol findByEmail)
    default Optional<Parent> findByEmail(String email) {
        return findByEmailIgnoreCase(email);
    }
}