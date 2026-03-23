package com.ticketapp.ticketapp.service;

import com.ticketapp.ticketapp.exception.ResourceNotFoundException;
import com.ticketapp.ticketapp.model.*;
import com.ticketapp.ticketapp.model.enums.*;
import com.ticketapp.ticketapp.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ResaleService {

    private final ResaleListingRepository resaleListingRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;

    // list a ticket for resale
    @Transactional
    public ResaleListing listForResale(Long bookingId,
                                       double resalePrice,
                                       String sellerEmail) {

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Booking not found"));

        // only owner can list
        if (!booking.getUser().getEmail().equals(sellerEmail)) {
            throw new RuntimeException("You can only resell your own tickets");
        }

        // only confirmed bookings can be resold
        if (booking.getStatus() != BookingStatus.CONFIRMED) {
            throw new RuntimeException("Only confirmed bookings can be resold");
        }

        // check not already listed
        boolean alreadyListed = resaleListingRepository
                .findBySellerIdAndStatus(
                        booking.getUser().getId(), ResaleStatus.ACTIVE)
                .stream()
                .anyMatch(l -> l.getBooking().getId().equals(bookingId));

        if (alreadyListed) {
            throw new RuntimeException("This ticket is already listed for resale");
        }

        double originalPrice = booking.getAmountPaid();
        double maxAllowed = originalPrice * 2; // 2x price cap

        if (resalePrice > maxAllowed) {
            throw new RuntimeException(
                    "Resale price cannot exceed 2x original price (max: ₹"
                            + maxAllowed + ")");
        }

        if (resalePrice <= 0) {
            throw new RuntimeException("Resale price must be greater than 0");
        }

        User seller = userRepository.findByEmail(sellerEmail)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));

        ResaleListing listing = ResaleListing.builder()
                .booking(booking)
                .seller(seller)
                .originalPrice(originalPrice)
                .resalePrice(resalePrice)
                .maxAllowedPrice(maxAllowed)
                .status(ResaleStatus.ACTIVE)
                .build();

        booking.setResold(true);
        bookingRepository.save(booking);

        ResaleListing saved = resaleListingRepository.save(listing);
        log.info("Ticket listed for resale: bookingId={} price={}",
                bookingId, resalePrice);

        return saved;
    }

    // get all active listings
    public List<ResaleListing> getActiveListings() {
        return resaleListingRepository.findByStatus(ResaleStatus.ACTIVE);
    }

    // get active listings for a specific event
    public List<ResaleListing> getListingsByEvent(Long eventId) {
        return resaleListingRepository.findByBookingEventId(eventId)
                .stream()
                .filter(l -> l.getStatus() == ResaleStatus.ACTIVE)
                .toList();
    }

    // get my listings
    public List<ResaleListing> getMyListings(String sellerEmail) {
        User seller = userRepository.findByEmail(sellerEmail)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));
        return resaleListingRepository
                .findBySellerIdAndStatus(seller.getId(), ResaleStatus.ACTIVE);
    }

    // cancel a listing
    @Transactional
    public void cancelListing(Long listingId, String sellerEmail) {
        ResaleListing listing = resaleListingRepository.findById(listingId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Listing not found"));

        if (!listing.getSeller().getEmail().equals(sellerEmail)) {
            throw new RuntimeException("Not authorized to cancel this listing");
        }

        listing.setStatus(ResaleStatus.CANCELLED);
        listing.getBooking().setResold(false);
        resaleListingRepository.save(listing);
        bookingRepository.save(listing.getBooking());
    }

    // direct buy without negotiation
    @Transactional
    public Booking buyDirectly(Long listingId, String buyerEmail) {
        ResaleListing listing = resaleListingRepository.findById(listingId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Listing not found"));

        if (listing.getStatus() != ResaleStatus.ACTIVE) {
            throw new RuntimeException("This listing is no longer available");
        }

        if (listing.getSeller().getEmail().equals(buyerEmail)) {
            throw new RuntimeException("You cannot buy your own listing");
        }

        User buyer = userRepository.findByEmail(buyerEmail)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));

        // transfer booking to buyer
        Booking originalBooking = listing.getBooking();
        originalBooking.setUser(buyer);
        originalBooking.setAmountPaid(listing.getResalePrice());
        originalBooking.setResold(false);
        bookingRepository.save(originalBooking);

        // close the listing
        listing.setStatus(ResaleStatus.SOLD);
        resaleListingRepository.save(listing);

        log.info("Direct resale purchase: buyer={} listing={}",
                buyerEmail, listingId);

        return originalBooking;
    }
}