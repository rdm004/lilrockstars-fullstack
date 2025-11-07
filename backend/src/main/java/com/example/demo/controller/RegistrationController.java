package com.example.demo.controller;

import com.example.demo.model.Parent;
import com.example.demo.model.Racer;
import com.example.demo.model.Race;
import com.example.demo.model.Registration;
import com.example.demo.repository.ParentRepository;
import com.example.demo.repository.RacerRepository;
import com.example.demo.repository.RaceRepository;
import com.example.demo.repository.RegistrationRepository;
import com.example.demo.repository.ParentRacerLinkRepository;
import com.example.demo.security.JwtUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/registrations")
public class RegistrationController {

    private final RegistrationRepository registrationRepository;
    private final RacerRepository racerRepository;
    private final RaceRepository raceRepository;
    private final ParentRepository parentRepository;
    private final ParentRacerLinkRepository parentRacerLinkRepository;
    private final JwtUtil jwtUtil;

    public RegistrationController(RegistrationRepository registrationRepository,
                                  RacerRepository racerRepository,
                                  RaceRepository raceRepository,
                                  ParentRepository parentRepository,
                                  ParentRacerLinkRepository parentRacerLinkRepository,
                                  JwtUtil jwtUtil) {
        this.registrationRepository = registrationRepository;
        this.racerRepository = racerRepository;
        this.raceRepository = raceRepository;
        this.parentRepository = parentRepository;
        this.parentRacerLinkRepository = parentRacerLinkRepository;
        this.jwtUtil = jwtUtil;
    }

    // Simple DTOs to keep JSON small & match frontend
    public record RegistrationDto(Long id, Long racerId, Long raceId) {}
    public record CreateRegistrationRequest(Long racerId, Long raceId) {}

    private RegistrationDto toDto(Registration reg) {
        return new RegistrationDto(
                reg.getId(),
                reg.getRacer().getId(),
                reg.getRace().getId()
        );
    }

    private Parent getCurrentParent(String authHeader) {
        String token = authHeader.substring(7); // drop "Bearer "
        String email = jwtUtil.extractUsername(token);
        return parentRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Parent not found for email " + email));
    }

    /**
     * A parent can manage a racer if:
     *  - they are the primary parent on the Racer entity, OR
     *  - there is a ParentRacerLink row tying them to that racer.
     */
    private boolean canManageRacer(Parent parent, Racer racer) {
        if (racer.getParent() != null &&
                racer.getParent().getId().equals(parent.getId())) {
            return true;
        }
        return parentRacerLinkRepository.existsByParentAndRacer(parent, racer);
    }

    // 🔹 Get all registrations for the current parent's visible racers
    @GetMapping("/mine")
    public ResponseEntity<?> getMyRegistrations(@RequestHeader("Authorization") String authHeader) {
        Parent parent = getCurrentParent(authHeader);

        // All racers this parent can see (primary + co-parent links)
        List<Racer> visibleRacers = racerRepository.findAllVisibleToParent(parent);
        if (visibleRacers.isEmpty()) {
            return ResponseEntity.ok(List.of());
        }

        List<Long> racerIds = visibleRacers.stream()
                .map(Racer::getId)
                .toList();

        List<Registration> regs = registrationRepository.findByRacerIdIn(racerIds);
        List<RegistrationDto> dtos = regs.stream()
                .map(this::toDto)
                .toList();

        return ResponseEntity.ok(dtos);
    }

    // 🔹 Register a racer for a race
    @PostMapping
    public ResponseEntity<?> createRegistration(@RequestHeader("Authorization") String authHeader,
                                                @RequestBody CreateRegistrationRequest request) {
        Parent parent = getCurrentParent(authHeader);

        Optional<Racer> racerOpt = racerRepository.findById(request.racerId());
        if (racerOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Racer not found.");
        }
        Racer racer = racerOpt.get();

        // Ensure this racer belongs to the current household (primary or co-parent)
        if (!canManageRacer(parent, racer)) {
            return ResponseEntity.status(403)
                    .body("You cannot register racers that are not linked to your account.");
        }

        Optional<Race> raceOpt = raceRepository.findById(request.raceId());
        if (raceOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Race not found.");
        }
        Race race = raceOpt.get();

        // Avoid duplicate registrations
        Optional<Registration> existing = registrationRepository.findByRacerAndRace(racer, race);
        if (existing.isPresent()) {
            return ResponseEntity.ok(toDto(existing.get()));
        }

        Registration saved = registrationRepository.save(new Registration(racer, race));
        return ResponseEntity.ok(toDto(saved));
    }

    // 🔹 Unregister a racer from a race
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteRegistration(@PathVariable Long id,
                                                @RequestHeader("Authorization") String authHeader) {
        Parent parent = getCurrentParent(authHeader);

        Optional<Registration> regOpt = registrationRepository.findById(id);
        if (regOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Registration reg = regOpt.get();
        Racer racer = reg.getRacer();

        // Make sure this registration belongs to one of the current parent's visible racers
        if (!canManageRacer(parent, racer)) {
            return ResponseEntity.status(403)
                    .body("You cannot delete registrations for racers not linked to your account.");
        }

        registrationRepository.delete(reg);
        return ResponseEntity.ok("Registration deleted.");
    }
}