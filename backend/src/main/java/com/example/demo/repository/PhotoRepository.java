package com.example.demo.repository;

import com.example.demo.model.Photo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PhotoRepository extends JpaRepository<Photo, Long> {

    // For full gallery, ordered newest → oldest
    List<Photo> findAllByOrderByUploadedAtDesc();

    // For home page preview (tweak number if you want)
    List<Photo> findTop8ByOrderByUploadedAtDesc();
}