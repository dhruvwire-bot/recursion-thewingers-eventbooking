package com.ticketapp.ticketapp.controller;

import com.ticketapp.ticketapp.exception.ResourceNotFoundException;
import com.ticketapp.ticketapp.model.Event;
import com.ticketapp.ticketapp.model.User;
import com.ticketapp.ticketapp.model.WaitlistEntry;
import com.ticketapp.ticketapp.repository.EventRepository;
import com.ticketapp.ticketapp.repository.UserRepository;
import com.ticketapp.ticketapp.repository.WaitlistRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/waitlist")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class WaitlistController {

    private final WaitlistRepository waitlistRepository;
    private final UserRepository userRepository;
    private final EventRepository eventRepository;

    @PostMapping("/join/{eventId}")
    public ResponseEntity<Map<String, Object>> joinWaitlist(
            @PathVariable Long eventId,
            @AuthenticationPrincipal UserDetails userDetails) {

        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found"));

        // check already on waitlist
        if (waitlistRepository.findByUserIdAndEventId(
                user.getId(), eventId).isPresent()) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", "Already on waitlist for this event"));
        }

        int position = waitlistRepository.countByEventId(eventId) + 1;

        WaitlistEntry entry = WaitlistEntry.builder()
                .user(user)
                .event(event)
                .position(position)
                .build();

        waitlistRepository.save(entry);

        // calculate probability based on static no-show rates
        double noShowRate = 0.12; // 12% for general events
        double probability = Math.min(
                noShowRate * position * 100, 95);

        return ResponseEntity.ok(Map.of(
                "message", "Added to waitlist",
                "position", position,
                "estimatedProbability",
                Math.round(probability) + "% chance of getting a seat"
        ));
    }

    @GetMapping("/{eventId}")
    public ResponseEntity<?> getWaitlist(@PathVariable Long eventId) {
        return ResponseEntity.ok(
                waitlistRepository.findByEventIdOrderByPositionAsc(eventId));
    }

    @DeleteMapping("/leave/{eventId}")
    public ResponseEntity<Map<String, String>> leaveWaitlist(
            @PathVariable Long eventId,
            @AuthenticationPrincipal UserDetails userDetails) {

        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        waitlistRepository.findByUserIdAndEventId(user.getId(), eventId)
                .ifPresent(waitlistRepository::delete);

        return ResponseEntity.ok(Map.of("message", "Removed from waitlist"));
    }
}