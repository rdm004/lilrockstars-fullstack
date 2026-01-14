// src/main/java/com/example/demo/repository/RacerRepository.java
package com.example.demo.repository;

import com.example.demo.model.Parent;
import com.example.demo.model.Racer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface RacerRepository extends JpaRepository<Racer, Long> {

    // ==========================================================
    // Parent dashboard (owned + co-parent racers)
    // ==========================================================
    List<Racer> findByParent(Parent parent);

    @Query("""
           select distinct r
           from Racer r
           left join ParentRacerLink l on l.racer = r
           where r.parent = :parent or l.parent = :parent
           """)
    List<Racer> findAllVisibleToParent(@Param("parent") Parent parent);

    // ==========================================================
    // Admin search (ONLY racers with a parent)
    // ==========================================================
    @Query("""
   select distinct r
   from Racer r
   left join ParentRacerLink l on l.racer = r
   where
     (r.parent is not null or l.parent is not null)
     and (
         lower(r.firstName) like lower(concat('%', :q, '%'))
      or lower(r.lastName) like lower(concat('%', :q, '%'))
      or lower(r.carNumber) like lower(concat('%', :q, '%'))
     )
   """)
    List<Racer> searchAdminRacers(@Param("q") String q);
}