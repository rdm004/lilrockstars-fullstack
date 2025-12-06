// com.example.demo.controller.SponsorController
package com.example.demo.controller;

import com.example.demo.model.Sponsor;
import com.example.demo.repository.SponsorRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/sponsors")
public class SponsorController {

    private final SponsorRepository sponsorRepository;

    public SponsorController(SponsorRepository sponsorRepository) {
        this.sponsorRepository = sponsorRepository;
    }

    // 🔹 Full sponsors list (Sponsors page)
    @GetMapping
    public List<Sponsor> getAllSponsors() {
        // nice, predictable order for the main Sponsors page
        return sponsorRepository.findAllByOrderByNameAsc();
    }

    // 🔹 Home page preview – return ALL sponsors (frontend can style/scroll)
    @GetMapping("/featured")
    public List<Sponsor> getFeaturedSponsors() {
        // no limit here – show them all; we can change later if needed
        return sponsorRepository.findAllByOrderByNameAsc();
    }

    @PostMapping
    public Sponsor createSponsor(@RequestBody Sponsor sponsor) {
        return sponsorRepository.save(sponsor);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Sponsor> updateSponsor(@PathVariable Long id,
                                                 @RequestBody Sponsor updated) {
        Optional<Sponsor> existingOpt = sponsorRepository.findById(id);
        if (existingOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Sponsor sponsor = existingOpt.get();
        sponsor.setName(updated.getName());
        sponsor.setLogoUrl(updated.getLogoUrl());
        sponsor.setWebsite(updated.getWebsite());
        sponsor.setDescription(updated.getDescription());

        return ResponseEntity.ok(sponsorRepository.save(sponsor));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSponsor(@PathVariable Long id) {
        if (!sponsorRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        sponsorRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}