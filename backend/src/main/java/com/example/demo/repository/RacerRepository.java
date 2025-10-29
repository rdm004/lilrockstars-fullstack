package com.example.demo.repository;

import com.example.demo.model.Racer;
import com.example.demo.model.Parent;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RacerRepository extends JpaRepository<Racer, Long> {
    List<Racer> findByParent(Parent parent);
}