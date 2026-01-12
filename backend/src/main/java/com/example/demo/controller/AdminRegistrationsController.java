package com.example.demo.controller;

import com.example.demo.model.Registration;
import com.example.demo.repository.RegistrationRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin/registrations")
public class AdminRegistrationsController {

    private final RegistrationRepository registrationRepository;

    public AdminRegistrationsController(RegistrationRepository registrationRepository) {
        this.registrationRepository = registrationRepository;
    }

    // ✅ Get ALL registrations (Admin)
    @GetMapping
    public ResponseEntity<List<Registration>> getAllRegistrations() {
        return ResponseEntity.ok(registrationRepository.findAll());
    }

    // ✅ Get one registration by id (Admin)
    @GetMapping("/{id}")
    public ResponseEntity<?> getOne(@PathVariable Long id) {
        Optional<Registration> reg = registrationRepository.findById(id);
        return reg.<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // ✅ Update status OR full registration (Admin)
    // If your frontend sends { racerId, raceId, status } that is OK,
    // but the Registration entity likely uses Racer/Race references.
    // So: for now we only update status IF it's present.
    public record UpdateRegistrationRequest(String status) {}

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id,
                                    @RequestBody UpdateRegistrationRequest request) {
        Optional<Registration> regOpt = registrationRepository.findById(id);
        if (regOpt.isEmpty()) return ResponseEntity.notFound().build();

        Registration reg = regOpt.get();

        if (request != null && request.status() != null && !request.status().isBlank()) {
            // Only works if your Registration entity has setStatus()
            reg.setStatus(request.status());
        }

        Registration saved = registrationRepository.save(reg);
        return ResponseEntity.ok(saved);
    }

    // ✅ Delete (Admin)
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        if (!registrationRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        registrationRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}