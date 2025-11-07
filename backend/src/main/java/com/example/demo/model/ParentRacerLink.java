// src/main/java/com/example/demo/model/ParentRacerLink.java
package com.example.demo.model;

import jakarta.persistence.*;

@Entity
@Table(name = "parent_racer_link")
public class ParentRacerLink {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "parent_id")
    private Parent parent;

    @ManyToOne(optional = false)
    @JoinColumn(name = "racer_id")
    private Racer racer;

    public ParentRacerLink() {}

    public ParentRacerLink(Parent parent, Racer racer) {
        this.parent = parent;
        this.racer = racer;
    }

    public Long getId() { return id; }

    public Parent getParent() { return parent; }
    public void setParent(Parent parent) { this.parent = parent; }

    public Racer getRacer() { return racer; }
    public void setRacer(Racer racer) { this.racer = racer; }
}