package com.example.demo.repository;

import com.example.demo.model.RaceResult;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RaceResultRepository extends JpaRepository<RaceResult, Long> {

    // ✅ For delete-confirm modal (optional counts)
    long countByRacerId(Long racerId);

    // ✅ For safe racer deletion (remove dependencies first)
    void deleteByRacerId(Long racerId);

    // ✅ Admin: load results for a single event + division
    List<RaceResult> findByRaceIdAndDivisionOrderByPlacementAsc(Long raceId, String division);

    // ✅ Admin: upsert single racer’s result within a race
    Optional<RaceResult> findByRaceIdAndRacerId(Long raceId, Long racerId);
}