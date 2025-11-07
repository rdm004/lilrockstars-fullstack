package com.example.demo.controller;

import com.example.demo.model.Racer;
import com.example.demo.model.Parent;
import com.example.demo.repository.RacerRepository;
import com.example.demo.repository.ParentRepository;
import com.example.demo.security.JwtUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/racers")
public class RacerController {

    private final RacerRepository racerRepository;
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
        String token = authHeader.substring(7);
        String email = jwtUtil.extractUsername(token);
        System.out.println("🎯 Decoded email from token: " + email);

        Optional<Parent> parentOpt = parentRepository.findByEmail(email);
        if (parentOpt.isEmpty()) {
            System.out.println("⚠️ Parent not found for email: " + email);
            return ResponseEntity.status(401).body("Parent not found");
        }

        Parent parent = parentOpt.get();
        System.out.println("✅ Found parent ID: " + parent.getId() + " for " + parent.getEmail());

        List<Racer> racers = racerRepository.findAllVisibleToParent(parent);
        System.out.println("🏎️ Racers found for parent: " + racers.size());
        racers.forEach(r -> System.out.println(" - " + r.getFirstName() + " " + r.getLastName()));

        return ResponseEntity.ok(racers);
    }

    // ➕ Add new racer
    @PostMapping
    public ResponseEntity<?> addRacer(@RequestHeader("Authorization") String authHeader,
                                      @RequestBody Racer racer) {
        String token = authHeader.substring(7);
        String email = jwtUtil.extractUsername(token);

        Optional<Parent> parentOpt = parentRepository.findByEmail(email);
        if (parentOpt.isEmpty()) return ResponseEntity.status(401).body("Parent not found");

        Parent parent = parentOpt.get();
        racer.setParent(parent); // ✅ critical line

        Racer saved = racerRepository.save(racer);
        System.out.println("✅ Saved racer: " + saved.getFirstName() + " for parent ID " + parent.getId());
        return ResponseEntity.ok(saved);
    }

    // ✏️ Update racer
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
    }
}