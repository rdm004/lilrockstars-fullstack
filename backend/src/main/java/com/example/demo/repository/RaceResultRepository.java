package com.example.demo.repository;

import com.example.demo.model.RaceResult;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RaceResultRepository extends JpaRepository<RaceResult, Long> {

    // ✅ For delete-confirm modal (optional counts)
    long countByRacerId(Long racerId);

    // ✅ For safe racer deletion (remove dependencies first)
    void deleteByRacerId(Long racerId);
}