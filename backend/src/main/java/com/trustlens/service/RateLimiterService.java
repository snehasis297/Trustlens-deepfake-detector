package com.trustlens.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

/**
 * Basic Redis-backed rate limiting service.
 * NOTE: This is a demonstration-level abuse-prevention rate limiter (e.g. max 20 scans/user/hour),
 * designed to protect on-device AI inference resources from denial-of-service spam in a demo
 * environment. In enterprise production, this would be augmented with distributed token-bucket
 * algorithms, IP-reputation checks, and WAF perimeter defenses.
 */
@Service
public class RateLimiterService {

    private static final Logger logger = LoggerFactory.getLogger(RateLimiterService.class);

    private final StringRedisTemplate redisTemplate;
    private final int maxScansPerHour;

    public RateLimiterService(
            @org.springframework.beans.factory.annotation.Autowired(required = false) StringRedisTemplate redisTemplate,
            @Value("${trustlens.rate-limit.max-scans-per-hour:20}") int maxScansPerHour) {
        this.redisTemplate = redisTemplate;
        this.maxScansPerHour = maxScansPerHour;
    }

    /**
     * Verifies if the user is within their hourly scanning budget.
     * @param userId The unique user ID
     * @return true if permitted, false if rate limit exceeded
     */
    public boolean isAllowed(Long userId) {
        if (redisTemplate == null) {
            return true;
        }

        String key = "ratelimit:scan:user:" + userId;

        try {
            Long currentCount = redisTemplate.opsForValue().increment(key);
            if (currentCount != null && currentCount == 1L) {
                // First request in the current hour window: establish 1 hour TTL
                redisTemplate.expire(key, Duration.ofHours(1));
            }

            if (currentCount != null && currentCount > maxScansPerHour) {
                logger.warn("User {} exceeded rate limit: {}/{} scans in window", userId, currentCount, maxScansPerHour);
                return false;
            }

            return true;
        } catch (Exception e) {
            // Fault-tolerant fallback: If Redis is temporarily unreachable or offline during local testing,
            // allow request to proceed so demo remains functional rather than blocking users.
            logger.warn("Redis connection unavailable for rate limiter ({}). Allowing request through in fallback mode.", e.getMessage());
            return true;
        }
    }

    public long getRemainingScans(Long userId) {
        String key = "ratelimit:scan:user:" + userId;
        try {
            String val = redisTemplate.opsForValue().get(key);
            if (val == null) {
                return maxScansPerHour;
            }
            long used = Long.parseLong(val);
            return Math.max(0, maxScansPerHour - used);
        } catch (Exception e) {
            return maxScansPerHour;
        }
    }
}
