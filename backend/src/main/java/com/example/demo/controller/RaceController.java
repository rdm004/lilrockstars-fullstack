package com.example.demo.controller;

import com.example.demo.model.Race;
import com.example.demo.repository.RaceRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/races")
public class RaceController {

    private final RaceRepository raceRepository;

    public RaceController(RaceRepository raceRepository) {
        this.raceRepository = raceRepository;
    }

    @GetMapping
    public List<Race> getAllRaces() {
        return raceRepository.findAll();
    }

    @PostMapping
    public Race addRace(@RequestBody Race race) {
        return raceRepository.save(race);
    }
}