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
import java.util.Set;

@Component
public class AdminAuditFilter extends OncePerRequestFilter {

    private static final Set<String> MUTATING_METHODS = Set.of("POST", "PUT", "PATCH", "DELETE");

    // Only log these admin areas
    private static final Set<String> SENSITIVE_PREFIXES = Set.of(
            "/api/admin/racers",
            "/api/admin/races",
            "/api/admin/registrations",
            "/api/admin/results"
    );

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
        String method = request.getMethod();

        // 1) Only mutating methods
        if (!MUTATING_METHODS.contains(method)) return true;

        // 2) Must be under /api/admin/*
        if (path == null || !path.startsWith("/api/admin/")) return true;

        // 3) Never audit the audit endpoints themselves
        if (path.startsWith("/api/admin/audit")) return true;

        // 4) Only log the sensitive resources listed above
        for (String prefix : SENSITIVE_PREFIXES) {
            if (path.startsWith(prefix)) return false;
        }

        return true;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest req,
            HttpServletResponse res,
            FilterChain chain
    ) throws ServletException, IOException {

        String actorEmail = null;
        String actorRole = null;

        try {
            String auth = req.getHeader("Authorization");
            if (auth != null && auth.startsWith("Bearer ")) {
                String token = auth.substring(7);
                actorEmail = jwtUtil.extractUsername(token);

                if (actorEmail != null && !actorEmail.isBlank()) {
                    Parent p = parentRepository.findByEmailIgnoreCase(actorEmail).orElse(null);
                    if (p != null && p.getRole() != null) actorRole = p.getRole().name();
                }
            }

            chain.doFilter(req, res);

        } finally {
            AuditEvent ev = new AuditEvent();
            ev.setActorEmail(actorEmail);
            ev.setActorRole(actorRole);
            ev.setMethod(req.getMethod());
            ev.setPath(req.getRequestURI());
            ev.setStatus(res.getStatus());
            ev.setUserAgent(safeUserAgent(req.getHeader("User-Agent")));

            // ✅ NEW: attach controller-provided details (safe, no tokens, no passwords)
            Object noteObj = req.getAttribute("auditNote");
            if (noteObj instanceof String s) {
                String note = s.trim();
                if (!note.isBlank()) ev.setNote(note);
            }

            auditRepo.save(ev);
        }
    }

    private String safeUserAgent(String ua) {
        if (ua == null) return null;
        ua = ua.trim();
        return ua.length() > 300 ? ua.substring(0, 300) : ua;
    }
}