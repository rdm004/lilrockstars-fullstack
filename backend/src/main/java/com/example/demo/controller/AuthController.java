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

    // ----------------------------------
    // Helpers
    // ----------------------------------
    private String normalizeEmail(String email) {
        return email == null ? null : email.trim().toLowerCase();
    }

    // ----------------------------------
    // REGISTER
    // ----------------------------------
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Parent parent) {
        try {
            String email = normalizeEmail(parent.getEmail());
            String password = parent.getPassword();

            if (email == null || email.isBlank() || password == null || password.isBlank()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Email and password are required."));
            }

            if (parentRepository.existsByEmailIgnoreCase(email)) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Email already registered."));
            }

            parent.setEmail(email);
            parent.setPassword(passwordEncoder.encode(password));

            // default role if missing
            if (parent.getRole() == null) {
                parent.setRole(Parent.Role.USER);
            }

            parentRepository.save(parent);

            return ResponseEntity.ok(Map.of(
                    "message", "Parent registered successfully",
                    "email", parent.getEmail()
            ));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Registration failed"));
        }
    }

    // ----------------------------------
    // LOGIN
    // ----------------------------------
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Parent loginRequest) {
        try {
            String email = normalizeEmail(loginRequest.getEmail());
            String password = loginRequest.getPassword();

            if (email == null || email.isBlank() || password == null || password.isBlank()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Email and password are required."));
            }

            Optional<Parent> parentOpt = parentRepository.findByEmailIgnoreCase(email);
            if (parentOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "Invalid credentials."));
            }

            Parent parent = parentOpt.get();

            if (!passwordEncoder.matches(password, parent.getPassword())) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "Invalid credentials."));
            }

            String roleName = parent.getRole() == null
                    ? "USER"
                    : parent.getRole().name();

            String token = jwtUtil.generateToken(parent.getEmail(), roleName);

            return ResponseEntity.ok(Map.of(
                    "message", "Login successful",
                    "token", token,
                    "email", parent.getEmail(),
                    "firstName", parent.getFirstName(),
                    "lastName", parent.getLastName(),
                    "role", roleName
            ));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Login failed"));
        }
    }

    // ----------------------------------
    // CURRENT USER
    // ----------------------------------
    @GetMapping("/me")
    public ResponseEntity<?> me(@RequestHeader(value = "Authorization", required = false) String authHeader) {

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Missing token"));
        }

        try {
            String token = authHeader.substring(7);
            String email = jwtUtil.extractUsername(token);

            Optional<Parent> parentOpt = parentRepository.findByEmailIgnoreCase(email);
            if (parentOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "Invalid token"));
            }

            Parent parent = parentOpt.get();

            return ResponseEntity.ok(Map.of(
                    "email", parent.getEmail(),
                    "firstName", parent.getFirstName(),
                    "lastName", parent.getLastName(),
                    "role", parent.getRole().name()
            ));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Invalid or expired token"));
        }
    }
}