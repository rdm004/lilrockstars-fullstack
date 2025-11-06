package com.example.demo.model;

import jakarta.persistence.*;

@Entity
public class RaceResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Which race this result belongs to
    @ManyToOne
    @JoinColumn(name = "race_id")
    private Race race;

    // Which racer this result is for
    @ManyToOne
    @JoinColumn(name = "racer_id")
    private Racer racer;

    private String division;  // "3 Year Old Division", etc.
    private int placement;    // 1, 2, 3...

    public RaceResult() {}

    public RaceResult(Race race, Racer racer, String division, int placement) {
        this.race = race;
        this.racer = racer;
        this.division = division;
        this.placement = placement;
    }

    public Long getId() { return id; }
    public Race getRace() { return race; }
    public void setRace(Race race) { this.race = race; }
    public Racer getRacer() { return racer; }
    public void setRacer(Racer racer) { this.racer = racer; }
    public String getDivision() { return division; }
    public void setDivision(String division) { this.division = division; }
    public int getPlacement() { return placement; }
    public void setPlacement(int placement) { this.placement = placement; }
}