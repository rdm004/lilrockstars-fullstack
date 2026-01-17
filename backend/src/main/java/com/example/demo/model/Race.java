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

    @Column(length = 2000)
    private String description;

    // ✅ NEW: if false, this is an "info-only" event (no registration)
    // default true so existing races behave normally
    private Boolean requiresRegistration = true;

    public Race() {}

    // Existing constructor (kept for compatibility)
    public Race(String raceName, String location, LocalDate raceDate, String description) {
        this.raceName = raceName;
        this.location = location;
        this.raceDate = raceDate;
        this.description = description;
        this.requiresRegistration = true;
    }

    // Optional constructor if you want to set requiresRegistration on creation
    public Race(String raceName, String location, LocalDate raceDate, String description, Boolean requiresRegistration) {
        this.raceName = raceName;
        this.location = location;
        this.raceDate = raceDate;
        this.description = description;
        this.requiresRegistration = (requiresRegistration == null) ? true : requiresRegistration;
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

    public Boolean getRequiresRegistration() { return requiresRegistration; }
    public void setRequiresRegistration(Boolean requiresRegistration) {
        this.requiresRegistration = (requiresRegistration == null) ? true : requiresRegistration;
    }
}