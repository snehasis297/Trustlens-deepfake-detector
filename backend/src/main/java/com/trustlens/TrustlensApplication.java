package com.trustlens;

import com.trustlens.model.User;
import com.trustlens.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication
public class TrustlensApplication {

    public static void main(String[] args) {
        SpringApplication.run(TrustlensApplication.class, args);
    }

    @Bean
    public CommandLineRunner initDemoUser(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            String demoEmail = "analyst@trustlens.ai";
            if (!userRepository.existsByEmail(demoEmail)) {
                User demoUser = new User();
                demoUser.setName("Qualcomm AI Analyst");
                demoUser.setEmail(demoEmail);
                demoUser.setPasswordHash(passwordEncoder.encode("password123"));
                userRepository.save(demoUser);
                System.out.println("==================================================================");
                System.out.println(">>> TrustLens Demo Account Initialized: analyst@trustlens.ai <<<");
                System.out.println("==================================================================");
            }
        };
    }
}
