package com.example.demo.audit;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/audit/maintenance")
public class AdminAuditMaintenanceController {

    private final AuditRetentionService retentionService;

    public AdminAuditMaintenanceController(AuditRetentionService retentionService) {
        this.retentionService = retentionService;
    }

    /**
     * Optional: one-time cleanup endpoint (admin-only)
     * Deletes GET noise immediately (non-write methods are already handled nightly by scheduler).
     */
    @PostMapping("/purge-gets")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> purgeGets() {
        int deleted = retentionService.purgeGetsOnce();
        return ResponseEntity.ok(Map.of(
                "message", "Purged GET audit events.",
                "deleted", deleted
        ));
    }
}