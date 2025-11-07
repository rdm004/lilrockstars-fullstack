// src/main/java/com/example/demo/repository/RacerRepository.java
package com.example.demo.repository;

import com.example.demo.model.Parent;
import com.example.demo.model.Racer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface RacerRepository extends JpaRepository<Racer, Long> {

    List<Racer> findByParent(Parent parent);

    @Query("""
           select distinct r 
           from Racer r
           left join ParentRacerLink l on l.racer = r
           where r.parent = :parent or l.parent = :parent
           """)
    List<Racer> findAllVisibleToParent(Parent parent);
}