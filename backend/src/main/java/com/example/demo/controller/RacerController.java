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
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/racers")
public class RacerController {

    private final RacerRepository racerRepository;
    private final ParentRepository parentRepository;
    private final ParentRacerLinkRepository parentRacerLinkRepository;
    private final RegistrationRepository registrationRepository;
    private final RaceResultRepository raceResultRepository;
    private final JwtUtil jwtUtil;

    public RacerController(
            RacerRepository racerRepository,
            ParentRepository parentRepository,
            ParentRacerLinkRepository parentRacerLinkRepository,
            RegistrationRepository registrationRepository,
            RaceResultRepository raceResultRepository,
            JwtUtil jwtUtil
    ) {
        this.racerRepository = racerRepository;
        this.parentRepository = parentRepository;
        this.parentRacerLinkRepository = parentRacerLinkRepository;
        this.registrationRepository = registrationRepository;
        this.raceResultRepository = raceResultRepository;
        this.jwtUtil = jwtUtil;
    }

    private String normalize(String s) {
        return s == null ? "" : s.trim();
    }

    // Keep it reasonable: required, 1-10 chars, allow #, letters, numbers, dash
    private boolean isValidCarNumber(String carNumberRaw) {
        String c = normalize(carNumberRaw);
        if (c.isBlank()) return false;
        return c.matches("^[A-Za-z0-9#-]{1,10}$");
    }

    private Parent getCurrentParent(String authHeader) {
        String token = authHeader.substring(7); // drop "Bearer "
        String email = jwtUtil.extractUsername(token);

        return parentRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new RuntimeException("Parent not found for email " + email));
    }

    private boolean canManageRacer(Parent parent, Racer racer) {
        if (racer.getParent() != null && racer.getParent().getId().equals(parent.getId())) {
            return true;
        }
        return parentRacerLinkRepository.existsByParentAndRacer(parent, racer);
    }

    // 🧍 Get all racers visible to logged-in parent (primary + co-guardian links)
    @GetMapping
    public ResponseEntity<?> getAllRacers(@RequestHeader("Authorization") String authHeader) {
        try {
            Parent parent = getCurrentParent(authHeader);
            List<Racer> racers = racerRepository.findAllVisibleToParent(parent.getId());
            return ResponseEntity.ok(racers);
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("message", "Parent not found"));
        }
    }

    // ➕ Add new racer (primary parent owns it) + ✅ Prevent duplicates + ✅ Validate car #
    @PostMapping
    public ResponseEntity<?> addRacer(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody Racer racer
    ) {
        try {
            Parent parent = getCurrentParent(authHeader);

            String firstName = normalize(racer.getFirstName());
            String lastName  = normalize(racer.getLastName());
            String nickname  = normalize(racer.getNickname()); // optional
            String carNumber = normalize(racer.getCarNumber());
            int age = racer.getAge();

            if (firstName.isBlank() || lastName.isBlank() || age <= 0) {
                return ResponseEntity.badRequest().body(Map.of(
                        "message", "First name, last name, and age are required."
                ));
            }

            if (!isValidCarNumber(carNumber)) {
                return ResponseEntity.badRequest().body(Map.of(
                        "message", "Car number is required (1-10 chars). Example: 21, #21, 21A."
                ));
            }

            // For duplicate checks, treat blank nickname as ""
            String nicknameForCheck = nickname.isBlank() ? "" : nickname;

            boolean dup = racerRepository.existsByParentIdAndFirstNameIgnoreCaseAndLastNameIgnoreCaseAndAgeAndNicknameIgnoreCase(
                    parent.getId(),
                    firstName,
                    lastName,
                    age,
                    nicknameForCheck
            );

            if (dup) {
                return ResponseEntity.badRequest().body(Map.of(
                        "message",
                        "This racer already exists (same first name, last name, age, and nickname). " +
                                "If this is a different child with the same name/age, add a nickname to distinguish them (e.g., Jr, II, Big, Little)."
                ));
            }

            racer.setFirstName(firstName);
            racer.setLastName(lastName);
            racer.setNickname(nickname.isBlank() ? null : nickname); // ✅ store null when empty
            racer.setCarNumber(carNumber);                           // ✅ enforce trimmed value
            racer.setParent(parent);

            Racer saved = racerRepository.save(racer);
            return ResponseEntity.ok(saved);

        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("message", "Parent not found"));
        }
    }

    // ✏️ Update racer + ✅ Prevent duplicates + ✅ Validate car #
    @PutMapping("/{id}")
    public ResponseEntity<?> updateRacer(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authHeader,
            @RequestBody Racer updatedRacer
    ) {

        Parent parent;
        try {
            parent = getCurrentParent(authHeader);
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("message", "Parent not found"));
        }

        Optional<Racer> existingOpt = racerRepository.findById(id);
        if (existingOpt.isEmpty()) return ResponseEntity.notFound().build();

        Racer existing = existingOpt.get();

        if (!canManageRacer(parent, existing)) {
            return ResponseEntity.status(403).body(Map.of("message", "Unauthorized to edit this racer."));
        }

        String firstName = normalize(updatedRacer.getFirstName());
        String lastName  = normalize(updatedRacer.getLastName());
        String nickname  = normalize(updatedRacer.getNickname());
        String carNumber = normalize(updatedRacer.getCarNumber());
        int age = updatedRacer.getAge();

        if (firstName.isBlank() || lastName.isBlank() || age <= 0) {
            return ResponseEntity.badRequest().body(Map.of(
                    "message", "First name, last name, and age are required."
            ));
        }

        if (!isValidCarNumber(carNumber)) {
            return ResponseEntity.badRequest().body(Map.of(
                    "message", "Car number is required (1-10 chars). Example: 21, #21, 21A."
            ));
        }

        String nicknameForCheck = nickname.isBlank() ? "" : nickname;

        Long parentIdForCheck = (existing.getParent() != null ? existing.getParent().getId() : parent.getId());

        boolean dup = racerRepository.existsByParentIdAndFirstNameIgnoreCaseAndLastNameIgnoreCaseAndAgeAndNicknameIgnoreCaseAndIdNot(
                parentIdForCheck,
                firstName,
                lastName,
                age,
                nicknameForCheck,
                existing.getId()
        );

        if (dup) {
            return ResponseEntity.badRequest().body(Map.of(
                    "message",
                    "Another racer already exists with the same first name, last name, age, and nickname. " +
                            "Use a different nickname to distinguish them."
            ));
        }

        existing.setFirstName(firstName);
        existing.setLastName(lastName);
        existing.setNickname(nickname.isBlank() ? null : nickname); // ✅ null when empty
        existing.setAge(age);
        existing.setCarNumber(carNumber);                           // ✅ enforce trimmed value
        existing.setDivision(updatedRacer.getDivision());

        Racer saved = racerRepository.save(existing);
        return ResponseEntity.ok(saved);
    }

    // 🗑️ Delete racer (must delete dependent rows first)
    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<?> deleteRacer(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authHeader
    ) {

        Parent parent;
        try {
            parent = getCurrentParent(authHeader);
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("message", "Parent not found"));
        }

        Optional<Racer> racerOpt = racerRepository.findById(id);
        if (racerOpt.isEmpty()) return ResponseEntity.notFound().build();

        Racer racer = racerOpt.get();

        if (!canManageRacer(parent, racer)) {
            return ResponseEntity.status(403).body(Map.of("message", "Unauthorized to delete this racer."));
        }

        try {
            registrationRepository.deleteByRacerId(id);
            raceResultRepository.deleteByRacerId(id);
            parentRacerLinkRepository.deleteByRacerId(id);

            racerRepository.deleteById(id);

            return ResponseEntity.ok(Map.of("message", "Racer deleted successfully."));
        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("message", "Failed to delete racer."));
        }
    }
}