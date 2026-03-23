package com.ticketapp.ticketapp.controller;

import com.ticketapp.ticketapp.model.Booking;
import com.ticketapp.ticketapp.model.ResaleListing;
import com.ticketapp.ticketapp.service.ResaleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/resale")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ResaleController {

    private final ResaleService resaleService;

    // list a ticket for resale
    @PostMapping("/list")
    public ResponseEntity<ResaleListing> listTicket(
            @RequestBody Map<String, Object> body,
            @AuthenticationPrincipal UserDetails userDetails) {

        Long bookingId = Long.valueOf(body.get("bookingId").toString());
        double resalePrice = Double.parseDouble(body.get("resalePrice").toString());

        return ResponseEntity.ok(
                resaleService.listForResale(
                        bookingId, resalePrice, userDetails.getUsername()));
    }

    // get all active listings
    @GetMapping
    public ResponseEntity<List<ResaleListing>> getAllListings() {
        return ResponseEntity.ok(resaleService.getActiveListings());
    }

    // get listings for a specific event
    @GetMapping("/event/{eventId}")
    public ResponseEntity<List<ResaleListing>> getListingsByEvent(
            @PathVariable Long eventId) {
        return ResponseEntity.ok(resaleService.getListingsByEvent(eventId));
    }

    // get my listings
    @GetMapping("/my")
    public ResponseEntity<List<ResaleListing>> myListings(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(
                resaleService.getMyListings(userDetails.getUsername()));
    }

    // cancel my listing
    @DeleteMapping("/{listingId}")
    public ResponseEntity<Map<String, String>> cancelListing(
            @PathVariable Long listingId,
            @AuthenticationPrincipal UserDetails userDetails) {
        resaleService.cancelListing(listingId, userDetails.getUsername());
        return ResponseEntity.ok(Map.of("message", "Listing cancelled"));
    }

    // direct buy
    @PostMapping("/buy/{listingId}")
    public ResponseEntity<Booking> buyDirectly(
            @PathVariable Long listingId,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(
                resaleService.buyDirectly(listingId, userDetails.getUsername()));
    }
}
