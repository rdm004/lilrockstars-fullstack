package com.example.demo.controller;

import com.example.demo.model.Photo;
import com.example.demo.repository.PhotoRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/photos")
public class PhotoController {

    private final PhotoRepository photoRepository;

    public PhotoController(PhotoRepository photoRepository) {
        this.photoRepository = photoRepository;
    }

    // 📸 Full gallery – newest first
    @GetMapping
    public List<Photo> getAllPhotos() {
        return photoRepository.findAllByOrderByUploadedAtDesc();
    }

    // 📸 Latest uploads – for home page preview
    @GetMapping("/latest")
    public List<Photo> getLatestPhotos() {
        // tweak to 4, 6, etc. if you want fewer/more
        return photoRepository.findTop8ByOrderByUploadedAtDesc();
    }
}