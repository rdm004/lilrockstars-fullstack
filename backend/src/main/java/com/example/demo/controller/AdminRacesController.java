package com.example.demo.controller;

import com.example.demo.model.Race;
import com.example.demo.repository.RaceRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin/races")
public class AdminRacesController {

    private final RaceRepository raceRepository;

    public AdminRacesController(RaceRepository raceRepository) {
        this.raceRepository = raceRepository;
    }

    @GetMapping
    public List<Race> getAll() {
        return raceRepository.findAll();
    }

    @PostMapping
    public Race create(@RequestBody Race race) {
        return raceRepository.save(race);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody Race incoming) {
        Optional<Race> existingOpt = raceRepository.findById(id);
        if (existingOpt.isEmpty()) return ResponseEntity.notFound().build();

        Race existing = existingOpt.get();
        existing.setRaceName(incoming.getRaceName());
        existing.setRaceDate(incoming.getRaceDate());
        existing.setLocation(incoming.getLocation());
        existing.setDescription(incoming.getDescription());

        return ResponseEntity.ok(raceRepository.save(existing));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        if (!raceRepository.existsById(id)) return ResponseEntity.notFound().build();
        raceRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}