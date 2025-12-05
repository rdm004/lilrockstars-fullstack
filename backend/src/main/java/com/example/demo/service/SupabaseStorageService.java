package com.example.demo.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;

@Service
public class SupabaseStorageService {

    @Value("${supabase.project-url}")
    private String projectUrl;   // e.g. https://mdlvklscpycfzxnzjvza.supabase.co

    @Value("${supabase.service-key}")
    private String serviceKey;   // SERVICE_ROLE key (env var, never commit!)

    @Value("${supabase.bucket-name:photos}")
    private String bucketName;   // "photos"

    private final RestTemplate restTemplate = new RestTemplate();

    public String uploadImage(MultipartFile file) throws IOException {
        // Generate unique filename
        String original = file.getOriginalFilename();
        String ext = "";
        if (original != null && original.contains(".")) {
            ext = original.substring(original.lastIndexOf("."));
        }
        String fileName = UUID.randomUUID() + ext;

        // Supabase Storage upload URL (no /public here)
        String uploadUrl = projectUrl + "/storage/v1/object/" + bucketName + "/" + fileName;

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType(file.getContentType()));
        headers.set("apikey", serviceKey);
        headers.setBearerAuth(serviceKey);

        HttpEntity<byte[]> entity = new HttpEntity<>(file.getBytes(), headers);

        ResponseEntity<String> response =
                restTemplate.exchange(uploadUrl, HttpMethod.POST, entity, String.class);

        if (!response.getStatusCode().is2xxSuccessful()) {
            throw new RuntimeException("Failed to upload to Supabase: " + response.getStatusCode());
        }

        // Public URL for your bucket (note the `/public/` part)
        return projectUrl + "/storage/v1/object/public/" + bucketName + "/" + fileName;
    }
}