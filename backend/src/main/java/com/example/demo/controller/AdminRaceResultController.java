package com.example.demo.controller;

import com.example.demo.model.Race;
import com.example.demo.model.RaceResult;
import com.example.demo.model.Racer;
import com.example.demo.repository.RaceRepository;
import com.example.demo.repository.RaceResultRepository;
import com.example.demo.repository.RacerRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/admin/results")
public class AdminRaceResultController {

    private final RaceResultRepository raceResultRepository;
    private final RaceRepository raceRepository;
    private final RacerRepository racerRepository;

    public AdminRaceResultController(RaceResultRepository raceResultRepository,
                                     RaceRepository raceRepository,
                                     RacerRepository racerRepository) {
        this.raceResultRepository = raceResultRepository;
        this.raceRepository = raceRepository;
        this.racerRepository = racerRepository;
    }

    // ---------- DTOs ----------
    public record ResultRowDto(
            Long id,
            Long raceId,
            Long racerId,
            String racerName,
            String carNumber,
            String division,
            Integer placement
    ) {}

    public record BulkEntry(Long racerId, Integer placement) {}

    public record BulkSaveRequest(Long raceId, String division, List<BulkEntry> entries) {}

    // ---------- Query (load one race+division) ----------
    // GET /api/admin/results?raceId=10&division=3%20Year%20Old%20Division
    @GetMapping
    public ResponseEntity<?> getByRaceAndDivision(@RequestParam Long raceId,
                                                  @RequestParam String division) {
        if (raceId == null || division == null || division.isBlank()) {
            return ResponseEntity.badRequest().body("raceId and division are required.");
        }

        List<RaceResult> rows = raceResultRepository
                .findByRaceIdAndDivisionOrderByPlacementAsc(raceId, division);

        List<ResultRowDto> dto = rows.stream().map(rr -> new ResultRowDto(
                rr.getId(),
                rr.getRace().getId(),
                rr.getRacer().getId(),
                rr.getRacer().getFirstName() + " " + rr.getRacer().getLastName(),
                rr.getRacer().getCarNumber(),
                rr.getDivision(),
                rr.getPlacement()
        )).toList();

        return ResponseEntity.ok(dto);
    }

    // ---------- Bulk save (fast entry) ----------
    // POST /api/admin/results/bulk
    @PostMapping("/bulk")
    public ResponseEntity<?> bulkSave(@RequestBody BulkSaveRequest req) {
        if (req == null || req.raceId() == null || req.division() == null || req.division().isBlank()) {
            return ResponseEntity.badRequest().body("raceId and division are required.");
        }

        Optional<Race> raceOpt = raceRepository.findById(req.raceId());
        if (raceOpt.isEmpty()) return ResponseEntity.badRequest().body("Race not found.");

        Race race = raceOpt.get();

        // Normalize entries list
        List<BulkEntry> entries = req.entries() == null ? List.of() : req.entries();

        // We’ll upsert per racerId (one result per racer per race).
        List<ResultRowDto> savedDtos = new ArrayList<>();

        for (BulkEntry e : entries) {
            if (e == null || e.racerId() == null) continue;

            Optional<Racer> racerOpt = racerRepository.findById(e.racerId());
            if (racerOpt.isEmpty()) {
                return ResponseEntity.badRequest().body("Racer not found: " + e.racerId());
            }
            Racer racer = racerOpt.get();

            // Enforce your rule: racer must be associated with a parent
            if (racer.getParent() == null) {
                return ResponseEntity.badRequest()
                        .body("Racer " + e.racerId() + " has no parent. Parent must create account + racer first.");
            }

            int placement = (e.placement() == null) ? 0 : e.placement();

            RaceResult rr = raceResultRepository
                    .findByRaceIdAndRacerId(race.getId(), racer.getId())
                    .orElseGet(() -> {
                        RaceResult created = new RaceResult();
                        created.setRace(race);
                        created.setRacer(racer);
                        return created;
                    });

            rr.setDivision(req.division());
            rr.setPlacement(placement);

            RaceResult saved = raceResultRepository.save(rr);

            savedDtos.add(new ResultRowDto(
                    saved.getId(),
                    race.getId(),
                    racer.getId(),
                    racer.getFirstName() + " " + racer.getLastName(),
                    racer.getCarNumber(),
                    saved.getDivision(),
                    saved.getPlacement()
            ));
        }

        // Sort by placement for return
        savedDtos.sort(Comparator.comparingInt(x -> x.placement() == null ? 0 : x.placement()));
        return ResponseEntity.ok(savedDtos);
    }

    // ---------- Delete one result row ----------
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteRow(@PathVariable Long id) {
        if (!raceResultRepository.existsById(id)) return ResponseEntity.notFound().build();
        raceResultRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}