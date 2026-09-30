package com.trustlens.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "scan_history")
public class ScanHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "image_name", nullable = false, length = 255)
    private String imageName;

    @Column(name = "is_fake", nullable = false)
    private boolean isFake;

    @Column(nullable = false)
    private Double confidence;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String explanation;

    @Column(name = "scanned_at", updatable = false)
    private LocalDateTime scannedAt;

    public ScanHistory() {
    }

    public ScanHistory(Long id, Long userId, String imageName, boolean isFake, Double confidence, String explanation, LocalDateTime scannedAt) {
        this.id = id;
        this.userId = userId;
        this.imageName = imageName;
        this.isFake = isFake;
        this.confidence = confidence;
        this.explanation = explanation;
        this.scannedAt = scannedAt;
    }

    @PrePersist
    protected void onCreate() {
        if (this.scannedAt == null) {
            this.scannedAt = LocalDateTime.now();
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getImageName() {
        return imageName;
    }

    public void setImageName(String imageName) {
        this.imageName = imageName;
    }

    @JsonProperty("isFake")
    public boolean isFake() {
        return isFake;
    }

    @JsonProperty("isFake")
    public void setFake(boolean fake) {
        this.isFake = fake;
    }

    @com.fasterxml.jackson.annotation.JsonGetter("fake")
    public boolean getFakeAlias() {
        return isFake;
    }

    @com.fasterxml.jackson.annotation.JsonGetter("is_fake")
    public boolean getIsFakeSnakeAlias() {
        return isFake;
    }

    public Double getConfidence() {
        return confidence;
    }

    public void setConfidence(Double confidence) {
        this.confidence = confidence;
    }

    public String getExplanation() {
        return explanation;
    }

    public void setExplanation(String explanation) {
        this.explanation = explanation;
    }

    public LocalDateTime getScannedAt() {
        return scannedAt;
    }

    public void setScannedAt(LocalDateTime scannedAt) {
        this.scannedAt = scannedAt;
    }
}
