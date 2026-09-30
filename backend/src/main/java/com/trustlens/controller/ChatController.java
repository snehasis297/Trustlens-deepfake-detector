package com.trustlens.controller;

import com.trustlens.dto.ChatRequest;
import com.trustlens.dto.ChatResponse;
import com.trustlens.exception.ApiException;
import com.trustlens.model.ScanHistory;
import com.trustlens.model.User;
import com.trustlens.repository.ScanHistoryRepository;
import com.trustlens.repository.UserRepository;
import com.trustlens.service.ChatbotService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final ChatbotService chatbotService;
    private final ScanHistoryRepository scanHistoryRepository;
    private final UserRepository userRepository;

    public ChatController(
            ChatbotService chatbotService,
            ScanHistoryRepository scanHistoryRepository,
            UserRepository userRepository) {
        this.chatbotService = chatbotService;
        this.scanHistoryRepository = scanHistoryRepository;
        this.userRepository = userRepository;
    }

    @PostMapping
    public ResponseEntity<ChatResponse> askChatbot(
            @Valid @RequestBody ChatRequest request,
            Authentication authentication) {

        User user = getCurrentUser(authentication);

        ScanHistory scan = scanHistoryRepository.findByIdAndUserId(request.getScanId(), user.getId())
                .orElseThrow(() -> new ApiException("Referenced scan ID #" + request.getScanId() + " not found or unauthorized.", HttpStatus.NOT_FOUND));

        ChatResponse response = chatbotService.generateExplanation(scan, request.getMessage());
        return ResponseEntity.ok(response);
    }

    private User getCurrentUser(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw new ApiException("Unauthorized authentication context", HttpStatus.UNAUTHORIZED);
        }
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ApiException("User profile not found", HttpStatus.UNAUTHORIZED));
    }
}
