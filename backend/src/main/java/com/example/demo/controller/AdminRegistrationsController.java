package com.example.demo.controller;

import com.example.demo.model.Parent;
import com.example.demo.model.Race;
import com.example.demo.model.Racer;
import com.example.demo.model.Registration;
import com.example.demo.repository.RegistrationRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;

@RestController
@RequestMapping("/api/admin/registrations")
public class AdminRegistrationsController {

    private final RegistrationRepository registrationRepository;

    public AdminRegistrationsController(RegistrationRepository registrationRepository) {
        this.registrationRepository = registrationRepository;
    }

    public record AdminRegistrationRow(
            Long registrationId,
            Long raceId,
            String raceName,
            LocalDate raceDate,
            Long racerId,
            String racerFirstName,
            String racerLastName,
            Integer racerAge,
            String racerDivision,
            String carNumber,
            Long parentId,
            String parentEmail
    ) {}

    private AdminRegistrationRow toRow(Registration reg) {
        Race race = reg.getRace();
        Racer racer = reg.getRacer();
        Parent parent = (racer != null) ? racer.getParent() : null;

        return new AdminRegistrationRow(
                reg.getId(),
                race != null ? race.getId() : null,
                race != null ? race.getRaceName() : null,
                race != null ? race.getRaceDate() : null,
                racer != null ? racer.getId() : null,
                racer != null ? racer.getFirstName() : null,
                racer != null ? racer.getLastName() : null,
                racer != null ? racer.getAge() : null,
                racer != null ? racer.getDivision() : null,
                racer != null ? racer.getCarNumber() : null,
                parent != null ? parent.getId() : null,
                parent != null ? parent.getEmail() : null
        );
    }

    @GetMapping
    @Transactional(readOnly = true)
    public ResponseEntity<List<AdminRegistrationRow>> getAllAdminRegistrations() {
        List<Registration> regs = registrationRepository.findAll();

        List<AdminRegistrationRow> rows = regs.stream()
                .map(this::toRow)
                .sorted(Comparator
                        .comparing(AdminRegistrationRow::raceDate, Comparator.nullsLast(Comparator.reverseOrder()))
                        .thenComparing(AdminRegistrationRow::raceName, Comparator.nullsLast(String::compareToIgnoreCase))
                        .thenComparing(AdminRegistrationRow::racerDivision, Comparator.nullsLast(String::compareToIgnoreCase))
                        .thenComparing(r -> (r.racerLastName() == null ? "" : r.racerLastName()), String::compareToIgnoreCase)
                        .thenComparing(r -> (r.racerFirstName() == null ? "" : r.racerFirstName()), String::compareToIgnoreCase)
                )
                .toList();

        return ResponseEntity.ok(rows);
    }

    /**
     * ✅ NEW: fast fetch registrations for ONE race
     * GET /api/admin/registrations/by-race/{raceId}
     */
    @GetMapping("/by-race/{raceId}")
    @Transactional(readOnly = true)
    public ResponseEntity<List<AdminRegistrationRow>> getByRace(@PathVariable Long raceId) {
        List<Registration> regs = registrationRepository.findByRaceId(raceId);

        List<AdminRegistrationRow> rows = regs.stream()
                .map(this::toRow)
                .sorted(Comparator
                        .comparing(AdminRegistrationRow::racerLastName, Comparator.nullsLast(String::compareToIgnoreCase))
                        .thenComparing(AdminRegistrationRow::racerFirstName, Comparator.nullsLast(String::compareToIgnoreCase))
                )
                .toList();

        return ResponseEntity.ok(rows);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteRegistration(@PathVariable Long id) {
        if (!registrationRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        registrationRepository.deleteById(id);
        return ResponseEntity.ok("Deleted.");
    }
}