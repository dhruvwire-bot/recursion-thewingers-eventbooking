package com.ticketapp.ticketapp.service;

import com.ticketapp.ticketapp.dto.request.CreateEventRequest;
import com.ticketapp.ticketapp.exception.ResourceNotFoundException;
import com.ticketapp.ticketapp.model.Event;
import com.ticketapp.ticketapp.model.Seat;
import com.ticketapp.ticketapp.model.enums.SeatCategory;
import com.ticketapp.ticketapp.model.enums.SeatStatus;
import com.ticketapp.ticketapp.repository.EventRepository;
import com.ticketapp.ticketapp.repository.SeatRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EventService {

    private final EventRepository eventRepository;
    private final SeatRepository seatRepository;

    @Transactional
    public Event createEvent(CreateEventRequest request) {
        Event event = Event.builder()
                .name(request.getName())
                .description(request.getDescription())
                .venue(request.getVenue())
                .eventDate(request.getEventDate())
                .totalSeats(request.getRows() * request.getCols())
                .availableSeats(request.getRows() * request.getCols())
                .basePrice(request.getBasePrice())
                .minPrice(request.getMinPrice())
                .maxPrice(request.getMaxPrice())
                .build();

        Event saved = eventRepository.save(event);

        // auto-generate seat grid
        List<Seat> seats = new ArrayList<>();
        for (int r = 0; r < request.getRows(); r++) {
            String rowLabel = String.valueOf((char) ('A' + r));
            for (int c = 1; c <= request.getCols(); c++) {
                // first 2 rows = VIP, last 2 = EARLY_BIRD, rest = GENERAL
                SeatCategory category;
                if (r < 2) category = SeatCategory.VIP;
                else if (r >= request.getRows() - 2) category = SeatCategory.EARLY_BIRD;
                else category = SeatCategory.GENERAL;

                double price = switch (category) {
                    case VIP -> request.getBasePrice() * 2;
                    case EARLY_BIRD -> request.getBasePrice() * 0.8;
                    default -> request.getBasePrice();
                };

                seats.add(Seat.builder()
                        .event(saved)
                        .seatNumber(rowLabel + c)
                        .row(rowLabel)
                        .number(c)
                        .category(category)
                        .status(SeatStatus.AVAILABLE)
                        .price(price)
                        .build());
            }
        }
        seatRepository.saveAll(seats);

        return saved;
    }

    public List<Event> getAllEvents() {
        return eventRepository.findAll();
    }

    public Event getEventById(Long id) {
        return eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found: " + id));
    }

    public List<Event> getAvailableEvents() {
        return eventRepository.findByAvailableSeatsGreaterThan(0);
    }
}