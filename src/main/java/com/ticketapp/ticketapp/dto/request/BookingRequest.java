package com.ticketapp.ticketapp.dto.request;

import lombok.Data;

@Data
public class BookingRequest {
    private Long seatId;
    private Long eventId;
}