package com.example.demo.controller;

import com.example.demo.model.Racer;
import com.example.demo.repository.RacerRepository;
import org.springframework.web.bind.annotation.*;

import java.util.Comparator;
import java.util.List;

@RestController
@RequestMapping("/api/admin/racers")
public class AdminRacersController {

    private final RacerRepository racerRepository;

    public AdminRacersController(RacerRepository racerRepository) {
        this.racerRepository = racerRepository;
    }

    public record RacerSearchDto(
            Long id,
            String firstName,
            String lastName,
            String carNumber,
            Integer age,
            String parentEmail
    ) {}

    /**
     * ✅ NEW: Admin list for dropdowns (only racers with an owning parent)
     * GET /api/admin/racers
     */
    @GetMapping
    public List<RacerSearchDto> listAll() {
        return racerRepository.findAll()
                .stream()
                .filter(r -> r.getParent() != null) // enforce your rule
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

    /**
     * GET /api/admin/racers/search?q=emry OR q=21
     */
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
}