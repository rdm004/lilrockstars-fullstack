package com.example.demo.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class Photo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String imageUrl;
    private String caption;
    private LocalDateTime uploadedAt = LocalDateTime.now();

    public Photo() {}

    public Photo(String title, String imageUrl, String caption) {
        this.title = title;
        this.imageUrl = imageUrl;
        this.caption = caption;
    }

    // Getters and setters
    public Long getId() { return id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public String getCaption() { return caption; }
    public void setCaption(String caption) { this.caption = caption; }
    public LocalDateTime getUploadedAt() { return uploadedAt; }
}