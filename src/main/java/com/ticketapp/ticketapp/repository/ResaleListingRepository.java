package com.ticketapp.ticketapp.repository;

import com.ticketapp.ticketapp.model.ResaleListing;
import com.ticketapp.ticketapp.model.enums.ResaleStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ResaleListingRepository extends JpaRepository<ResaleListing, Long> {
    List<ResaleListing> findByStatus(ResaleStatus status);
    List<ResaleListing> findBySellerIdAndStatus(Long sellerId, ResaleStatus status);
    List<ResaleListing> findByBookingEventId(Long eventId);
}