package com.ticketapp.ticketapp.controller;

import com.ticketapp.ticketapp.dto.request.BookingRequest;
import com.ticketapp.ticketapp.dto.response.BookingResponse;
import com.ticketapp.ticketapp.model.Booking;
import com.ticketapp.ticketapp.service.BookingService;
import com.ticketapp.ticketapp.service.NFTService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class BookingController {

    private final BookingService bookingService;
    private final NFTService nftService;

    @PostMapping
    public ResponseEntity<BookingResponse> book(
            @RequestBody BookingRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(
                bookingService.bookSeat(request, userDetails.getUsername()));
    }

    @PostMapping("/hold/{seatId}")
    public ResponseEntity<Map<String, String>> holdSeat(
            @PathVariable Long seatId,
            @AuthenticationPrincipal UserDetails userDetails) {
        bookingService.holdSeat(seatId, userDetails.getUsername());
        return ResponseEntity.ok(Map.of(
                "message", "Seat held for 8 minutes",
                "seatId", seatId.toString()
        ));
    }

    @DeleteMapping("/{bookingId}")
    public ResponseEntity<Map<String, String>> cancel(
            @PathVariable Long bookingId,
            @AuthenticationPrincipal UserDetails userDetails) {
        bookingService.cancelBooking(bookingId, userDetails.getUsername());
        return ResponseEntity.ok(Map.of("message", "Booking cancelled"));
    }

    @GetMapping("/my")
    public ResponseEntity<List<Booking>> myBookings(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(
                bookingService.getUserBookings(userDetails.getUsername()));
    }

    @GetMapping("/verify/{qrToken}")
    public ResponseEntity<Map<String, Object>> verifyQr(
            @PathVariable String qrToken) {
        boolean valid = bookingService.verifyQrToken(qrToken);
        return ResponseEntity.ok(Map.of(
                "valid", valid,
                "message", valid ? "Valid ticket" : "Invalid or fake ticket"
        ));
    }

    // NFT on-chain verification
    @GetMapping("/verify/nft/{tokenId}")
    public ResponseEntity<Map<String, Object>> verifyNft(
            @PathVariable String tokenId,
            @RequestParam String walletAddress) {
        return ResponseEntity.ok(
                nftService.verifyOnChain(tokenId, walletAddress));
    }

    // mark ticket used on-chain at venue entry
    @PostMapping("/use/nft/{tokenId}")
    public ResponseEntity<Map<String, Object>> useNft(
            @PathVariable String tokenId) {
        return ResponseEntity.ok(
                nftService.markTicketUsed(tokenId));
    }
}