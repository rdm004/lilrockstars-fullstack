package com.example.demo.controller;

import com.example.demo.model.Race;
import com.example.demo.model.Racer;
import com.example.demo.model.RaceResult;
import com.example.demo.repository.RaceRepository;
import com.example.demo.repository.RacerRepository;
import com.example.demo.repository.RaceResultRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/results")
public class RaceResultController {

    private final RaceResultRepository raceResultRepository;
    private final RaceRepository raceRepository;
    private final RacerRepository racerRepository;

    public RaceResultController(
            RaceResultRepository raceResultRepository,
            RaceRepository raceRepository,
            RacerRepository racerRepository
    ) {
        this.raceResultRepository = raceResultRepository;
        this.raceRepository = raceRepository;
        this.racerRepository = racerRepository;
    }

    @GetMapping
    public List<RaceResultResponse> getAllResults() {
        return raceResultRepository.findAll()
                .stream()
                .map(RaceResultResponse::fromEntity)
                .toList();
    }

    // ✅ Create result (used by ResultsManagement "Save All")
    public static class CreateResultRequest {
        public Long raceId;
        public Long racerId;
        public String division;
        public Integer placement;
    }

    @PostMapping
    public ResponseEntity<?> createResult(@RequestBody CreateResultRequest req) {
        if (req == null || req.raceId == null || req.racerId == null || req.placement == null) {
            return ResponseEntity.badRequest().body("raceId, racerId, and placement are required.");
        }
        if (req.placement < 1) {
            return ResponseEntity.badRequest().body("placement must be >= 1.");
        }

        Optional<Race> raceOpt = raceRepository.findById(req.raceId);
        if (raceOpt.isEmpty()) return ResponseEntity.badRequest().body("Race not found: " + req.raceId);

        Optional<Racer> racerOpt = racerRepository.findById(req.racerId);
        if (racerOpt.isEmpty()) return ResponseEntity.badRequest().body("Racer not found: " + req.racerId);

        Racer racer = racerOpt.get();
        if (racer.getParent() == null) {
            return ResponseEntity.badRequest().body("Racer must be associated with a parent.");
        }

        RaceResult rr = new RaceResult();
        rr.setRace(raceOpt.get());
        rr.setRacer(racer);
        rr.setDivision(req.division);      // OK if null; you can compute later if desired
        rr.setPlacement(req.placement);

        RaceResult saved = raceResultRepository.save(rr);
        return ResponseEntity.ok(RaceResultResponse.fromEntity(saved));
    }

    // ✅ Optional: allow deletes from same controller too
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteResult(@PathVariable Long id) {
        if (!raceResultRepository.existsById(id)) return ResponseEntity.notFound().build();
        raceResultRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    // flat DTO so frontend gets clean output
    public static class RaceResultResponse {
        public Long id;
        public String raceName;
        public String raceDate;
        public String racerName;
        public String division;
        public int placement;

        public static RaceResultResponse fromEntity(RaceResult rr) {
            RaceResultResponse dto = new RaceResultResponse();
            dto.id = rr.getId();
            dto.raceName = rr.getRace().getRaceName();
            dto.raceDate = rr.getRace().getRaceDate() != null ? rr.getRace().getRaceDate().toString() : null;
            dto.racerName = rr.getRacer().getFirstName() + " " + rr.getRacer().getLastName();
            dto.division = rr.getDivision();
            dto.placement = rr.getPlacement();
            return dto;
        }
    }
}