package com.ticketapp.ticketapp.controller;

import com.ticketapp.ticketapp.model.Booking;
import com.ticketapp.ticketapp.model.Offer;
import com.ticketapp.ticketapp.service.OfferService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/offers")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class OfferController {

    private final OfferService offerService;

    // buyer makes an offer on a listing
    @PostMapping("/make")
    public ResponseEntity<Offer> makeOffer(
            @RequestBody Map<String, Object> body,
            @AuthenticationPrincipal UserDetails userDetails) {

        Long listingId = Long.valueOf(body.get("listingId").toString());
        double price = Double.parseDouble(body.get("offeredPrice").toString());

        return ResponseEntity.ok(
                offerService.makeOffer(listingId, price,
                        userDetails.getUsername()));
    }

    // seller accepts an offer
    @PostMapping("/{offerId}/accept")
    public ResponseEntity<Booking> acceptOffer(
            @PathVariable Long offerId,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(
                offerService.acceptOffer(offerId, userDetails.getUsername()));
    }

    // seller rejects an offer
    @PostMapping("/{offerId}/reject")
    public ResponseEntity<Offer> rejectOffer(
            @PathVariable Long offerId,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(
                offerService.rejectOffer(offerId, userDetails.getUsername()));
    }

    // seller counters with new price
    @PostMapping("/{offerId}/counter")
    public ResponseEntity<Offer> counterOffer(
            @PathVariable Long offerId,
            @RequestBody Map<String, Object> body,
            @AuthenticationPrincipal UserDetails userDetails) {

        double counterPrice = Double.parseDouble(
                body.get("counterPrice").toString());

        return ResponseEntity.ok(
                offerService.counterOffer(offerId, counterPrice,
                        userDetails.getUsername()));
    }

    // buyer accepts a counter offer
    @PostMapping("/{offerId}/accept-counter")
    public ResponseEntity<Booking> acceptCounter(
            @PathVariable Long offerId,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(
                offerService.acceptCounter(offerId, userDetails.getUsername()));
    }

    // seller views all offers on their listing
    @GetMapping("/listing/{listingId}")
    public ResponseEntity<List<Offer>> getOffersForListing(
            @PathVariable Long listingId,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(
                offerService.getOffersForListing(listingId,
                        userDetails.getUsername()));
    }

    // buyer views their own offers
    @GetMapping("/my")
    public ResponseEntity<List<Offer>> myOffers(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(
                offerService.getMyOffers(userDetails.getUsername()));
    }
}
