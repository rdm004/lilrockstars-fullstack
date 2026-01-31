package com.example.demo.audit;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/audit")
public class AdminAuditMaintenanceController {

    private final AuditRetentionService retentionService;
    private final AuditEventRepository auditRepo;

    public AdminAuditMaintenanceController(AuditRetentionService retentionService, AuditEventRepository auditRepo) {
        this.retentionService = retentionService;
        this.auditRepo = auditRepo;
    }

    // ✅ Call once after deploying the new filter to remove old GET spam
    @PostMapping("/purge-get")
    public ResponseEntity<?> purgeGet() {
        int deleted = retentionService.purgeNoisyMethods();
        return ResponseEntity.ok(Map.of("deleted", deleted));
    }

    // ✅ Optional: nuke all audit logs (if you want a “Clear All” button)
    @DeleteMapping("/clear")
    public ResponseEntity<?> clearAll() {
        auditRepo.deleteAllInBatch();
        return ResponseEntity.ok(Map.of("message", "Audit cleared"));
    }
}