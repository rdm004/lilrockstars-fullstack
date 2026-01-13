package com.example.demo.repository;

import com.example.demo.model.Parent;
import com.example.demo.model.ParentRacerLink;
import com.example.demo.model.Racer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface ParentRacerLinkRepository extends JpaRepository<ParentRacerLink, Long> {

    List<ParentRacerLink> findByParent(Parent parent);

    boolean existsByParentAndRacer(Parent parent, Racer racer);

    // ✅ Needed so Admin can delete a racer without FK errors
    @Modifying
    @Transactional
    @Query("delete from ParentRacerLink l where l.racer.id = :racerId")
    int deleteByRacerId(Long racerId);
}

void deleteByRacerId(Long racerId);