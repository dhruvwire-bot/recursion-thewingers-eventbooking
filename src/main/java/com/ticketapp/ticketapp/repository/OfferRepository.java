package com.ticketapp.ticketapp.repository;

import com.ticketapp.ticketapp.model.Offer;
import com.ticketapp.ticketapp.model.enums.OfferStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface OfferRepository extends JpaRepository<Offer, Long> {
    List<Offer> findByListingId(Long listingId);
    List<Offer> findByBuyerId(Long buyerId);
    List<Offer> findByListingIdAndStatus(Long listingId, OfferStatus status);
}