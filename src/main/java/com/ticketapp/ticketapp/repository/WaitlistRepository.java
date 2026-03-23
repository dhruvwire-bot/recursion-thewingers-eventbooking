package com.ticketapp.ticketapp.repository;

import com.ticketapp.ticketapp.model.WaitlistEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface WaitlistRepository extends JpaRepository<WaitlistEntry, Long> {
    List<WaitlistEntry> findByEventIdOrderByPositionAsc(Long eventId);
    Optional<WaitlistEntry> findFirstByEventIdOrderByPositionAsc(Long eventId);
    int countByEventId(Long eventId);
    Optional<WaitlistEntry> findByUserIdAndEventId(Long userId, Long eventId);
}