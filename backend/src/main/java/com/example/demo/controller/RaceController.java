package com.example.demo.controller;

import com.example.demo.model.Race;
import com.example.demo.repository.RaceRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/races")
public class RaceController {

    private final RaceRepository raceRepository;

    public RaceController(RaceRepository raceRepository) {
        this.raceRepository = raceRepository;
    }

    @GetMapping
    public List<Race> getAllRaces() {
        return raceRepository.findAll();
    }

    @PostMapping
    public Race addRace(@RequestBody Race race) {
        // ✅ Default: events require registration unless explicitly set false
        if (race.getRequiresRegistration() == null) {
            race.setRequiresRegistration(true);
        }
        return raceRepository.save(race);
    }

    // ✅ UPDATE (Edit event)
    @PutMapping("/{id}")
    public ResponseEntity<Race> updateRace(@PathVariable Long id, @RequestBody Race payload) {
        return raceRepository.findById(id)
                .map(existing -> {
                    existing.setRaceName(payload.getRaceName());
                    existing.setLocation(payload.getLocation());
                    existing.setRaceDate(payload.getRaceDate());
                    existing.setDescription(payload.getDescription());

                    // ✅ keep same default behavior on update too
                    if (payload.getRequiresRegistration() == null) {
                        existing.setRequiresRegistration(true);
                    } else {
                        existing.setRequiresRegistration(payload.getRequiresRegistration());
                    }

                    return ResponseEntity.ok(raceRepository.save(existing));
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // ✅ DELETE (Remove event)
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteRace(@PathVariable Long id) {
        if (!raceRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        raceRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}