package com.example.demo.controller;

import com.example.demo.model.Parent;
import com.example.demo.model.Racer;
import com.example.demo.repository.ParentRacerLinkRepository;
import com.example.demo.repository.ParentRepository;
import com.example.demo.repository.RaceResultRepository;
import com.example.demo.repository.RacerRepository;
import com.example.demo.repository.RegistrationRepository;
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
    private final ParentRacerLinkRepository parentRacerLinkRepository;
    private final RegistrationRepository registrationRepository;
    private final RaceResultRepository raceResultRepository;
    private final JwtUtil jwtUtil;

    public RacerController(RacerRepository racerRepository,
                           ParentRepository parentRepository,
                           ParentRacerLinkRepository parentRacerLinkRepository,
                           RegistrationRepository registrationRepository,
                           RaceResultRepository raceResultRepository,
                           JwtUtil jwtUtil) {
        this.racerRepository = racerRepository;
        this.parentRepository = parentRepository;
        this.parentRacerLinkRepository = parentRacerLinkRepository;
        this.registrationRepository = registrationRepository;
        this.raceResultRepository = raceResultRepository;
        this.jwtUtil = jwtUtil;
    }

    // -------------------------
    // Helpers
    // -------------------------
    private Parent getCurrentParent(String authHeader) {
        String token = authHeader.substring(7);
        String email = jwtUtil.extractUsername(token);

        return parentRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Parent not found for email: " + email));
    }

    /**
     * Parent can manage racer if:
     *  - they are primary parent on Racer, OR
     *  - ParentRacerLink exists
     */
    private boolean canManageRacer(Parent parent, Racer racer) {
        if (racer.getParent() != null && racer.getParent().getId().equals(parent.getId())) {
            return true;
        }
        return parentRacerLinkRepository.existsByParentAndRacer(parent, racer);
    }

    // 🧍 Get all racers for logged-in parent
    @GetMapping
    public ResponseEntity<?> getAllRacers(@RequestHeader("Authorization") String authHeader) {
        try {
            Parent parent = getCurrentParent(authHeader);

            List<Racer> racers = racerRepository.findAllVisibleToParent(parent);
            return ResponseEntity.ok(racers);
        } catch (Exception e) {
            return ResponseEntity.status(401).body("Parent not found");
        }
    }

    // ➕ Add new racer
    @PostMapping
    public ResponseEntity<?> addRacer(@RequestHeader("Authorization") String authHeader,
                                      @RequestBody Racer racer) {
        try {
            Parent parent = getCurrentParent(authHeader);

            racer.setParent(parent); // ✅ critical line

            Racer saved = racerRepository.save(racer);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.status(401).body("Parent not found");
        }
    }

    // ✏️ Update racer
    @PutMapping("/{id}")
    public ResponseEntity<?> updateRacer(@PathVariable Long id,
                                         @RequestHeader("Authorization") String authHeader,
                                         @RequestBody Racer updatedRacer) {
        Parent parent;
        try {
            parent = getCurrentParent(authHeader);
        } catch (Exception e) {
            return ResponseEntity.status(401).body("Parent not found");
        }

        Optional<Racer> existingOpt = racerRepository.findById(id);
        if (existingOpt.isEmpty()) return ResponseEntity.notFound().build();

        Racer existing = existingOpt.get();

        if (!canManageRacer(parent, existing)) {
            return ResponseEntity.status(403).body("Unauthorized to edit this racer.");
        }

        existing.setFirstName(updatedRacer.getFirstName());
        existing.setLastName(updatedRacer.getLastName());
        existing.setAge(updatedRacer.getAge());
        existing.setCarNumber(updatedRacer.getCarNumber());

        Racer saved = racerRepository.save(existing);
        return ResponseEntity.ok(saved);
    }

    // 🗑️ Delete racer (FIXED)
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteRacer(@PathVariable Long id,
                                         @RequestHeader("Authorization") String authHeader) {

        Parent parent;
        try {
            parent = getCurrentParent(authHeader);
        } catch (Exception e) {
            return ResponseEntity.status(401).body("Parent not found");
        }

        Optional<Racer> racerOpt = racerRepository.findById(id);
        if (racerOpt.isEmpty()) return ResponseEntity.notFound().build();

        Racer racer = racerOpt.get();

        if (!canManageRacer(parent, racer)) {
            return ResponseEntity.status(403).body("Unauthorized to delete this racer.");
        }

        // ✅ Delete dependent rows first to prevent FK constraint errors
        // (These methods must exist in your repositories)
        parentRacerLinkRepository.deleteByRacerId(id);
        registrationRepository.deleteByRacerId(id);
        raceResultRepository.deleteByRacerId(id);

        // Now delete the racer
        racerRepository.deleteById(id);

        return ResponseEntity.ok("Racer deleted successfully.");
    }
}