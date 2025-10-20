package com.example.demo.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
public class Race {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String raceName;
    private String location;
    private LocalDate raceDate;
    private String description;

    public Race() {}

    public Race(String raceName, String location, LocalDate raceDate, String description) {
        this.raceName = raceName;
        this.location = location;
        this.raceDate = raceDate;
        this.description = description;
    }

    // Getters and setters
    public Long getId() { return id; }
    public String getRaceName() { return raceName; }
    public void setRaceName(String raceName) { this.raceName = raceName; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public LocalDate getRaceDate() { return raceDate; }
    public void setRaceDate(LocalDate raceDate) { this.raceDate = raceDate; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}