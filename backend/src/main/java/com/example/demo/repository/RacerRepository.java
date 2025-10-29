package com.example.demo.repository;

import com.example.demo.model.Racer;
<<<<<<< HEAD
import com.example.demo.model.Parent;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RacerRepository extends JpaRepository<Racer, Long> {
    List<Racer> findByParent(Parent parent);
=======
import org.springframework.data.jpa.repository.JpaRepository;

public interface RacerRepository extends JpaRepository<Racer, Long> {
>>>>>>> 917952875e7a7d0b1831f67d8ef8afb31e438123
}