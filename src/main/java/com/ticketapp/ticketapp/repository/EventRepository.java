package com.ticketapp.ticketapp.repository;

import com.ticketapp.ticketapp.model.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface EventRepository extends JpaRepository<Event, Long> {
    List<Event> findByAvailableSeatsGreaterThan(int seats);
}