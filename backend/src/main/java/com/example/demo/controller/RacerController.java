package com.example.demo.controller;

import com.example.demo.model.Racer;
import com.example.demo.repository.RacerRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/racers")
@CrossOrigin(origins = "*")
public class RacerController {

    private final RacerRepository racerRepository;

    public RacerController(RacerRepository racerRepository) {
        this.racerRepository = racerRepository;
    }

    @GetMapping
    public List<Racer> getAllRacers() {
        return racerRepository.findAll();
    }

    @PostMapping
    public Racer addRacer(@RequestBody Racer racer) {
        return racerRepository.save(racer);
    }
}