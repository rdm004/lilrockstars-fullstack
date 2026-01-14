package com.example.demo.controller;

import com.example.demo.model.Racer;
import com.example.demo.repository.RacerRepository;
import org.springframework.web.bind.annotation.*;

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

    // GET /api/admin/racers/search?q=emry OR q=21
    @GetMapping("/search")
    public List<RacerSearchDto> search(@RequestParam("q") String q) {
        String term = (q == null) ? "" : q.trim();
        if (term.isBlank()) return List.of();

        // Only racers that exist AND have a parent (your rule)
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