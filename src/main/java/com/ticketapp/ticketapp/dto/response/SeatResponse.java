package com.ticketapp.ticketapp.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SeatResponse {
    private Long seatId;
    private String seatNumber;
    private String row;
    private int number;
    private String category;
    private String status;
    private double price;
}