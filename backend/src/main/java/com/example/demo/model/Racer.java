package com.example.demo.model;

import jakarta.persistence.*;
<<<<<<< HEAD

@Entity
@Table(name = "racers")
public class Racer {

=======
import java.time.LocalDate;

@Entity
public class Racer {
>>>>>>> 917952875e7a7d0b1831f67d8ef8afb31e438123
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String firstName;
    private String lastName;
    private int age;
    private String carNumber;
<<<<<<< HEAD

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private Parent parent;

    public Racer() {}

    public Racer(String firstName, String lastName, int age, String carNumber, Parent parent) {
=======
    private String parentEmail;
    private LocalDate registrationDate = LocalDate.now();

    public Racer() {}

    public Racer(String firstName, String lastName, int age, String carNumber, String parentEmail) {
>>>>>>> 917952875e7a7d0b1831f67d8ef8afb31e438123
        this.firstName = firstName;
        this.lastName = lastName;
        this.age = age;
        this.carNumber = carNumber;
<<<<<<< HEAD
        this.parent = parent;
    }

    // --- Getters and Setters ---
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public int getAge() {
        return age;
    }

    public void setAge(int age) {
        this.age = age;
    }

    public String getCarNumber() {
        return carNumber;
    }

    public void setCarNumber(String carNumber) {
        this.carNumber = carNumber;
    }

    public Parent getParent() {
        return parent;
    }

    public void setParent(Parent parent) {
        this.parent = parent;
    }
=======
        this.parentEmail = parentEmail;
    }

    // Getters and setters
    public Long getId() { return id; }
    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    public int getAge() { return age; }
    public void setAge(int age) { this.age = age; }
    public String getCarNumber() { return carNumber; }
    public void setCarNumber(String carNumber) { this.carNumber = carNumber; }
    public String getParentEmail() { return parentEmail; }
    public void setParentEmail(String parentEmail) { this.parentEmail = parentEmail; }
    public LocalDate getRegistrationDate() { return registrationDate; }
>>>>>>> 917952875e7a7d0b1831f67d8ef8afb31e438123
}