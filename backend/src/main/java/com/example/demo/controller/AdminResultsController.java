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

    public record AdminResultRow(
            Long id,
            Long raceId,
            String raceName,
            String raceDate,
            Long racerId,
            String racerName,
            String division,
            Integer placement,
            String carNumber
    ) {}

    private AdminResultRow toRow(RaceResult rr) {
        Race race = rr.getRace();
        Racer racer = rr.getRacer();

        String racerName = "-";
        String carNumber = null;

        if (racer != null) {
            String first = Optional.ofNullable(racer.getFirstName()).orElse("");
            String last = Optional.ofNullable(racer.getLastName()).orElse("");
            racerName = (first + " " + last).trim();
            carNumber = racer.getCarNumber();
        }

        return new AdminResultRow(
                rr.getId(),
                race != null ? race.getId() : null,
                race != null ? race.getRaceName() : null,
                (race != null && race.getRaceDate() != null) ? race.getRaceDate().toString() : null,
                racer != null ? racer.getId() : null,
                racerName,
                rr.getDivision(),
                rr.getPlacement(),
                carNumber
        );
    }

    /**
     * ✅ Admin: list all results
     */
    @GetMapping
    @Transactional(readOnly = true)
    public ResponseEntity<List<AdminResultRow>> getAll() {
        List<AdminResultRow> rows = raceResultRepository.findAll()
                .stream()
                .map(this::toRow)
                .sorted(Comparator
                        .comparing(AdminResultRow::raceDate, Comparator.nullsLast(Comparator.reverseOrder()))
                        .thenComparing(AdminResultRow::division, Comparator.nullsLast(String::compareToIgnoreCase))
                        .thenComparing(r -> r.placement() == null ? 9999 : r.placement())
                )
                .toList();

        return ResponseEntity.ok(rows);
    }

    public record CreateResultRequest(
            Long raceId,
            Long racerId,
            String division,
            Integer placement
    ) {}

    /**
     * ✅ Admin: create one result row
     */
    @PostMapping
    public ResponseEntity<?> create(@RequestBody CreateResultRequest req) {
        if (req == null || req.raceId() == null || req.racerId() == null || req.placement() == null) {
            return ResponseEntity.badRequest().body("raceId, racerId, and placement are required.");
        }

        Optional<Race> raceOpt = raceRepository.findById(req.raceId());
        if (raceOpt.isEmpty()) return ResponseEntity.badRequest().body("Race not found: " + req.raceId());

        Optional<Racer> racerOpt = racerRepository.findById(req.racerId());
        if (racerOpt.isEmpty()) return ResponseEntity.badRequest().body("Racer not found: " + req.racerId());

        // Enforce your rule: racer must be associated with a parent
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
     * ✅ Admin: delete a result row
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        if (!raceResultRepository.existsById(id)) return ResponseEntity.notFound().build();
        raceResultRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}