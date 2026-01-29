package com.example.demo.audit;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "audit_event")
public class AuditEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Instant createdAt = Instant.now();

    @Column(nullable = false)
    private String actorEmail;

    // ✅ NEW
    @Column(nullable = false)
    private String actorRole = "ADMIN";

    @Column(nullable = false)
    private String method;

    @Column(nullable = false, length = 500)
    private String path;

    @Column(nullable = false)
    private int status;

    @Column(length = 120)
    private String ip;

    @Column(length = 500)
    private String userAgent;

    @Column(length = 2000)
    private String note;

    public AuditEvent() {}

    public AuditEvent(String actorEmail, String actorRole, String method, String path, int status, String ip, String userAgent) {
        this.actorEmail = actorEmail;
        this.actorRole = actorRole == null || actorRole.isBlank() ? "ADMIN" : actorRole;
        this.method = method;
        this.path = path;
        this.status = status;
        this.ip = ip;
        this.userAgent = userAgent;
    }

    public Long getId() { return id; }
    public Instant getCreatedAt() { return createdAt; }

    public String getActorEmail() { return actorEmail; }
    public void setActorEmail(String actorEmail) { this.actorEmail = actorEmail; }

    public String getActorRole() { return actorRole; }
    public void setActorRole(String actorRole) {
        this.actorRole = (actorRole == null || actorRole.isBlank()) ? "ADMIN" : actorRole;
    }

    public String getMethod() { return method; }
    public void setMethod(String method) { this.method = method; }

    public String getPath() { return path; }
    public void setPath(String path) { this.path = path; }

    public int getStatus() { return status; }
    public void setStatus(int status) { this.status = status; }

    public String getIp() { return ip; }
    public void setIp(String ip) { this.ip = ip; }

    public String getUserAgent() { return userAgent; }
    public void setUserAgent(String userAgent) { this.userAgent = userAgent; }

    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
}