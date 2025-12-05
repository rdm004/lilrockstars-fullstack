// com.example.demo.controller.PhotoController
package com.example.demo.controller;

import com.example.demo.model.Photo;
import com.example.demo.repository.PhotoRepository;
import com.example.demo.service.SupabaseStorageService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/photos")
public class PhotoController {

    private final PhotoRepository photoRepository;
    private final SupabaseStorageService storageService;

    public PhotoController(PhotoRepository photoRepository,
                           SupabaseStorageService storageService) {
        this.photoRepository = photoRepository;
        this.storageService = storageService;
    }

    @GetMapping
    public List<Photo> getAll() {
        return photoRepository.findAll();
    }

    // Already had create/update/delete here…

    // 🔥 New upload endpoint
    @PostMapping("/upload")
    public ResponseEntity<Photo> uploadPhoto(
            @RequestParam("file") MultipartFile file,
            @RequestParam("title") String title,
            @RequestParam(value = "caption", required = false) String caption
    ) throws IOException {

        String publicUrl = storageService.uploadImage(file);

        Photo photo = new Photo();
        photo.setTitle(title);
        photo.setCaption(caption);
        photo.setImageUrl(publicUrl);
        // uploadedAt will default to now in your entity, or set explicitly:
        // photo.setUploadedAt(LocalDateTime.now());

        Photo saved = photoRepository.save(photo);
        return ResponseEntity.ok(saved);
    }
}