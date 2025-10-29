package com.example.demo.controller;

import com.example.demo.model.Racer;
<<<<<<< HEAD
import com.example.demo.model.Parent;
import com.example.demo.repository.RacerRepository;
import com.example.demo.repository.ParentRepository;
import com.example.demo.security.JwtUtil;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
=======
import com.example.demo.repository.RacerRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;
>>>>>>> 917952875e7a7d0b1831f67d8ef8afb31e438123

@RestController
@RequestMapping("/api/racers")
@CrossOrigin(origins = "*")
public class RacerController {

    private final RacerRepository racerRepository;
<<<<<<< HEAD
    private final ParentRepository parentRepository;
    private final JwtUtil jwtUtil;

    public RacerController(RacerRepository racerRepository, ParentRepository parentRepository, JwtUtil jwtUtil) {
        this.racerRepository = racerRepository;
        this.parentRepository = parentRepository;
        this.jwtUtil = jwtUtil;
    }

    // 🧍 Get all racers for logged-in parent
    @GetMapping
    public ResponseEntity<?> getAllRacers(@RequestHeader("Authorization") String authHeader) {
        System.out.println("🎯 [RacerController] Fetching racers...");
        System.out.println("Auth header: " + authHeader);

        try {
            String token = authHeader.substring(7);
            String email = jwtUtil.extractUsername(token);
            System.out.println("Decoded email: " + email);

            Optional<Parent> parentOpt = parentRepository.findByEmail(email);
            if (parentOpt.isEmpty()) {
                System.out.println("⚠️ Parent not found for email: " + email);
                return ResponseEntity.status(401).body("Parent not found");
            }

            Parent parent = parentOpt.get();
            System.out.println("✅ Parent found: " + parent.getFirstName() + " (ID: " + parent.getId() + ")");

            List<Racer> racers = racerRepository.findByParent(parent);
            System.out.println("🏎️ Racers found: " + racers.size());

            for (Racer r : racers) {
                System.out.println("  - " + r.getFirstName() + " " + r.getLastName());
            }

            return ResponseEntity.ok(racers);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error fetching racers: " + e.getMessage());
        }
    }

    // ➕ Add new racer
    @PostMapping
    public ResponseEntity<?> addRacer(@RequestHeader("Authorization") String authHeader,
                                      @RequestBody Racer racer) {
        String token = authHeader.substring(7);
        String email = jwtUtil.extractUsername(token);

        Optional<Parent> parentOpt = parentRepository.findByEmail(email);
        if (parentOpt.isEmpty()) return ResponseEntity.status(401).body("Parent not found");

        racer.setParent(parentOpt.get());
        Racer saved = racerRepository.save(racer);
        return ResponseEntity.ok(saved);
    }

    // ✏️ Update racer info
    @PutMapping("/{id}")
    public ResponseEntity<?> updateRacer(@PathVariable Long id,
                                         @RequestHeader("Authorization") String authHeader,
                                         @RequestBody Racer updatedRacer) {
        String token = authHeader.substring(7);
        String email = jwtUtil.extractUsername(token);

        Optional<Parent> parentOpt = parentRepository.findByEmail(email);
        if (parentOpt.isEmpty()) return ResponseEntity.status(401).body("Parent not found");

        Optional<Racer> existingOpt = racerRepository.findById(id);
        if (existingOpt.isEmpty()) return ResponseEntity.notFound().build();

        Racer existing = existingOpt.get();

        // Ensure racer belongs to the logged-in parent
        if (!existing.getParent().getId().equals(parentOpt.get().getId())) {
            return ResponseEntity.status(403).body("Unauthorized to edit this racer.");
        }

        existing.setFirstName(updatedRacer.getFirstName());
        existing.setLastName(updatedRacer.getLastName());
        existing.setAge(updatedRacer.getAge());
        existing.setCarNumber(updatedRacer.getCarNumber());

        Racer saved = racerRepository.save(existing);
        return ResponseEntity.ok(saved);
    }

    // 🗑️ Delete racer
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteRacer(@PathVariable Long id,
                                         @RequestHeader("Authorization") String authHeader) {
        String token = authHeader.substring(7);
        String email = jwtUtil.extractUsername(token);

        Optional<Parent> parentOpt = parentRepository.findByEmail(email);
        if (parentOpt.isEmpty()) return ResponseEntity.status(401).body("Parent not found");

        Optional<Racer> racerOpt = racerRepository.findById(id);
        if (racerOpt.isEmpty()) return ResponseEntity.notFound().build();

        Racer racer = racerOpt.get();
        if (!racer.getParent().getId().equals(parentOpt.get().getId())) {
            return ResponseEntity.status(403).body("Unauthorized to delete this racer.");
        }

        racerRepository.delete(racer);
        return ResponseEntity.ok("Racer deleted successfully.");
=======

    public RacerController(RacerRepository racerRepository) {
        this.racerRepository = racerRepository;
    }

    @GetMapping
    public List<Racer> getAllRacers() {
        return racerRepository.findAll();
    }

    @PostMapping
    public Racer addRacer(@RequestBody Racer racer) {
        return racerRepository.save(racer);
>>>>>>> 917952875e7a7d0b1831f67d8ef8afb31e438123
    }
}