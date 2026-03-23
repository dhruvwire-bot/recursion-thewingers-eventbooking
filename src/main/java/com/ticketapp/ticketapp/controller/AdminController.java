package com.ticketapp.ticketapp.controller;

import com.ticketapp.ticketapp.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AdminController {

    private final AdminService adminService;

    // overall platform stats
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getOverallStats() {
        return ResponseEntity.ok(adminService.getOverallStats());
    }

    // stats for all events
    @GetMapping("/events/stats")
    public ResponseEntity<List<Map<String, Object>>> getAllEventsStats() {
        return ResponseEntity.ok(adminService.getAllEventsStats());
    }

    // stats for one specific event
    @GetMapping("/events/{eventId}/stats")
    public ResponseEntity<Map<String, Object>> getEventStats(
            @PathVariable Long eventId) {
        return ResponseEntity.ok(adminService.getEventStats(eventId));
    }
}