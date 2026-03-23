package com.ticketapp.ticketapp.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.ticketapp.ticketapp.model.enums.ResaleStatus;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "resale_listings")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class ResaleListing {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "booking_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Booking booking;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "seller_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "password"})
    private User seller;

    @Column(nullable = false)
    private double originalPrice;

    @Column(nullable = false)
    private double resalePrice;

    private double maxAllowedPrice;

    @Enumerated(EnumType.STRING)
    private ResaleStatus status = ResaleStatus.ACTIVE;

    private LocalDateTime listedAt = LocalDateTime.now();
}