package com.trustlens.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDateTime;

public class ScanResponse {

    private Long id;
    private Long userId;
    private String imageName;
    private boolean isFake;
    private Double confidence;
    private String explanation;
    private LocalDateTime scannedAt;
    private String executionProvider;
    private boolean snapdragonNpuReady;
    private Double inferenceTimeMs;

    public ScanResponse() {
    }

    public ScanResponse(Long id, Long userId, String imageName, boolean isFake, Double confidence,
                        String explanation, LocalDateTime scannedAt, String executionProvider,
                        boolean snapdragonNpuReady, Double inferenceTimeMs) {
        this.id = id;
        this.userId = userId;
        this.imageName = imageName;
        this.isFake = isFake;
        this.confidence = confidence;
        this.explanation = explanation;
        this.scannedAt = scannedAt;
        this.executionProvider = executionProvider;
        this.snapdragonNpuReady = snapdragonNpuReady;
        this.inferenceTimeMs = inferenceTimeMs;
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

    public String getExecutionProvider() {
        return executionProvider;
    }

    public void setExecutionProvider(String executionProvider) {
        this.executionProvider = executionProvider;
    }

    public boolean isSnapdragonNpuReady() {
        return snapdragonNpuReady;
    }

    public void setSnapdragonNpuReady(boolean snapdragonNpuReady) {
        this.snapdragonNpuReady = snapdragonNpuReady;
    }

    public Double getInferenceTimeMs() {
        return inferenceTimeMs;
    }

    public void setInferenceTimeMs(Double inferenceTimeMs) {
        this.inferenceTimeMs = inferenceTimeMs;
    }
}
