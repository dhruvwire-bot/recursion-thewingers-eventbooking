package com.ticketapp.ticketapp.service;

import com.ticketapp.ticketapp.exception.ResourceNotFoundException;
import com.ticketapp.ticketapp.model.*;
import com.ticketapp.ticketapp.model.enums.*;
import com.ticketapp.ticketapp.repository.*;
import com.ticketapp.ticketapp.websocket.SeatStateHandler;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class OfferService {

    private final OfferRepository offerRepository;
    private final ResaleListingRepository resaleListingRepository;
    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;
    private final SimpMessagingTemplate messagingTemplate;

    // buyer makes an offer
    @Transactional
    public Offer makeOffer(Long listingId,
                           double offeredPrice,
                           String buyerEmail) {

        ResaleListing listing = resaleListingRepository.findById(listingId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Listing not found"));

        if (listing.getStatus() != ResaleStatus.ACTIVE) {
            throw new RuntimeException("This listing is no longer active");
        }

        User buyer = userRepository.findByEmail(buyerEmail)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));

        // cant offer on your own listing
        if (listing.getSeller().getEmail().equals(buyerEmail)) {
            throw new RuntimeException("You cannot make an offer on your own listing");
        }

        // offer must be > 0
        if (offeredPrice <= 0) {
            throw new RuntimeException("Offer price must be greater than 0");
        }

        // offer cant exceed max allowed resale price
        if (offeredPrice > listing.getMaxAllowedPrice()) {
            throw new RuntimeException(
                    "Offer cannot exceed max allowed price ₹"
                            + listing.getMaxAllowedPrice());
        }

        // check if buyer already has a pending offer on this listing
        List<Offer> existing = offerRepository
                .findByListingIdAndStatus(listingId, OfferStatus.PENDING);
        boolean alreadyOffered = existing.stream()
                .anyMatch(o -> o.getBuyer().getEmail().equals(buyerEmail));

        if (alreadyOffered) {
            throw new RuntimeException(
                    "You already have a pending offer on this listing");
        }

        Offer offer = Offer.builder()
                .listing(listing)
                .buyer(buyer)
                .offeredPrice(offeredPrice)
                .status(OfferStatus.PENDING)
                .build();

        Offer saved = offerRepository.save(offer);

        // notify seller via WebSocket
        notifySeller(listing.getSeller().getEmail(),
                "New offer of ₹" + offeredPrice + " received on your listing",
                saved);

        log.info("Offer made: buyer={} listing={} price={}",
                buyerEmail, listingId, offeredPrice);

        return saved;
    }

    // seller accepts an offer
    @Transactional
    public Booking acceptOffer(Long offerId, String sellerEmail) {
        Offer offer = offerRepository.findById(offerId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Offer not found"));

        ResaleListing listing = offer.getListing();

        if (!listing.getSeller().getEmail().equals(sellerEmail)) {
            throw new RuntimeException("Not authorized to accept this offer");
        }

        if (offer.getStatus() != OfferStatus.PENDING
                && offer.getStatus() != OfferStatus.COUNTERED) {
            throw new RuntimeException("This offer is no longer active");
        }

        double finalPrice = offer.getCounterPrice() > 0
                ? offer.getCounterPrice()
                : offer.getOfferedPrice();

        // transfer booking to buyer
        Booking booking = listing.getBooking();
        booking.setUser(offer.getBuyer());
        booking.setAmountPaid(finalPrice);
        booking.setResold(false);
        bookingRepository.save(booking);

        // close listing
        listing.setStatus(ResaleStatus.SOLD);
        resaleListingRepository.save(listing);

        // mark this offer accepted
        offer.setStatus(OfferStatus.ACCEPTED);
        offer.setUpdatedAt(LocalDateTime.now());
        offerRepository.save(offer);

        // reject all other pending offers on same listing
        offerRepository.findByListingIdAndStatus(
                        listing.getId(), OfferStatus.PENDING)
                .stream()
                .filter(o -> !o.getId().equals(offerId))
                .forEach(o -> {
                    o.setStatus(OfferStatus.REJECTED);
                    o.setUpdatedAt(LocalDateTime.now());
                    offerRepository.save(o);
                    notifyBuyer(o.getBuyer().getEmail(),
                            "Your offer was rejected — ticket sold to another buyer", o);
                });

        // notify buyer their offer was accepted
        notifyBuyer(offer.getBuyer().getEmail(),
                "Your offer of ₹" + finalPrice + " was accepted! Ticket is yours.", offer);

        log.info("Offer accepted: offerId={} finalPrice={}", offerId, finalPrice);

        return booking;
    }

    // seller rejects an offer
    @Transactional
    public Offer rejectOffer(Long offerId, String sellerEmail) {
        Offer offer = offerRepository.findById(offerId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Offer not found"));

        if (!offer.getListing().getSeller().getEmail().equals(sellerEmail)) {
            throw new RuntimeException("Not authorized to reject this offer");
        }

        offer.setStatus(OfferStatus.REJECTED);
        offer.setUpdatedAt(LocalDateTime.now());
        Offer saved = offerRepository.save(offer);

        notifyBuyer(offer.getBuyer().getEmail(),
                "Your offer of ₹" + offer.getOfferedPrice() + " was rejected", offer);

        return saved;
    }

    // seller counters with a different price
    @Transactional
    public Offer counterOffer(Long offerId,
                              double counterPrice,
                              String sellerEmail) {

        Offer offer = offerRepository.findById(offerId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Offer not found"));

        ResaleListing listing = offer.getListing();

        if (!listing.getSeller().getEmail().equals(sellerEmail)) {
            throw new RuntimeException("Not authorized to counter this offer");
        }

        if (offer.getStatus() != OfferStatus.PENDING) {
            throw new RuntimeException("Can only counter a pending offer");
        }

        if (counterPrice > listing.getMaxAllowedPrice()) {
            throw new RuntimeException(
                    "Counter price cannot exceed max allowed ₹"
                            + listing.getMaxAllowedPrice());
        }

        offer.setCounterPrice(counterPrice);
        offer.setStatus(OfferStatus.COUNTERED);
        offer.setUpdatedAt(LocalDateTime.now());
        Offer saved = offerRepository.save(offer);

        // notify buyer of counter
        notifyBuyer(offer.getBuyer().getEmail(),
                "Seller countered with ₹" + counterPrice
                        + ". Accept or make a new offer.", offer);

        log.info("Counter offer: offerId={} counterPrice={}", offerId, counterPrice);

        return saved;
    }

    // buyer accepts a counter offer
    @Transactional
    public Booking acceptCounter(Long offerId, String buyerEmail) {
        Offer offer = offerRepository.findById(offerId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Offer not found"));

        if (!offer.getBuyer().getEmail().equals(buyerEmail)) {
            throw new RuntimeException("Not authorized");
        }

        if (offer.getStatus() != OfferStatus.COUNTERED) {
            throw new RuntimeException("No counter offer to accept");
        }

        // reuse acceptOffer logic from seller side
        return acceptOffer(offerId, offer.getListing().getSeller().getEmail());
    }

    // get all offers on a listing (for seller)
    public List<Offer> getOffersForListing(Long listingId, String sellerEmail) {
        ResaleListing listing = resaleListingRepository.findById(listingId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Listing not found"));

        if (!listing.getSeller().getEmail().equals(sellerEmail)) {
            throw new RuntimeException("Not authorized to view these offers");
        }

        return offerRepository.findByListingId(listingId);
    }

    // get my offers as buyer
    public List<Offer> getMyOffers(String buyerEmail) {
        User buyer = userRepository.findByEmail(buyerEmail)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));
        return offerRepository.findByBuyerId(buyer.getId());
    }

    private void notifySeller(String sellerEmail, String message, Offer offer) {
        messagingTemplate.convertAndSendToUser(
                sellerEmail,
                "/queue/notifications",
                java.util.Map.of(
                        "message", message,
                        "offerId", offer.getId(),
                        "price", offer.getOfferedPrice()
                )
        );
    }

    private void notifyBuyer(String buyerEmail, String message, Offer offer) {
        messagingTemplate.convertAndSendToUser(
                buyerEmail,
                "/queue/notifications",
                java.util.Map.of(
                        "message", message,
                        "offerId", offer.getId(),
                        "status", offer.getStatus().name()
                )
        );
    }
}