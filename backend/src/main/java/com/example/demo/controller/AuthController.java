package com.example.demo.controller;

import com.example.demo.model.Parent;
import com.example.demo.repository.ParentRepository;
import com.example.demo.security.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final ParentRepository parentRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthController(ParentRepository parentRepository,
                          PasswordEncoder passwordEncoder,
                          JwtUtil jwtUtil) {
        this.parentRepository = parentRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    // 🧾 REGISTER new parent account
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Parent parent) {
        try {
            if (parent.getEmail() == null || parent.getPassword() == null) {
                return ResponseEntity.badRequest().body("Email and password are required.");
            }

            if (parentRepository.findByEmail(parent.getEmail()).isPresent()) {
                return ResponseEntity.badRequest().body("Email already registered.");
            }

            // ✅ Encode password before saving
            parent.setPassword(passwordEncoder.encode(parent.getPassword()));
            parentRepository.save(parent);

            return ResponseEntity.ok(Map.of(
                    "message", "Parent registered successfully!",
                    "email", parent.getEmail()
            ));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Registration failed", "details", e.getMessage()));
        }
    }

    // 🔑 LOGIN and return JWT token
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Parent loginRequest) {
        try {
            if (loginRequest.getEmail() == null || loginRequest.getPassword() == null) {
                return ResponseEntity.badRequest().body("Email and password are required.");
            }

            Optional<Parent> parentOpt = parentRepository.findByEmail(loginRequest.getEmail());

            if (parentOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials.");
            }

            Parent parent = parentOpt.get();

            if (!passwordEncoder.matches(loginRequest.getPassword(), parent.getPassword())) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials.");
            }

            // ✅ Generate JWT token
            String token = jwtUtil.generateToken(parent.getEmail());

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Login successful!");
            response.put("token", token);
            response.put("email", parent.getEmail());
            response.put("firstName", parent.getFirstName());
            response.put("lastName", parent.getLastName());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Login failed", "details", e.getMessage()));
        }
    }

    // 🧍 CURRENT USER (from JWT token)
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "Missing or invalid token"));
            }

            String token = authHeader.substring(7);
            String email = jwtUtil.extractUsername(token);

            if (email == null || email.isBlank()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "Invalid or expired token"));
            }

            Optional<Parent> parentOpt = parentRepository.findByEmail(email);
            if (parentOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("message", "User not found"));
            }

            Parent parent = parentOpt.get();

            Map<String, Object> response = new HashMap<>();
            response.put("firstName", parent.getFirstName());
            response.put("lastName", parent.getLastName());
            response.put("email", parent.getEmail());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Invalid or expired token"));
        }
    }
}