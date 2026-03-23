package com.ticketapp.ticketapp.service;

import com.ticketapp.ticketapp.dto.response.SeatResponse;
import com.ticketapp.ticketapp.model.enums.SeatStatus;
import com.ticketapp.ticketapp.repository.SeatRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SeatService {

    private final SeatRepository seatRepository;

    public List<SeatResponse> getSeatsByEvent(Long eventId) {
        return seatRepository.findByEventId(eventId)
                .stream()
                .map(seat -> SeatResponse.builder()
                        .seatId(seat.getId())
                        .seatNumber(seat.getSeatNumber())
                        .row(seat.getRow())
                        .number(seat.getNumber())
                        .category(seat.getCategory().name())
                        .status(seat.getStatus().name())
                        .price(seat.getPrice())
                        .build())
                .toList();
    }
}