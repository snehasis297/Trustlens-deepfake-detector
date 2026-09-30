package com.trustlens.dto;

import java.time.LocalDateTime;

public class ChatResponse {

    private Long scanId;
    private String response;
    private String modelProvider;
    private LocalDateTime timestamp;

    public ChatResponse() {
    }

    public ChatResponse(Long scanId, String response, String modelProvider, LocalDateTime timestamp) {
        this.scanId = scanId;
        this.response = response;
        this.modelProvider = modelProvider;
        this.timestamp = timestamp;
    }

    public Long getScanId() {
        return scanId;
    }

    public void setScanId(Long scanId) {
        this.scanId = scanId;
    }

    public String getResponse() {
        return response;
    }

    public void setResponse(String response) {
        this.response = response;
    }

    public String getModelProvider() {
        return modelProvider;
    }

    public void setModelProvider(String modelProvider) {
        this.modelProvider = modelProvider;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
}
