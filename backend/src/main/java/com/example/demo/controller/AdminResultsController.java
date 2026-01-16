package com.example.demo.controller;

import com.example.demo.model.Race;
import com.example.demo.model.RaceResult;
import com.example.demo.model.Racer;
import com.example.demo.repository.RaceRepository;
import com.example.demo.repository.RaceResultRepository;
import com.example.demo.repository.RacerRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.Comparator;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin/results")
public class AdminResultsController {

    private final RaceResultRepository raceResultRepository;
    private final RaceRepository raceRepository;
    private final RacerRepository racerRepository;

    public AdminResultsController(
            RaceResultRepository raceResultRepository,
            RaceRepository raceRepository,
            RacerRepository racerRepository
    ) {
        this.raceResultRepository = raceResultRepository;
        this.raceRepository = raceRepository;
        this.racerRepository = racerRepository;
    }

    /**
     * Flat DTO for admin UI
     */
    public record AdminResultRow(
            Long id,
            Long raceId,
            String raceName,
            String raceDate,   // ISO yyyy-MM-dd
            Long racerId,
            String racerName,
            String division,
            Integer placement,
            String carNumber
    ) {}

    private AdminResultRow toRow(RaceResult rr) {
        Race race = rr.getRace();
        Racer racer = rr.getRacer();

        String racerName = racer != null
                ? ((racer.getFirstName() == null ? "" : racer.getFirstName()) + " " +
                (racer.getLastName() == null ? "" : racer.getLastName())).trim()
                : null;

        return new AdminResultRow(
                rr.getId(),
                race != null ? race.getId() : null,
                race != null ? race.getRaceName() : null,
                (race != null && race.getRaceDate() != null) ? race.getRaceDate().toString() : null,
                racer != null ? racer.getId() : null,
                racerName,
                rr.getDivision(),
                rr.getPlacement(), // primitive int in entity, but DTO uses Integer for flexibility
                racer != null ? racer.getCarNumber() : null
        );
    }

    /**
     * ✅ Get all results (admin)
     */
    @GetMapping
    @Transactional(readOnly = true)
    public List<AdminResultRow> getAll() {
        return raceResultRepository.findAll()
                .stream()
                .sorted(Comparator
                        .comparing((RaceResult rr) ->
                                        rr.getRace() != null ? rr.getRace().getRaceDate() : null,
                                Comparator.nullsLast(Comparator.reverseOrder()))
                        .thenComparing(rr -> rr.getDivision() == null ? "" : rr.getDivision(),
                                String::compareToIgnoreCase)
                        // ✅ FIX: placement is primitive int, so no null check
                        .thenComparingInt(RaceResult::getPlacement)
                )
                .map(this::toRow)
                .toList();
    }

    /**
     * ✅ Create a single result row
     * payload expects: raceId, racerId, division, placement
     */
    public record CreateResultRequest(
            Long raceId,
            Long racerId,
            String division,
            Integer placement
    ) {}

    @PostMapping
    public ResponseEntity<?> create(@RequestBody CreateResultRequest req) {
        if (req == null || req.raceId() == null || req.racerId() == null || req.placement() == null) {
            return ResponseEntity.badRequest().body("raceId, racerId, and placement are required.");
        }

        Optional<Race> raceOpt = raceRepository.findById(req.raceId());
        if (raceOpt.isEmpty()) return ResponseEntity.badRequest().body("Race not found.");

        Optional<Racer> racerOpt = racerRepository.findById(req.racerId());
        if (racerOpt.isEmpty()) return ResponseEntity.badRequest().body("Racer not found.");

        // Your rule: racers must have a parent
        if (racerOpt.get().getParent() == null) {
            return ResponseEntity.badRequest().body("Racer must be associated with a parent.");
        }

        RaceResult rr = new RaceResult();
        rr.setRace(raceOpt.get());
        rr.setRacer(racerOpt.get());
        rr.setDivision(req.division());
        rr.setPlacement(req.placement());

        RaceResult saved = raceResultRepository.save(rr);
        return ResponseEntity.ok(toRow(saved));
    }

    /**
     * ✅ Delete a result row
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        if (!raceResultRepository.existsById(id)) return ResponseEntity.notFound().build();
        raceResultRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}