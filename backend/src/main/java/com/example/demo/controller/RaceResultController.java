package com.example.demo.controller;

import com.example.demo.model.RaceResult;
import com.example.demo.repository.RaceResultRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/results")
public class RaceResultController {

    private final RaceResultRepository raceResultRepository;

    public RaceResultController(RaceResultRepository raceResultRepository) {
        this.raceResultRepository = raceResultRepository;
    }

    @GetMapping
    public List<RaceResultResponse> getAllResults() {
        return raceResultRepository.findAll()
                .stream()
                .map(RaceResultResponse::fromEntity)
                .toList();
    }

    // flat DTO for frontend
    public static class RaceResultResponse {
        public Long id;
        public Long raceId;
        public String raceName;
        public String raceDate;   // yyyy-MM-dd
        public Long racerId;
        public String racerName;
        public String division;
        public int placement;

        public static RaceResultResponse fromEntity(RaceResult rr) {
            RaceResultResponse dto = new RaceResultResponse();
            dto.id = rr.getId();

            dto.raceId = rr.getRace().getId();
            dto.raceName = rr.getRace().getRaceName();
            dto.raceDate = rr.getRace().getRaceDate() != null ? rr.getRace().getRaceDate().toString() : null;

            dto.racerId = rr.getRacer().getId();
            dto.racerName = rr.getRacer().getFirstName() + " " + rr.getRacer().getLastName();

            dto.division = rr.getDivision();
            dto.placement = rr.getPlacement();
            return dto;
        }
    }
}