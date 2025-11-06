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

    // simple DTO so frontend gets flat data
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
            dto.raceDate = rr.getRace().getRaceDate().toString(); // ISO yyyy-MM-dd
            dto.racerName = rr.getRacer().getFirstName() + " " + rr.getRacer().getLastName();
            dto.division = rr.getDivision();
            dto.placement = rr.getPlacement();
            return dto;
        }
    }
}