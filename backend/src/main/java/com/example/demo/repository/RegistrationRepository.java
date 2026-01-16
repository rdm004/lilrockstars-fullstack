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

    // ✅ NEW: Get registrations for one race (admin results auto-fill)
    List<Registration> findByRaceId(Long raceId);
}