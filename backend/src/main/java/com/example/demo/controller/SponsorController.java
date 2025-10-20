package com.example.demo.controller;

import com.example.demo.model.Sponsor;
import com.example.demo.repository.SponsorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sponsors")
@CrossOrigin(origins = {"http://localhost:3000", "https://lilrockstarsracing.com"})
public class SponsorController {

    @Autowired
    private SponsorRepository sponsorRepository;

    // GET all sponsors
    @GetMapping
    public List<Sponsor> getAllSponsors() {
        return sponsorRepository.findAll();
    }

    // POST new sponsor
    @PostMapping
    public Sponsor addSponsor(@RequestBody Sponsor sponsor) {
        return sponsorRepository.save(sponsor);
    }
}