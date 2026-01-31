package com.example.demo.audit;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

public interface AuditEventRepository extends JpaRepository<AuditEvent, Long> {

    // Search (NO IP referenced)
    @Query("""
        select a
        from AuditEvent a
        where (:q is null or :q = '' or
               lower(a.actorEmail) like lower(concat('%', :q, '%')) or
               lower(coalesce(a.actorRole, '')) like lower(concat('%', :q, '%')) or
               lower(a.path) like lower(concat('%', :q, '%')) or
               lower(a.method) like lower(concat('%', :q, '%')) or
               cast(a.status as string) like concat('%', :q, '%') or
               lower(coalesce(a.userAgent, '')) like lower(concat('%', :q, '%'))
        )
        order by a.createdAt desc
    """)
    Page<AuditEvent> search(@Param("q") String q, Pageable pageable);

    // Retention cleanup
    @Modifying
    @Transactional
    @Query("delete from AuditEvent a where a.createdAt < :cutoff")
    int deleteOlderThan(@Param("cutoff") Instant cutoff);

    // Optional one-time cleanup if you want to remove old GET noise (no UI needed)
    @Modifying
    @Transactional
    @Query("delete from AuditEvent a where upper(a.method) = 'GET'")
    int deleteAllGets();

    // Optional: keep only write methods (POST/PUT/PATCH/DELETE), delete everything else
    @Modifying
    @Transactional
    @Query("""
        delete from AuditEvent a
        where upper(a.method) not in ('POST','PUT','PATCH','DELETE')
    """)
    int deleteNonWriteMethods();
}