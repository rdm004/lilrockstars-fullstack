package com.example.demo.audit;

import org.springframework.stereotype.Service;

@Service
public class AuditRetentionService {

    private final AuditEventRepository auditRepo;

    public AuditRetentionService(AuditEventRepository auditRepo) {
        this.auditRepo = auditRepo;
    }

    // Keep only write methods
    public int purgeNonWriteMethods() {
        return auditRepo.deleteNonWriteMethods();
    }

    // If you only want to delete GET rows
    public int purgeAllGets() {
        return auditRepo.deleteAllGets();
    }
}