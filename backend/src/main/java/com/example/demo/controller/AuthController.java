package com.example.demo.controller;

import com.example.demo.model.Parent;
import com.example.demo.repository.ParentRepository;
import com.example.demo.security.JwtUtil;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

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

    private String normalizeEmail(String email) {
        return email == null ? null : email.trim().toLowerCase();
    }

    // 🧾 REGISTER new parent account
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Parent parent) {
        try {
            String email = normalizeEmail(parent.getEmail());
            String password = parent.getPassword();

            if (email == null || email.isBlank() || password == null || password.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Email and password are required."));
            }

            if (parentRepository.existsByEmailIgnoreCase(email)) {
                return ResponseEntity.badRequest().body(Map.of("message", "Email already registered."));
            }

            parent.setEmail(email);

            // ✅ Default role
            if (parent.getRole() == null) {
                parent.setRole(Parent.Role.USER);
            }

            // ✅ Encode password ONCE
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
            String email = normalizeEmail(loginRequest.getEmail());
            String password = loginRequest.getPassword();

            if (email == null || email.isBlank() || password == null || password.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Email and password are required."));
            }

            Optional<Parent> parentOpt = parentRepository.findByEmailIgnoreCase(email);
            if (parentOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Invalid credentials."));
            }

            Parent parent = parentOpt.get();

            if (!passwordEncoder.matches(password, parent.getPassword())) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Invalid credentials."));
            }

            String role = (parent.getRole() == null) ? "USER" : parent.getRole().name();

            // ✅ Token includes role claim now
            String token = jwtUtil.generateToken(parent.getEmail(), role);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Login successful!");
            response.put("token", token);
            response.put("email", parent.getEmail());
            response.put("firstName", parent.getFirstName());
            response.put("lastName", parent.getLastName());
            response.put("role", role); // ✅ frontend can use this for UX

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
            String email = jwtUtil.extractUsername(token);

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
                    "email", parent.getEmail(),
                    "role", parent.getRole() == null ? "USER" : parent.getRole().name()
            ));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Invalid or expired token"));
        }
    }
}