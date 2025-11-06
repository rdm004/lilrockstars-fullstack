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

    public AuthController(ParentRepository parentRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.parentRepository = parentRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    // 🧾 Register new parent
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Parent parent) {
        if (parentRepository.findByEmail(parent.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Email already registered.");
        }

        // ✅ Ensure password is encoded
        parent.setPassword(passwordEncoder.encode(parent.getPassword()));

        parentRepository.save(parent);
        return ResponseEntity.ok("Parent registered successfully!");
    }

    // 🔑 Login and get JWT token
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Parent loginRequest) {
        System.out.println("🔑 Login attempt for: " + loginRequest.getEmail());

        Optional<Parent> parentOpt = parentRepository.findByEmail(loginRequest.getEmail());

        if (parentOpt.isPresent()) {
            Parent parent = parentOpt.get();

            System.out.println("🧩 Stored (hashed) password: " + parent.getPassword());
            System.out.println("🧩 Raw password entered: " + loginRequest.getPassword());
            System.out.println("🧩 Password match? " + passwordEncoder.matches(loginRequest.getPassword(), parent.getPassword()));

            if (passwordEncoder.matches(loginRequest.getPassword(), parent.getPassword())) {
                String token = jwtUtil.generateToken(parent.getEmail());

                Map<String, Object> response = new HashMap<>();
                response.put("message", "Login successful!");
                response.put("token", token);
                response.put("email", parent.getEmail());
                response.put("firstName", parent.getFirstName());
                response.put("lastName", parent.getLastName());

                System.out.println("✅ Login success for " + parent.getEmail());
                return ResponseEntity.ok(response);
            }
        } else {
            System.out.println("❌ No parent found with email: " + loginRequest.getEmail());
        }

        System.out.println("❌ Login failed — invalid credentials.");
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials.");
    }

    // 🧍 Get logged-in user info
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Missing or invalid token");
            }

            String token = authHeader.substring(7);
            String email = jwtUtil.extractUsername(token);

            Optional<Parent> parentOpt = parentRepository.findByEmail(email);
            if (parentOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
            }

            Parent parent = parentOpt.get();

            Map<String, Object> response = new HashMap<>();
            response.put("firstName", parent.getFirstName());
            response.put("lastName", parent.getLastName());
            response.put("email", parent.getEmail());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching user: " + e.getMessage());
        }
    }
}