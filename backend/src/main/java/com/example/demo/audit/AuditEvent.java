package com.example.demo.audit;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "audit_event")
public class AuditEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Set via @PrePersist to avoid weird behavior if entity is constructed differently
    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    // Always store a safe value, even if token missing/invalid
    @Column(nullable = false)
    private String actorEmail = "anonymous";

    // More accurate default than "ADMIN"
    @Column(nullable = false)
    private String actorRole = "UNKNOWN";

    @Column(nullable = false)
    private String method;

    @Column(nullable = false, length = 500)
    private String path;

    @Column(nullable = false)
    private int status;

    @Column(length = 120)
    private String ip;

    @Column(length = 300)
    private String userAgent;

    @Column(length = 2000)
    private String note;

    public AuditEvent() {}

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = Instant.now();
        if (actorEmail == null || actorEmail.isBlank()) actorEmail = "anonymous";
        if (actorRole == null || actorRole.isBlank()) actorRole = "UNKNOWN";
        if (method != null) method = method.trim().toUpperCase();
        if (path != null) path = path.trim();
        if (ip != null) ip = ip.trim();
        if (userAgent != null) {
            String ua = userAgent.trim();
            userAgent = ua.length() > 300 ? ua.substring(0, 300) : ua;
        }
    }

    // --------------------
    // Getters & Setters
    // --------------------
    public Long getId() { return id; }

    public Instant getCreatedAt() { return createdAt; }

    public String getActorEmail() { return actorEmail; }
    public void setActorEmail(String actorEmail) {
        this.actorEmail = (actorEmail == null || actorEmail.isBlank())
                ? "anonymous"
                : actorEmail.trim().toLowerCase();
    }

    public String getActorRole() { return actorRole; }
    public void setActorRole(String actorRole) {
        this.actorRole = (actorRole == null || actorRole.isBlank())
                ? "UNKNOWN"
                : actorRole.trim().toUpperCase();
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