package com.ticketapp.ticketapp.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "events")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String description;
    private String venue;

    @Column(nullable = false)
    private LocalDateTime eventDate;

    private int totalSeats;
    private int availableSeats;

    private double basePrice;
    private double minPrice;
    private double maxPrice;

    private LocalDateTime createdAt = LocalDateTime.now();
}
