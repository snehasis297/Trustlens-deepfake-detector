package com.trustlens.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class ChatRequest {

    @NotNull(message = "scanId is required")
    private Long scanId;

    @NotBlank(message = "message is required")
    private String message;

    public ChatRequest() {
    }

    public ChatRequest(Long scanId, String message) {
        this.scanId = scanId;
        this.message = message;
    }

    public Long getScanId() {
        return scanId;
    }

    public void setScanId(Long scanId) {
        this.scanId = scanId;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
