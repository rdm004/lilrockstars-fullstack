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

    /* ==============================
       DTO
       ============================== */
    public record RacerSearchDto(
            Long id,
            String firstName,
            String lastName,
            String carNumber,
            Integer age,
            String parentEmail
    ) {}

    /* ==============================
       Helpers
       ============================== */
    private String normalize(String s) {
        return s == null ? "" : s.trim();
    }

    private boolean isValidCarNumber(String raw) {
        String c = normalize(raw);
        return !c.isBlank() && c.matches("^[A-Za-z0-9#-]{1,10}$");
    }

    /* ==============================
       GET – list all racers
       ============================== */
    @GetMapping
    public List<RacerSearchDto> listAll() {
        return racerRepository.findAll()
                .stream()
                .filter(r -> r.getParent() != null)
                .sorted(Comparator
                        .comparing((Racer r) -> normalize(r.getLastName()), String.CASE_INSENSITIVE_ORDER)
                        .thenComparing(r -> normalize(r.getFirstName()), String.CASE_INSENSITIVE_ORDER)
                        .thenComparing(r -> normalize(r.getCarNumber()), String.CASE_INSENSITIVE_ORDER)
                )
                .map(r -> new RacerSearchDto(
                        r.getId(),
                        r.getFirstName(),
                        r.getLastName(),
                        r.getCarNumber(),
                        r.getAge(),
                        r.getParent().getEmail()
                ))
                .toList();
    }

    /* ==============================
       POST – admin create racer
       ============================== */
    @PostMapping
    public ResponseEntity<?> adminCreate(@RequestBody AdminCreateRacerRequest req) {

        String guardianEmail = normalize(req.getGuardianEmail()).toLowerCase();
        if (guardianEmail.isBlank()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Guardian email is required."));
        }

        Parent guardian = parentRepository.findByEmailIgnoreCase(guardianEmail).orElse(null);
        if (guardian == null) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Guardian email not found."));
        }

        String firstName = normalize(req.getFirstName());
        String lastName  = normalize(req.getLastName());
        String nickname  = normalize(req.getNickname());
        String carNumber = normalize(req.getCarNumber());
        int age = req.getAge();

        if (firstName.isBlank() || lastName.isBlank() || age <= 0) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "First name, last name, and age are required."));
        }

        if (!isValidCarNumber(carNumber)) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Car number must be 1–10 characters (letters, numbers, #, -)."));
        }

        String nicknameCheck = nickname.isBlank() ? "" : nickname;

        boolean duplicate = racerRepository
                .existsByParentIdAndFirstNameIgnoreCaseAndLastNameIgnoreCaseAndAgeAndNicknameIgnoreCase(
                        guardian.getId(),
                        firstName,
                        lastName,
                        age,
                        nicknameCheck
                );

        if (duplicate) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "This racer already exists for that guardian."));
        }

        Racer racer = new Racer();
        racer.setFirstName(firstName);
        racer.setLastName(lastName);
        racer.setNickname(nicknameCheck);
        racer.setAge(age);
        racer.setCarNumber(carNumber);
        racer.setParent(guardian);

        Racer saved = racerRepository.save(racer);
        return ResponseEntity.ok(saved);
    }

    /* ==============================
       PUT – admin update racer
       ============================== */
    @PutMapping("/{id}")
    public ResponseEntity<?> adminUpdate(
            @PathVariable Long id,
            @RequestBody Racer updated
    ) {
        Optional<Racer> opt = racerRepository.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();

        Racer existing = opt.get();

        String firstName = normalize(updated.getFirstName());
        String lastName  = normalize(updated.getLastName());
        String nickname  = normalize(updated.getNickname());
        String carNumber = normalize(updated.getCarNumber());
        int age = updated.getAge();

        if (firstName.isBlank() || lastName.isBlank() || age <= 0) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "First name, last name, and age are required."));
        }

        if (!isValidCarNumber(carNumber)) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Invalid car number."));
        }

        if (existing.getParent() != null) {
            String nicknameCheck = nickname.isBlank() ? "" : nickname;

            boolean duplicate = racerRepository
                    .existsByParentIdAndFirstNameIgnoreCaseAndLastNameIgnoreCaseAndAgeAndNicknameIgnoreCaseAndIdNot(
                            existing.getParent().getId(),
                            firstName,
                            lastName,
                            age,
                            nicknameCheck,
                            existing.getId()
                    );

            if (duplicate) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Duplicate racer exists for that guardian."));
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

    /* ==============================
       DELETE – admin delete racer
       ============================== */
    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<?> adminDelete(@PathVariable Long id) {

        Optional<Racer> opt = racerRepository.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();

        registrationRepository.deleteByRacerId(id);
        raceResultRepository.deleteByRacerId(id);
        parentRacerLinkRepository.deleteByRacerId(id);
        racerRepository.deleteById(id);

        return ResponseEntity.ok(Map.of("message", "Racer deleted successfully."));
    }
}