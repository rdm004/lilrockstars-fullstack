package com.example.demo.audit;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AuditEventRepository extends JpaRepository<AuditEvent, Long> {

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
}