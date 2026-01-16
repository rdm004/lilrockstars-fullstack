package com.example.demo.repository;

import com.example.demo.model.Parent;
import com.example.demo.model.Racer;
import com.example.demo.model.Race;
import com.example.demo.model.Registration;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RegistrationRepository extends JpaRepository<Registration, Long> {

    // 🔹 All registrations for racers belonging to a given parent
    List<Registration> findByRacerParent(Parent parent);

    // 🔹 All registrations for a list of racer IDs (used when multiple parents share racers)
    List<Registration> findByRacerIdIn(List<Long> racerIds);

    // 🔹 To avoid duplicates (one racer/race pair once)
    Optional<Registration> findByRacerAndRace(Racer racer, Race race);

    // ✅ Needed for "by race" admin endpoint
    List<Registration> findByRaceId(Long raceId);

    // ✅ Needed for deleting racer safely (removes dependent registrations first)
    void deleteByRacerId(Long racerId);

    // ✅ Optional but helpful for delete confirmation counts
    long countByRacerId(Long racerId);
}