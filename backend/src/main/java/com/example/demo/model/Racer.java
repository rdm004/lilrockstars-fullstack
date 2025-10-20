package com.example.demo.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
public class Racer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String firstName;
    private String lastName;
    private int age;
    private String carNumber;
    private String parentEmail;
    private LocalDate registrationDate = LocalDate.now();

    public Racer() {}

    public Racer(String firstName, String lastName, int age, String carNumber, String parentEmail) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.age = age;
        this.carNumber = carNumber;
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
}