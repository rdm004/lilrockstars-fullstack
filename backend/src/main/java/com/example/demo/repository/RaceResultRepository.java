package com.example.demo.repository;

import com.example.demo.model.RaceResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

public interface RaceResultRepository extends JpaRepository<RaceResult, Long> {

    // ✅ Needed so Admin can delete a racer without FK errors
    @Modifying
    @Transactional
    @Query("delete from RaceResult rr where rr.racer.id = :racerId")
    int deleteByRacerId(Long racerId);
}

void deleteByRacerId(Long racerId);