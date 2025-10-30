package com.example.demo.model;

import jakarta.persistence.*;

@Entity
@Table(name = "racer")  // 👈 Add this line
public class Racer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String firstName;
    private String lastName;
    private int age;
    private String carNumber;

    @ManyToOne
    @JoinColumn(name = "parent_id")
    private Parent parent;

    // ✅ Add standard getters/setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public int getAge() { return age; }
    public void setAge(int age) { this.age = age; }

    public String getCarNumber() { return carNumber; }
    public void setCarNumber(String carNumber) { this.carNumber = carNumber; }

    public Parent getParent() { return parent; }
    public void setParent(Parent parent) { this.parent = parent; }
}

