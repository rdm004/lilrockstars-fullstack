package com.example.demo.controller;

import com.example.demo.model.Parent;
import com.example.demo.repository.ParentRepository;
import com.example.demo.security.JwtUtil;
import com.example.demo.service.PasswordResetService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final ParentRepository parentRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final PasswordResetService passwordResetService;

    // ----------------------------------
    // Login attempt limiting (tweak as needed)
    // ----------------------------------
    private static final int MAX_FAILED_ATTEMPTS = 5;
    private static final Duration LOCK_DURATION = Duration.ofMinutes(15);
    private static final String GENERIC_LOGIN_ERROR = "Invalid email or password";

    public AuthController(
            ParentRepository parentRepository,
            PasswordEncoder passwordEncoder,
            JwtUtil jwtUtil,
            PasswordResetService passwordResetService
    ) {
        this.parentRepository = parentRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.passwordResetService = passwordResetService;
    }

    // ----------------------------------
    // Helpers
    // ----------------------------------
    private String normalizeEmail(String email) {
        return email == null ? null : email.trim().toLowerCase();
    }

    private void tinyDelayOnFailure() {
        // Optional: slows brute-force without needing Redis/WAF
        try {
            Thread.sleep(250);
        } catch (InterruptedException ignored) {
        }
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

            // ✅ Encode password ONCE
            parent.setPassword(passwordEncoder.encode(password));

            // ✅ Default role if missing
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
// LOGIN (rate limit by email)
// ----------------------------------
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Parent loginRequest) {
        try {
            String email = normalizeEmail(loginRequest.getEmail());
            String password = loginRequest.getPassword();

            if (email == null || email.isBlank() || password == null || password.isBlank()) {
                tinyDelayOnFailure();
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Email and password are required."));
            }

            Optional<Parent> parentOpt = parentRepository.findByEmailIgnoreCase(email);

            // ✅ Don’t reveal whether email exists
            if (parentOpt.isEmpty()) {
                tinyDelayOnFailure();
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "Invalid credentials."));
            }

            Parent parent = parentOpt.get();

            // ✅ If locked, block login
            if (parent.isLockedNow()) {
                tinyDelayOnFailure();
                return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                        .body(Map.of("message", "Too many failed attempts. Try again later."));
            }

            // ✅ Check password against stored hash
            boolean ok = passwordEncoder.matches(password, parent.getPassword());

            if (!ok) {
                int attempts = parent.getFailedLoginAttempts() + 1;
                parent.setFailedLoginAttempts(attempts);

                if (attempts >= MAX_FAILED_ATTEMPTS) {
                    parent.setLockedUntil(Instant.now().plus(LOCK_DURATION));
                }

                parentRepository.save(parent);

                tinyDelayOnFailure();
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "Invalid credentials."));
            }

            // ✅ Success: reset lock/attempts
            parent.resetLoginLock();
            parentRepository.save(parent);

            String roleName = (parent.getRole() == null) ? "USER" : parent.getRole().name();
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
            tinyDelayOnFailure();
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

            String roleName = (parent.getRole() == null) ? "USER" : parent.getRole().name();

            return ResponseEntity.ok(Map.of(
                    "email", parent.getEmail(),
                    "firstName", parent.getFirstName(),
                    "lastName", parent.getLastName(),
                    "role", roleName
            ));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Invalid or expired token"));
        }
    }

    // ----------------------------------
    // PASSWORD RESET
    // ----------------------------------
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        passwordResetService.requestReset(email);

        // ✅ Always the same response (prevents email enumeration)
        return ResponseEntity.ok(Map.of(
                "message", "If that email exists, we sent a password reset link."
        ));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> body) {
        String token = body.get("token");
        String newPassword = body.get("newPassword");

        if (newPassword == null || newPassword.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "New password is required."));
        }

        boolean ok = passwordResetService.resetPassword(token, newPassword);
        if (!ok) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Invalid or expired reset token."));
        }

        return ResponseEntity.ok(Map.of(
                "message", "Password reset successful. You can now log in."
        ));
    }
}