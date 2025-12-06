package com.example.demo.repository;

import com.example.demo.model.Sponsor;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SponsorRepository extends JpaRepository<Sponsor, Long> {

    // Return all sponsors alphabetically — used for both the Sponsors page & Home page.
    List<Sponsor> findAllByOrderByNameAsc();
}