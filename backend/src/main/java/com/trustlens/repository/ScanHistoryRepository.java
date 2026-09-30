package com.trustlens.repository;

import com.trustlens.model.ScanHistory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ScanHistoryRepository extends JpaRepository<ScanHistory, Long> {
    Page<ScanHistory> findByUserIdOrderByScannedAtDesc(Long userId, Pageable pageable);
    Optional<ScanHistory> findByIdAndUserId(Long id, Long userId);
    long countByUserId(Long userId);
}
