package com.example.demo.controller;

import com.example.demo.dto.AdminCreateRacerRequest;
import com.example.demo.model.Parent;
import com.example.demo.model.Racer;
import com.example.demo.repository.ParentRacerLinkRepository;
import com.example.demo.repository.ParentRepository;
import com.example.demo.repository.RaceResultRepository;
import com.example.demo.repository.RacerRepository;
import com.example.demo.repository.RegistrationRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin/racers")
public class AdminRacersController {

    private final RacerRepository racerRepository;
    private final ParentRepository parentRepository;

    // ✅ for safe cascade delete
    private final RegistrationRepository registrationRepository;
    private final RaceResultRepository raceResultRepository;
    private final ParentRacerLinkRepository parentRacerLinkRepository;

    public AdminRacersController(
            RacerRepository racerRepository,
            ParentRepository parentRepository,
            RegistrationRepository registrationRepository,
            RaceResultRepository raceResultRepository,
            ParentRacerLinkRepository parentRacerLinkRepository
    ) {
        this.racerRepository = racerRepository;
        this.parentRepository = parentRepository;
        this.registrationRepository = registrationRepository;
        this.raceResultRepository = raceResultRepository;
        this.parentRacerLinkRepository = parentRacerLinkRepository;
    }

    public record RacerSearchDto(
            Long id,
            String firstName,
            String lastName,
            String carNumber,
            Integer age,
            String parentEmail
    ) {}

    private String normalize(String s) {
        return s == null ? "" : s.trim();
    }

    // 1–10 chars, allow #, letters, numbers, dash
    private boolean isValidCarNumber(String carNumberRaw) {
        String c = normalize(carNumberRaw);
        if (c.isBlank()) return false;
        return c.matches("^[A-Za-z0-9#-]{1,10}$");
    }

    // -----------------------
    // GET: list/search
    // -----------------------

    @GetMapping
    public List<RacerSearchDto> listAll() {
        return racerRepository.findAll()
                .stream()
                .filter(r -> r.getParent() != null)
                .sorted(Comparator
                        .comparing((Racer r) -> r.getLastName() == null ? "" : r.getLastName(), String.CASE_INSENSITIVE_ORDER)
                        .thenComparing(r -> r.getFirstName() == null ? "" : r.getFirstName(), String.CASE_INSENSITIVE_ORDER)
                        .thenComparing(r -> r.getCarNumber() == null ? "" : r.getCarNumber(), String.CASE_INSENSITIVE_ORDER)
                )
                .map(r -> new RacerSearchDto(
                        r.getId(),
                        r.getFirstName(),
                        r.getLastName(),
                        r.getCarNumber(),
                        r.getAge(),
                        r.getParent() != null ? r.getParent().getEmail() : null
                ))
                .toList();
    }

    @GetMapping("/search")
    public List<RacerSearchDto> search(@RequestParam("q") String q) {
        String term = (q == null) ? "" : q.trim();
        if (term.isBlank()) return List.of();

        return racerRepository.searchAdminRacers(term)
                .stream()
                .filter(r -> r.getParent() != null)
                .map(r -> new RacerSearchDto(
                        r.getId(),
                        r.getFirstName(),
                        r.getLastName(),
                        r.getCarNumber(),
                        r.getAge(),
                        r.getParent() != null ? r.getParent().getEmail() : null
                ))
                .toList();
    }

    // ------------------------------------------------------------------
    // POST: Admin create racer by guardian email (verified)
    // ------------------------------------------------------------------
    @PostMapping
    public ResponseEntity<?> adminCreate(@RequestBody AdminCreateRacerRequest req) {

        String guardianEmail = normalize(req.getGuardianEmail()).toLowerCase();
        if (guardianEmail.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Guardian email is required."));
        }

        Parent guardian = parentRepository.findByEmailIgnoreCase(guardianEmail).orElse(null);
        if (guardian == null) {
            return ResponseEntity.badRequest().body(Map.of(
                    "message", "Guardian email not found. Please verify the email and try again."
            ));
        }

        String firstName = normalize(req.getFirstName());
        String lastName  = normalize(req.getLastName());
        String nickname  = normalize(req.getNickname());
        String carNumber = normalize(req.getCarNumber());
        int age = req.getAge();

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

        boolean dup = racerRepository.existsByParentIdAndFirstNameIgnoreCaseAndLastNameIgnoreCaseAndAgeAndNicknameIgnoreCase(
                guardian.getId(),
                firstName,
                lastName,
                age,
                nicknameForCheck
        );

        if (dup) {
            return ResponseEntity.badRequest().body(Map.of(
                    "message",
                    "This racer already exists for that guardian (same first/last/age/nickname). " +
                            "Use a nickname to distinguish if needed."
            ));
        }

        Racer r = new Racer();
        r.setFirstName(firstName);
        r.setLastName(lastName);
        r.setNickname(nickname.isBlank() ? "" : nickname);
        r.setAge(age);
        r.setCarNumber(carNumber);
        r.setParent(guardian);

        Racer saved = racerRepository.save(r);
        return ResponseEntity.ok(saved);
    }

    // ------------------------------------------------------------------
    // PUT: Admin update racer
    // ------------------------------------------------------------------
    @PutMapping("/{id}")
    public ResponseEntity<?> adminUpdate(@PathVariable Long id, @RequestBody Racer updated) {
        Optional<Racer> existingOpt = racerRepository.findById(id);
        if (existingOpt.isEmpty()) return ResponseEntity.notFound().build();

        Racer existing = existingOpt.get();

        String firstName = normalize(updated.getFirstName());
        String lastName  = normalize(updated.getLastName());
        String nickname  = normalize(updated.getNickname());
        String carNumber = normalize(updated.getCarNumber());
        int age = updated.getAge();

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

        // Duplicate check under the racer’s owning guardian
        if (existing.getParent() != null) {
            Long guardianId = existing.getParent().getId();
            String nicknameForCheck = nickname.isBlank() ? "" : nickname;

            boolean dup = racerRepository.existsByParentIdAndFirstNameIgnoreCaseAndLastNameIgnoreCaseAndAgeAndNicknameIgnoreCaseAndIdNot(
                    guardianId,
                    firstName,
                    lastName,
                    age,
                    nicknameForCheck,
                    existing.getId()
            );

            if (dup) {
                return ResponseEntity.badRequest().body(Map.of(
                        "message", "Another racer already exists for that guardian with the same first/last/age/nickname."
                ));
            }
        }

        existing.setFirstName(firstName);
        existing.setLastName(lastName);
        existing.setNickname(nickname.isBlank() ? "" : nickname);
        existing.setAge(age);
        existing.setCarNumber(carNumber);

        Racer saved = racerRepository.save(existing);
        return ResponseEntity.ok(saved);
    }

    // ------------------------------------------------------------------
    // DELETE: Admin delete racer (safe cascade delete)
    // ------------------------------------------------------------------
    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<?> adminDelete(@PathVariable Long id) {

        Optional<Racer> existingOpt = racerRepository.findById(id);
        if (existingOpt.isEmpty()) return ResponseEntity.notFound().build();

        // ✅ delete dependent rows first to avoid FK issues
        registrationRepository.deleteByRacerId(id);
        raceResultRepository.deleteByRacerId(id);
        parentRacerLinkRepository.deleteByRacerId(id);

        racerRepository.deleteById(id);

        return ResponseEntity.ok(Map.of("message", "Racer deleted successfully."));
    }
}