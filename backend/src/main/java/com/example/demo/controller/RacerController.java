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

    /* ==============================
       Helpers
       ============================== */

    private String normalize(String s) {
        return s == null ? "" : s.trim();
    }

    // 1–10 chars, letters, numbers, #, dash
    private boolean isValidCarNumber(String raw) {
        String c = normalize(raw);
        if (c.isBlank()) return false;
        return c.matches("^[A-Za-z0-9#-]{1,10}$");
    }

    private Parent getCurrentParent(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new RuntimeException("Missing or invalid Authorization header");
        }

        String token = authHeader.substring(7);
        String email = jwtUtil.extractUsername(token);

        return parentRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new RuntimeException("Parent not found"));
    }

    private boolean canManageRacer(Parent parent, Racer racer) {
        // Primary owner
        if (racer.getParent() != null &&
                racer.getParent().getId().equals(parent.getId())) {
            return true;
        }

        // Co-guardian link
        return parentRacerLinkRepository.existsByParentAndRacer(parent, racer);
    }

    /* ==============================
       GET – visible racers
       ============================== */

    @GetMapping
    public ResponseEntity<?> getAllRacers(
            @RequestHeader("Authorization") String authHeader
    ) {
        try {
            Parent parent = getCurrentParent(authHeader);
            List<Racer> racers = racerRepository.findAllVisibleToParent(parent.getId());
            return ResponseEntity.ok(racers);
        } catch (Exception e) {
            return ResponseEntity.status(401)
                    .body(Map.of("message", "Unauthorized"));
        }
    }

    /* ==============================
       POST – add racer
       ============================== */

    @PostMapping
    public ResponseEntity<?> addRacer(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody Racer racer
    ) {
        try {
            Parent parent = getCurrentParent(authHeader);

            String firstName = normalize(racer.getFirstName());
            String lastName  = normalize(racer.getLastName());
            String nickname  = normalize(racer.getNickname());
            String carNumber = normalize(racer.getCarNumber());
            int age = racer.getAge();

            if (firstName.isBlank() || lastName.isBlank() || age <= 0) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message",
                                "First name, last name, and age are required."));
            }

            if (!isValidCarNumber(carNumber)) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message",
                                "Car number must be 1–10 characters (letters, numbers, #, -)."));
            }

            String nicknameForCheck = nickname.isBlank() ? "" : nickname;

            boolean dup = racerRepository
                    .existsByParentIdAndFirstNameIgnoreCaseAndLastNameIgnoreCaseAndAgeAndNicknameIgnoreCase(
                            parent.getId(),
                            firstName,
                            lastName,
                            age,
                            nicknameForCheck
                    );

            if (dup) {
                return ResponseEntity.badRequest().body(Map.of(
                        "message",
                        "This racer already exists. Use a nickname to distinguish duplicates."
                ));
            }

            racer.setFirstName(firstName);
            racer.setLastName(lastName);
            racer.setNickname(nicknameForCheck);
            racer.setAge(age);
            racer.setCarNumber(carNumber);
            racer.setParent(parent);

            Racer saved = racerRepository.save(racer);
            return ResponseEntity.ok(saved);

        } catch (Exception e) {
            return ResponseEntity.status(401)
                    .body(Map.of("message", "Unauthorized"));
        }
    }

    /* ==============================
       PUT – update racer
       ============================== */

    @PutMapping("/{id}")
    public ResponseEntity<?> updateRacer(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authHeader,
            @RequestBody Racer updated
    ) {
        Parent parent;
        try {
            parent = getCurrentParent(authHeader);
        } catch (Exception e) {
            return ResponseEntity.status(401)
                    .body(Map.of("message", "Unauthorized"));
        }

        Optional<Racer> opt = racerRepository.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();

        Racer existing = opt.get();

        if (!canManageRacer(parent, existing)) {
            return ResponseEntity.status(403)
                    .body(Map.of("message", "Unauthorized to edit this racer."));
        }

        String firstName = normalize(updated.getFirstName());
        String lastName  = normalize(updated.getLastName());
        String nickname  = normalize(updated.getNickname());
        String carNumber = normalize(updated.getCarNumber());
        int age = updated.getAge();

        if (firstName.isBlank() || lastName.isBlank() || age <= 0) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message",
                            "First name, last name, and age are required."));
        }

        if (!isValidCarNumber(carNumber)) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message",
                            "Car number must be 1–10 characters."));
        }

        String nicknameForCheck = nickname.isBlank() ? "" : nickname;

        Long ownerId = existing.getParent() != null
                ? existing.getParent().getId()
                : parent.getId();

        boolean dup = racerRepository
                .existsByParentIdAndFirstNameIgnoreCaseAndLastNameIgnoreCaseAndAgeAndNicknameIgnoreCaseAndIdNot(
                        ownerId,
                        firstName,
                        lastName,
                        age,
                        nicknameForCheck,
                        existing.getId()
                );

        if (dup) {
            return ResponseEntity.badRequest().body(Map.of(
                    "message",
                    "Another racer already exists with these details."
            ));
        }

        existing.setFirstName(firstName);
        existing.setLastName(lastName);
        existing.setNickname(nicknameForCheck);
        existing.setAge(age);
        existing.setCarNumber(carNumber);
        existing.setDivision(updated.getDivision());

        Racer saved = racerRepository.save(existing);
        return ResponseEntity.ok(saved);
    }

    /* ==============================
       DELETE – racer
       ============================== */

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
            return ResponseEntity.status(401)
                    .body(Map.of("message", "Unauthorized"));
        }

        Optional<Racer> opt = racerRepository.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();

        Racer racer = opt.get();

        if (!canManageRacer(parent, racer)) {
            return ResponseEntity.status(403)
                    .body(Map.of("message", "Unauthorized to delete this racer."));
        }

        try {
            registrationRepository.deleteByRacerId(id);
            raceResultRepository.deleteByRacerId(id);
            parentRacerLinkRepository.deleteByRacerId(id);
            racerRepository.deleteById(id);

            return ResponseEntity.ok(Map.of("message", "Racer deleted successfully."));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(Map.of("message", "Failed to delete racer."));
        }
    }
}