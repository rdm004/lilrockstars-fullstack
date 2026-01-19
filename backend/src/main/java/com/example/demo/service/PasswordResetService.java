package com.example.demo.service;

import com.example.demo.model.Parent;
import com.example.demo.model.PasswordResetToken;
import com.example.demo.repository.ParentRepository;
import com.example.demo.repository.PasswordResetTokenRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Optional;
import java.util.UUID;

@Service
public class PasswordResetService {

    private final ParentRepository parentRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final JavaMailSender mailSender;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.frontend.url}")
    private String frontendBaseUrl;

    @Value("${app.mail.from:no-reply@lilrockstarsracing.com}")
    private String mailFrom;

    @Value("${app.reset.expiry-minutes:30}")
    private long expiryMinutes;

    public PasswordResetService(
            ParentRepository parentRepository,
            PasswordResetTokenRepository tokenRepository,
            JavaMailSender mailSender,
            PasswordEncoder passwordEncoder
    ) {
        this.parentRepository = parentRepository;
        this.tokenRepository = tokenRepository;
        this.mailSender = mailSender;
        this.passwordEncoder = passwordEncoder;
    }

    private String normalizeEmail(String email) {
        return email == null ? null : email.trim().toLowerCase();
    }

    public void requestReset(String emailRaw) {
        String email = normalizeEmail(emailRaw);
        if (email == null || email.isBlank()) return;

        // if user doesn't exist, do nothing (prevents account enumeration)
        Optional<Parent> parentOpt = parentRepository.findByEmailIgnoreCase(email);
        if (parentOpt.isEmpty()) return;

        // ✅ invalidate older tokens (AND SAVE)
        var oldTokens = tokenRepository.findAllByEmailIgnoreCase(email);
        oldTokens.forEach(t -> t.setUsed(true));
        tokenRepository.saveAll(oldTokens);

        String token = UUID.randomUUID().toString();
        Instant expiresAt = Instant.now().plus(expiryMinutes, ChronoUnit.MINUTES);

        PasswordResetToken prt = new PasswordResetToken(email, token, expiresAt);
        tokenRepository.save(prt);

        String link = frontendBaseUrl.replaceAll("/$", "") + "/reset-password?token=" + token;

        SimpleMailMessage msg = new SimpleMailMessage();
        msg.setTo(email);
        msg.setFrom(mailFrom);
        msg.setSubject("Lil Rockstars Racing - Password Reset");
        msg.setText(
                "We received a request to reset your password.\n\n" +
                        "Reset link (expires in " + expiryMinutes + " minutes):\n" +
                        link + "\n\n" +
                        "If you didn't request this, you can ignore this email."
        );

        try {
            mailSender.send(msg);
        } catch (Exception ex) {
            // Don't crash the endpoint (prevents 500)
            // Log it so Render logs show the real issue
            System.err.println("Password reset email failed: " + ex.getMessage());
            ex.printStackTrace();
        }
    }

    public boolean resetPassword(String tokenRaw, String newPasswordRaw) {
        String token = tokenRaw == null ? "" : tokenRaw.trim();
        String newPassword = newPasswordRaw == null ? "" : newPasswordRaw;

        if (token.isBlank()) return false;
        if (newPassword.isBlank()) return false;

        // ✅ basic strength rules (adjust if you want different)
        boolean strong =
                newPassword.length() >= 8 &&
                        newPassword.matches(".*[A-Z].*") &&
                        newPassword.matches(".*[a-z].*") &&
                        newPassword.matches(".*\\d.*") &&
                        newPassword.matches(".*[^A-Za-z0-9].*");

        if (!strong) return false;

        Optional<PasswordResetToken> opt = tokenRepository.findByToken(token);
        if (opt.isEmpty()) return false;

        PasswordResetToken prt = opt.get();

        if (prt.isUsed()) return false;
        if (prt.getExpiresAt() == null || prt.getExpiresAt().isBefore(Instant.now())) return false;

        Optional<Parent> parentOpt = parentRepository.findByEmailIgnoreCase(prt.getEmail());
        if (parentOpt.isEmpty()) return false;

        Parent parent = parentOpt.get();

        // encode ONCE
        parent.setPassword(passwordEncoder.encode(newPassword));
        parentRepository.save(parent);

        prt.setUsed(true);
        tokenRepository.save(prt);

        return true;
    }
}