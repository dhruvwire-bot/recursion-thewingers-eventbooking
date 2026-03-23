package com.ticketapp.ticketapp.controller;

import com.ticketapp.ticketapp.dto.request.CreateEventRequest;
import com.ticketapp.ticketapp.dto.response.SeatResponse;
import com.ticketapp.ticketapp.model.Event;
import com.ticketapp.ticketapp.service.EventService;
import com.ticketapp.ticketapp.service.SeatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class EventController {

    private final EventService eventService;
    private final SeatService seatService;

    @PostMapping
    public ResponseEntity<Event> createEvent(@RequestBody CreateEventRequest request) {
        return ResponseEntity.ok(eventService.createEvent(request));
    }

    @GetMapping
    public ResponseEntity<List<Event>> getAllEvents() {
        return ResponseEntity.ok(eventService.getAllEvents());
    }

    @GetMapping("/available")
    public ResponseEntity<List<Event>> getAvailableEvents() {
        return ResponseEntity.ok(eventService.getAvailableEvents());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Event> getEvent(@PathVariable Long id) {
        return ResponseEntity.ok(eventService.getEventById(id));
    }

    @GetMapping("/{id}/seats")
    public ResponseEntity<List<SeatResponse>> getSeats(@PathVariable Long id) {
        return ResponseEntity.ok(seatService.getSeatsByEvent(id));
    }
}