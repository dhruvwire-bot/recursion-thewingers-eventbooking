package com.ticketapp.ticketapp.controller;

import com.ticketapp.ticketapp.service.ConcurrencyTestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/test")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ConcurrencyTestController {

    private final ConcurrencyTestService concurrencyTestService;

    @PostMapping("/concurrency")
    public ResponseEntity<Map<String, Object>> runTest(
            @RequestBody Map<String, Object> body) {

        Long seatId = Long.valueOf(body.get("seatId").toString());
        Long eventId = Long.valueOf(body.get("eventId").toString());
        int threads = body.containsKey("threads")
                ? Integer.parseInt(body.get("threads").toString())
                : 50;

        return ResponseEntity.ok(
                concurrencyTestService.runStressTest(seatId, eventId, threads));
    }
}