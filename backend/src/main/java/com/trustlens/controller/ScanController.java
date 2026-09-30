package com.trustlens.controller;

import com.trustlens.dto.ScanResponse;
import com.trustlens.exception.ApiException;
import com.trustlens.model.ScanHistory;
import com.trustlens.model.User;
import com.trustlens.repository.ScanHistoryRepository;
import com.trustlens.repository.UserRepository;
import com.trustlens.service.AiServiceClient;
import com.trustlens.service.RateLimiterService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/scan")
public class ScanController {

    private final AiServiceClient aiServiceClient;
    private final ScanHistoryRepository scanHistoryRepository;
    private final UserRepository userRepository;
    private final RateLimiterService rateLimiterService;

    public ScanController(
            AiServiceClient aiServiceClient,
            ScanHistoryRepository scanHistoryRepository,
            UserRepository userRepository,
            RateLimiterService rateLimiterService) {
        this.aiServiceClient = aiServiceClient;
        this.scanHistoryRepository = scanHistoryRepository;
        this.userRepository = userRepository;
        this.rateLimiterService = rateLimiterService;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ScanResponse> uploadAndScan(
            @RequestParam(value = "image", required = false) MultipartFile imageParam,
            @RequestParam(value = "file", required = false) MultipartFile fileParam,
            Authentication authentication) {

        MultipartFile image = imageParam != null ? imageParam : fileParam;
        if (image == null || image.isEmpty()) {
            throw new ApiException("Please upload an image file (JPEG, PNG, WebP).", HttpStatus.BAD_REQUEST);
        }

        User user = getCurrentUser(authentication);

        // Basic Redis-backed abuse prevention: max 20 scans / hour
        if (!rateLimiterService.isAllowed(user.getId())) {
            throw new ApiException(
                    "Hourly scanning limit reached (max 20 scans/user/hour). Please try again later.",
                    HttpStatus.TOO_MANY_REQUESTS
            );
        }

        // Call FastAPI microservice (with Qualcomm QNN / CPU fallback)
        AiServiceClient.AiInferenceResult aiResult = aiServiceClient.predict(image);

        // Persist scan history in MySQL
        ScanHistory history = new ScanHistory();
        history.setUserId(user.getId());
        history.setImageName(image.getOriginalFilename() != null ? image.getOriginalFilename() : "uploaded_image.png");
        history.setFake(aiResult.isFake);
        history.setConfidence(aiResult.confidence);
        history.setExplanation(aiResult.explanation);
        history.setScannedAt(LocalDateTime.now());

        ScanHistory saved = scanHistoryRepository.save(history);

        ScanResponse response = new ScanResponse(
                saved.getId(),
                saved.getUserId(),
                saved.getImageName(),
                saved.isFake(),
                saved.getConfidence(),
                saved.getExplanation(),
                saved.getScannedAt(),
                aiResult.executionProvider,
                aiResult.snapdragonNpuReady,
                aiResult.inferenceTimeMs
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/history")
    public ResponseEntity<Page<ScanHistory>> getScanHistory(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication) {

        User user = getCurrentUser(authentication);
        Pageable pageable = PageRequest.of(Math.max(0, page), Math.min(50, Math.max(1, size)));
        Page<ScanHistory> historyPage = scanHistoryRepository.findByUserIdOrderByScannedAtDesc(user.getId(), pageable);

        return ResponseEntity.ok(historyPage);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ScanHistory> getScanById(
            @PathVariable Long id,
            Authentication authentication) {

        User user = getCurrentUser(authentication);
        ScanHistory scan = scanHistoryRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new ApiException("Scan not found with id: " + id, HttpStatus.NOT_FOUND));

        return ResponseEntity.ok(scan);
    }

    private User getCurrentUser(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw new ApiException("Unauthorized authentication context", HttpStatus.UNAUTHORIZED);
        }
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ApiException("User profile not found", HttpStatus.UNAUTHORIZED));
    }
}
