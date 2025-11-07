// src/main/java/com/example/demo/repository/ParentRacerLinkRepository.java
package com.example.demo.repository;

import com.example.demo.model.Parent;
import com.example.demo.model.ParentRacerLink;
import com.example.demo.model.Racer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ParentRacerLinkRepository extends JpaRepository<ParentRacerLink, Long> {

    List<ParentRacerLink> findByParent(Parent parent);

    boolean existsByParentAndRacer(Parent parent, Racer racer);
}