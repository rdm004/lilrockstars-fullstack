package com.example.demo.audit;

import com.example.demo.model.Parent;
import com.example.demo.repository.ParentRepository;
import com.example.demo.security.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Service;

@Service
public class AuditService {

    private final AuditEventRepository auditRepo;
    private final JwtUtil jwtUtil;
    private final ParentRepository parentRepository;

    public AuditService(AuditEventRepository auditRepo, JwtUtil jwtUtil, ParentRepository parentRepository) {
        this.auditRepo = auditRepo;
        this.jwtUtil = jwtUtil;
        this.parentRepository = parentRepository;
    }

    public void logAdminWrite(HttpServletRequest req, int status, String note) {
        String actorEmail = null;
        String actorRole = null;

        String auth = req.getHeader("Authorization");
        if (auth != null && auth.startsWith("Bearer ")) {
            String token = auth.substring(7);
            actorEmail = jwtUtil.extractUsername(token);

            if (actorEmail != null && !actorEmail.isBlank()) {
                Parent p = parentRepository.findByEmailIgnoreCase(actorEmail).orElse(null);
                if (p != null && p.getRole() != null) actorRole = p.getRole().name();
            }
        }

        AuditEvent ev = new AuditEvent();
        ev.setActorEmail(actorEmail);
        ev.setActorRole(actorRole);
        ev.setMethod(req.getMethod());
        ev.setPath(req.getRequestURI());
        ev.setStatus(status);
        ev.setUserAgent(req.getHeader("User-Agent"));

        // ✅ this is the important part:
        ev.setNote(note);

        auditRepo.save(ev);
    }
}