package com.example.demo.audit;

import com.example.demo.model.Parent;
import com.example.demo.repository.ParentRepository;
import com.example.demo.security.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class AdminAuditFilter extends OncePerRequestFilter {

    private final AuditEventRepository auditRepo;
    private final JwtUtil jwtUtil;
    private final ParentRepository parentRepository;

    public AdminAuditFilter(AuditEventRepository auditRepo, JwtUtil jwtUtil, ParentRepository parentRepository) {
        this.auditRepo = auditRepo;
        this.jwtUtil = jwtUtil;
        this.parentRepository = parentRepository;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();

        // Only audit admin endpoints
        if (path == null || !path.startsWith("/api/admin/")) return true;

        // Skip preflight to avoid noisy logs
        return "OPTIONS".equalsIgnoreCase(request.getMethod());
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest req,
            HttpServletResponse res,
            FilterChain chain
    ) throws ServletException, IOException {

        String actorEmail = null;
        String actorRole = null;

        // Capture final status even on exceptions
        int status = 500;
        Exception thrown = null;

        try {
            // If token exists, extract identity (NEVER log token)
            String auth = req.getHeader("Authorization");
            if (auth != null && auth.startsWith("Bearer ")) {
                String token = auth.substring(7);
                actorEmail = jwtUtil.extractUsername(token);

                // If token doesn't store role claims, look up user by email
                if (actorEmail != null && !actorEmail.isBlank()) {
                    Parent p = parentRepository.findByEmailIgnoreCase(actorEmail).orElse(null);
                    if (p != null && p.getRole() != null) {
                        actorRole = p.getRole().name();
                    }
                }
            }

            chain.doFilter(req, res);
            status = res.getStatus();

        } catch (Exception e) {
            thrown = e;

            // If Spring already set status, keep it; else default to 500
            try {
                status = res.getStatus() > 0 ? res.getStatus() : 500;
            } catch (Exception ignored) {
                status = 500;
            }

            // Re-throw so your normal error handling still works
            if (e instanceof ServletException se) throw se;
            if (e instanceof IOException ioe) throw ioe;
            throw new ServletException(e);

        } finally {
            try {
                AuditEvent ev = new AuditEvent();
                ev.setActorEmail(actorEmail); // defaults to "anonymous" via setter
                ev.setActorRole(actorRole);   // defaults to "UNKNOWN" via setter

                ev.setMethod(req.getMethod());
                ev.setPath(req.getRequestURI());
                ev.setStatus(status);
                ev.setIp(getClientIp(req));
                ev.setUserAgent(req.getHeader("User-Agent"));

                // Optional: short error note (no stack traces, no secrets)
                if (thrown != null) {
                    ev.setNote("Exception: " + thrown.getClass().getSimpleName());
                }

                // DO NOT LOG: Authorization header, request bodies, passwords, tokens, reset links
                auditRepo.save(ev);

            } catch (Exception auditEx) {
                // Never block the request because audit logging failed
                // (You can log this server-side if you want, but do not throw)
            }
        }
    }

    private String getClientIp(HttpServletRequest req) {
        String xff = req.getHeader("X-Forwarded-For");
        String ip = (xff != null && !xff.isBlank())
                ? xff.split(",")[0].trim()
                : req.getRemoteAddr();

        return maskIp(ip);
    }

    private String maskIp(String ip) {
        if (ip == null) return null;

        // IPv4 masking
        if (ip.contains(".")) {
            String[] parts = ip.split("\\.");
            if (parts.length == 4) {
                return parts[0] + "." + parts[1] + "." + parts[2] + ".xxx";
            }
        }

        // IPv6 masking
        if (ip.contains(":")) {
            int idx = ip.lastIndexOf(":");
            if (idx > 0) {
                return ip.substring(0, idx) + ":xxxx";
            }
        }

        return "masked";
    }
}