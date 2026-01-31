package com.example.demo.model;

import jakarta.persistence.*;
import java.time.Instant;
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

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role = Role.USER;

    @ManyToMany
    @JoinTable(
            name = "parent_racer_link",
            joinColumns = @JoinColumn(name = "parent_id"),
            inverseJoinColumns = @JoinColumn(name = "racer_id")
    )
    private Set<Racer> racers = new HashSet<>();

    // ✅ NEW: login attempt limiting
    @Column(nullable = false)
    private int failedLoginAttempts = 0;

    // ✅ NEW: if set and in the future, account is locked
    private Instant lockedUntil;

    public Parent() {}

    @PrePersist
    @PreUpdate
    private void normalizeEmail() {
        if (email != null) email = email.trim().toLowerCase();
    }

    // --------------------
    // Helpers
    // --------------------
    public boolean isLockedNow() {
        return lockedUntil != null && lockedUntil.isAfter(Instant.now());
    }

    public void resetLoginLock() {
        this.failedLoginAttempts = 0;
        this.lockedUntil = null;
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

    public int getFailedLoginAttempts() { return failedLoginAttempts; }
    public void setFailedLoginAttempts(int failedLoginAttempts) { this.failedLoginAttempts = failedLoginAttempts; }

    public Instant getLockedUntil() { return lockedUntil; }
    public void setLockedUntil(Instant lockedUntil) { this.lockedUntil = lockedUntil; }
}