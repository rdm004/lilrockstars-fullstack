package com.example.demo.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "parent")
public class Parent {

    public enum Role {
        USER,
        ADMIN
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "first_name")
    private String firstName;

    @Column(name = "last_name")
    private String lastName;

    @Column(unique = true, nullable = false)
    private String email;

    /**
     * ✅ SECURITY CRITICAL
     * Accept password in requests, but NEVER serialize it back in responses
     * (even hashed passwords must not be exposed).
     */
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role = Role.USER;

    /**
     * ✅ Avoid recursive JSON / huge payloads:
     * You don't want Parent -> racers -> parent -> racers...
     *
     * This is a JPA mapping but not needed in API responses.
     */
    @JsonIgnore
    @ManyToMany
    @JoinTable(
            name = "parent_racer_link",
            joinColumns = @JoinColumn(name = "parent_id"),
            inverseJoinColumns = @JoinColumn(name = "racer_id")
    )
    private Set<Racer> racers = new HashSet<>();

    public Parent() {}

    // --------------------
    // Normalize email
    // --------------------
    @PrePersist
    @PreUpdate
    private void normalizeEmail() {
        if (email != null) {
            email = email.trim().toLowerCase();
        }
    }

    // --------------------
    // Getters & Setters
    // --------------------
    public Long getId() { return id; }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }

    public Set<Racer> getRacers() { return racers; }
    public void setRacers(Set<Racer> racers) { this.racers = racers; }
}