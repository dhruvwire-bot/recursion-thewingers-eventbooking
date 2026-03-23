package com.ticketapp.ticketapp.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.ticketapp.ticketapp.model.enums.SeatCategory;
import com.ticketapp.ticketapp.model.enums.SeatStatus;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "seats")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Seat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Event event;

    @Column(nullable = false)
    private String seatNumber;

    private String row;
    private int number;

    @Enumerated(EnumType.STRING)
    private SeatCategory category;

    @Enumerated(EnumType.STRING)
    private SeatStatus status = SeatStatus.AVAILABLE;

    private double price;
}