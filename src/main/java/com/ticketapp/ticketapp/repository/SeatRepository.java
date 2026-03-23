package com.ticketapp.ticketapp.repository;

import com.ticketapp.ticketapp.model.Seat;
import com.ticketapp.ticketapp.model.enums.SeatStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface SeatRepository extends JpaRepository<Seat, Long> {
    List<Seat> findByEventId(Long eventId);
    List<Seat> findByEventIdAndStatus(Long eventId, SeatStatus status);

    @Query("SELECT COUNT(s) FROM Seat s WHERE s.event.id = :eventId AND s.status = 'AVAILABLE'")
    int countAvailableByEventId(@Param("eventId") Long eventId);
}