package com.example.demo.repository;

import com.example.demo.model.Sponsor;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SponsorRepository extends JpaRepository<Sponsor, Long> {

    // For full sponsors page
    List<Sponsor> findAllByOrderByNameAsc();

    // For home page preview – top 8 by name (you can change to id or add a “priority” field later)
    List<Sponsor> findTop8ByOrderByNameAsc();
}