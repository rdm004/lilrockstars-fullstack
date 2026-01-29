package com.example.demo.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;

@Entity
@Table(name = "racer")
public class Racer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String firstName;
    private String lastName;

    /**
     * Optional field to distinguish racers with the same first/last/age.
     * Stored as "" when not provided to avoid null vs "" confusion.
     */
    @Column(nullable = false)
    private String nickname = "";

    private int age;
    private String division;
    private String carNumber;

    /**
     * ✅ Protect parent object in responses:
     * - password never shown due to WRITE_ONLY (Parent.java)
     * - but we ALSO explicitly ignore password/racers to prevent accidental exposure
     *   and recursion / payload bloat
     */
    @ManyToOne
    @JoinColumn(name = "parent_id")
    @JsonIgnoreProperties({ "password", "racers" })
    private Parent parent;

    // --- Normalization (prevents whitespace duplicates) ---
    @PrePersist
    @PreUpdate
    private void normalizeFields() {
        if (firstName != null) firstName = firstName.trim();
        if (lastName != null) lastName = lastName.trim();

        // ✅ Never allow nickname to be null in DB. Avoids NULL vs "" duplicates.
        nickname = (nickname == null) ? "" : nickname.trim();

        if (division != null) division = division.trim();
        if (carNumber != null) carNumber = carNumber.trim();
    }

    // Getters & Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getNickname() { return nickname; }
    public void setNickname(String nickname) { this.nickname = nickname; }

    public int getAge() { return age; }
    public void setAge(int age) { this.age = age; }

    public String getDivision() { return division; }
    public void setDivision(String division) { this.division = division; }

    public String getCarNumber() { return carNumber; }
    public void setCarNumber(String carNumber) { this.carNumber = carNumber; }

    public Parent getParent() { return parent; }
    public void setParent(Parent parent) { this.parent = parent; }
}