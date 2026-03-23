package com.ticketapp.ticketapp.dto.request;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class CreateEventRequest {
    private String name;
    private String description;
    private String venue;
    private LocalDateTime eventDate;
    private int totalSeats;
    private double basePrice;
    private double minPrice;
    private double maxPrice;
    // rows x cols for seat grid e.g. 10x10
    private int rows;
    private int cols;
}