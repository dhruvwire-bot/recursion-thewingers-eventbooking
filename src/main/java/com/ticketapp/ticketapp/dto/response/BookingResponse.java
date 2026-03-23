package com.ticketapp.ticketapp.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class BookingResponse {
    private Long bookingId;
    private String seatNumber;
    private String eventName;
    private double amountPaid;
    private String status;
    private String qrToken;
    private String nftTokenId;
}