package com.trustlens.service;

import com.trustlens.exception.ApiException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@Service
public class AiServiceClient {

    private static final Logger logger = LoggerFactory.getLogger(AiServiceClient.class);

    private final RestTemplate restTemplate;
    private final String aiServiceUrl;

    public AiServiceClient(
            @Value("${trustlens.ai-service.url:http://localhost:8000}") String aiServiceUrl) {
        this.restTemplate = new RestTemplate();
        this.aiServiceUrl = aiServiceUrl.replaceAll("/+$", "");
    }

    public static class AiInferenceResult {
        public boolean isFake;
        public double confidence;
        public String explanation;
        public String executionProvider;
        public boolean snapdragonNpuReady;
        public double inferenceTimeMs;

        public AiInferenceResult() {
        }

        public AiInferenceResult(boolean isFake, double confidence, String explanation,
                                 String executionProvider, boolean snapdragonNpuReady, double inferenceTimeMs) {
            this.isFake = isFake;
            this.confidence = confidence;
            this.explanation = explanation;
            this.executionProvider = executionProvider;
            this.snapdragonNpuReady = snapdragonNpuReady;
            this.inferenceTimeMs = inferenceTimeMs;
        }
    }

    /**
     * Forwards an uploaded image to the FastAPI AI service's /predict endpoint.
     */
    public AiInferenceResult predict(MultipartFile file) {
        String predictUrl = aiServiceUrl + "/predict";
        logger.info("Forwarding image '{}' to AI inference service at {}", file.getOriginalFilename(), predictUrl);

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            // Wrap multipart file bytes with explicit filename
            ByteArrayResource fileResource = new ByteArrayResource(file.getBytes()) {
                @Override
                public String getFilename() {
                    return file.getOriginalFilename() != null ? file.getOriginalFilename() : "image.jpg";
                }
            };

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("file", fileResource);

            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(predictUrl, requestEntity, Map.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map responseBody = response.getBody();

                boolean isFake = Boolean.TRUE.equals(responseBody.get("is_fake"));
                double confidence = responseBody.get("confidence") instanceof Number
                        ? ((Number) responseBody.get("confidence")).doubleValue() : 0.85;
                String explanation = responseBody.get("explanation") != null
                        ? responseBody.get("explanation").toString() : "Analysis completed.";
                String executionProvider = responseBody.get("execution_provider") != null
                        ? responseBody.get("execution_provider").toString() : "CPUExecutionProvider";
                boolean snapdragonNpuReady = Boolean.TRUE.equals(responseBody.get("snapdragon_npu_ready"));
                double inferenceTimeMs = responseBody.get("inference_time_ms") instanceof Number
                        ? ((Number) responseBody.get("inference_time_ms")).doubleValue() : 15.0;

                return new AiInferenceResult(isFake, confidence, explanation, executionProvider, snapdragonNpuReady, inferenceTimeMs);
            } else {
                throw new ApiException("AI Inference service returned error status: " + response.getStatusCode(), HttpStatus.BAD_GATEWAY);
            }
        } catch (Exception e) {
            logger.error("Failed to communicate with AI inference service: {}", e.getMessage());
            throw new ApiException("AI Inference microservice is currently unreachable at " + aiServiceUrl + " (" + e.getMessage() + ")", HttpStatus.SERVICE_UNAVAILABLE);
        }
    }
}
