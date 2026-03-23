package com.ticketapp.ticketapp.controller;

import com.ticketapp.ticketapp.service.PricingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/pricing")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PricingController {

    private final PricingService pricingService;

    // get full pricing analysis for an event
    @GetMapping("/analysis/{eventId}")
    public ResponseEntity<Map<String, Object>> getAnalysis(
            @PathVariable Long eventId) {
        return ResponseEntity.ok(
                pricingService.getPricingAnalysis(eventId));
    }

    // manually trigger price update
    @PostMapping("/update/{eventId}")
    public ResponseEntity<Map<String, Object>> triggerUpdate(
            @PathVariable Long eventId) {
        return ResponseEntity.ok(
                pricingService.triggerPriceUpdate(eventId));
    }
}