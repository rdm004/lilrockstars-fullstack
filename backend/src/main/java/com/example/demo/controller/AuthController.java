package com.example.demo.controller;

import com.example.demo.model.Parent;
import com.example.demo.repository.ParentRepository;
import com.example.demo.security.JwtUtil;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

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

    // -----------------------------
    // Helpers
    // -----------------------------
    private String normalizeEmail(String email) {
        return email == null ? null : email.trim().toLowerCase();
    }

    private String validatePasswordStrength(String password) {
        // Return null if OK, otherwise return message string
        if (password == null) return "Password is required.";

        String p = password.trim();
        if (p.length() < 8) return "Password must be at least 8 characters.";
        if (!p.matches(".*[A-Z].*")) return "Password must contain at least one uppercase letter.";
        if (!p.matches(".*[a-z].*")) return "Password must contain at least one lowercase letter.";
        if (!p.matches(".*\\d.*")) return "Password must contain at least one number.";
        if (!p.matches(".*[^A-Za-z0-9].*")) return "Password must contain at least one special character.";
        return null;
    }

    // 🧾 REGISTER new parent account
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Parent parent) {
        try {
            if (parent == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "Invalid request."));
            }

            String email = normalizeEmail(parent.getEmail());
            String password = parent.getPassword();

            if (email == null || email.isBlank() || password == null || password.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Email and password are required."));
            }

            // ✅ Password strength validation
            String pwErr = validatePasswordStrength(password);
            if (pwErr != null) {
                return ResponseEntity.badRequest().body(Map.of("message", pwErr));
            }

            // ✅ Duplicate email check (case-insensitive)
            if (parentRepository.existsByEmailIgnoreCase(email)) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("message", "Email already registered."));
            }

            // ✅ Normalize + encode ONCE
            parent.setEmail(email);
            parent.setPassword(passwordEncoder.encode(password));

            parentRepository.save(parent);

            return ResponseEntity.ok(Map.of(
                    "message", "Parent registered successfully!",
                    "email", parent.getEmail()
            ));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Registration failed", "details", e.getMessage()));
        }
    }

    // 🔑 LOGIN and return JWT token
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Parent loginRequest) {
        try {
            if (loginRequest == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "Invalid request."));
            }

            String email = normalizeEmail(loginRequest.getEmail());
            String password = loginRequest.getPassword();

            if (email == null || email.isBlank() || password == null || password.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Email and password are required."));
            }

            // ✅ Case-insensitive lookup
            Optional<Parent> parentOpt = parentRepository.findByEmailIgnoreCase(email);

            if (parentOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Invalid credentials."));
            }

            Parent parent = parentOpt.get();

            // ✅ matches() is correct
            if (!passwordEncoder.matches(password, parent.getPassword())) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Invalid credentials."));
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
                    .body(Map.of("message", "Login failed", "details", e.getMessage()));
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
            String email = normalizeEmail(jwtUtil.extractUsername(token));

            if (email == null || email.isBlank()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "Invalid or expired token"));
            }

            Optional<Parent> parentOpt = parentRepository.findByEmailIgnoreCase(email);
            if (parentOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("message", "User not found"));
            }

            Parent parent = parentOpt.get();

            return ResponseEntity.ok(Map.of(
                    "firstName", parent.getFirstName(),
                    "lastName", parent.getLastName(),
                    "email", parent.getEmail()
            ));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Invalid or expired token"));
        }
    }
}