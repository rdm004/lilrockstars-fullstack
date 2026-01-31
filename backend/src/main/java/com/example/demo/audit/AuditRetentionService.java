package com.example.demo.audit;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class AuditRetentionService {

    private final AuditEventRepository auditRepo;
    private final int retentionDays;

    public AuditRetentionService(
            AuditEventRepository auditRepo,
            @Value("${app.audit.retention-days:30}") int retentionDays
    ) {
        this.auditRepo = auditRepo;
        this.retentionDays = retentionDays;
    }

    /**
     * ✅ Runs daily at 3:30am server time.
     * Deletes logs older than retentionDays.
     */
    @Scheduled(cron = "0 30 3 * * *")
    @Transactional
    public void purgeOldAuditEvents() {
        Instant cutoff = Instant.now().minus(retentionDays, ChronoUnit.DAYS);
        auditRepo.deleteOlderThan(cutoff);
    }

    /**
     * ✅ Optional one-time helper you can call from an endpoint:
     * Delete GET logs that were already stored before you changed the filter.
     */
    @Transactional
    public int purgeNoisyMethods() {
        return auditRepo.deleteByMethods(List.of("GET"));
    }
}