package com.example.demo.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class Registration {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private Racer racer;

    @ManyToOne
    private Race race;

    private LocalDateTime registeredAt = LocalDateTime.now();

    public Registration() {}

    public Registration(Racer racer, Race race) {
        this.racer = racer;
        this.race = race;
    }

    // Getters and setters
    public Long getId() { return id; }
    public Racer getRacer() { return racer; }
    public void setRacer(Racer racer) { this.racer = racer; }
    public Race getRace() { return race; }
    public void setRace(Race race) { this.race = race; }
    public LocalDateTime getRegisteredAt() { return registeredAt; }
}