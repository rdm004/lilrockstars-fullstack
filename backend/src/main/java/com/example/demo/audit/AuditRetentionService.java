package com.example.demo.audit;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

@Service
public class AuditRetentionService {

    private final AuditEventRepository auditRepo;

    // Keep audit logs for X days (default 30)
    private final int retentionDays;

    public AuditRetentionService(
            AuditEventRepository auditRepo,
            @Value("${app.audit.retention-days:30}") int retentionDays
    ) {
        this.auditRepo = auditRepo;
        this.retentionDays = retentionDays;
    }

    /**
     * Runs daily at 3:15 AM server time.
     * 1) Delete everything not POST/PUT/PATCH/DELETE (kills GET noise)
     * 2) Delete anything older than retentionDays
     */
    @Scheduled(cron = "0 15 3 * * *")
    public void runRetention() {
        // Delete non-write methods (GET/HEAD/OPTIONS/etc.)
        auditRepo.deleteNonWriteMethods();

        // Delete old events by age
        Instant cutoff = Instant.now().minus(retentionDays, ChronoUnit.DAYS);
        auditRepo.deleteOlderThan(cutoff);
    }

    /**
     * Optional helper if you want to purge GETs once (not used by scheduler).
     */
    public int purgeGetsOnce() {
        return auditRepo.deleteAllGets();
    }
}