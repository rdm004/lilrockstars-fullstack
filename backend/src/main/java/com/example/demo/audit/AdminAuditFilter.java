package com.example.demo.audit;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Set;

@Component
public class AdminAuditFilter extends OncePerRequestFilter {

    private static final Set<String> MUTATING_METHODS = Set.of("POST", "PUT", "PATCH", "DELETE");

    private final AuditEventRepository auditRepo;

    public AdminAuditFilter(AuditEventRepository auditRepo) {
        this.auditRepo = auditRepo;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        String method = request.getMethod();

        if (path == null) return true;

        // only admin endpoints
        if (!path.startsWith("/api/admin/")) return true;

        // don't audit viewing audit logs
        if (path.startsWith("/api/admin/audit")) return true;

        // only mutations
        if (!MUTATING_METHODS.contains(method)) return true;

        // only these resources
        boolean isTarget =
                path.contains("/racers") ||
                        path.contains("/races") ||
                        path.contains("/registrations") ||
                        path.contains("/results");

        return !isTarget;
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
            chain.doFilter(req, res);
        } finally {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated()) {
                actorEmail = auth.getName();
                actorRole = auth.getAuthorities() != null ? auth.getAuthorities().toString() : null;
            }

            AuditEvent ev = new AuditEvent();
            ev.setActorEmail(actorEmail);
            ev.setActorRole(actorRole);
            ev.setMethod(req.getMethod());
            ev.setPath(req.getRequestURI());
            ev.setStatus(res.getStatus());

            // ✅ intentionally not storing IP or userAgent
            auditRepo.save(ev);
        }
    }
}