package com.ticketapp.ticketapp.service;

import com.ticketapp.ticketapp.model.Booking;
import com.ticketapp.ticketapp.model.enums.BookingStatus;
import com.ticketapp.ticketapp.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final BookingRepository bookingRepository;
    private final EventRepository eventRepository;
    private final UserRepository userRepository;
    private final ResaleListingRepository resaleListingRepository;

    public Map<String, Object> getOverallStats() {
        List<Booking> allBookings = bookingRepository.findAll();

        long totalBookings = allBookings.stream()
                .filter(b -> b.getStatus() == BookingStatus.CONFIRMED)
                .count();

        long cancelledBookings = allBookings.stream()
                .filter(b -> b.getStatus() == BookingStatus.CANCELLED)
                .count();

        double totalRevenue = allBookings.stream()
                .filter(b -> b.getStatus() == BookingStatus.CONFIRMED)
                .mapToDouble(Booking::getAmountPaid)
                .sum();

        long totalEvents = eventRepository.count();
        long totalUsers = userRepository.count();
        long activeResaleListings = resaleListingRepository
                .findByStatus(
                        com.ticketapp.ticketapp.model.enums.ResaleStatus.ACTIVE)
                .size();

        long totalSeatsAcrossEvents = eventRepository.findAll()
                .stream()
                .mapToLong(e -> e.getTotalSeats())
                .sum();

        long soldSeats = totalBookings;
        long unsoldSeats = totalSeatsAcrossEvents - soldSeats;

        return Map.of(
                "totalBookings", totalBookings,
                "cancelledBookings", cancelledBookings,
                "totalRevenue", totalRevenue,
                "totalEvents", totalEvents,
                "totalUsers", totalUsers,
                "activeResaleListings", activeResaleListings,
                "totalSeats", totalSeatsAcrossEvents,
                "soldSeats", soldSeats,
                "unsoldSeats", unsoldSeats,
                "occupancyRate", totalSeatsAcrossEvents > 0
                        ? Math.round((soldSeats * 100.0) / totalSeatsAcrossEvents) + "%"
                        : "0%"
        );
    }

    public Map<String, Object> getEventStats(Long eventId) {
        List<Booking> eventBookings = bookingRepository.findByEventId(eventId);

        long confirmed = eventBookings.stream()
                .filter(b -> b.getStatus() == BookingStatus.CONFIRMED)
                .count();

        long cancelled = eventBookings.stream()
                .filter(b -> b.getStatus() == BookingStatus.CANCELLED)
                .count();

        double revenue = eventBookings.stream()
                .filter(b -> b.getStatus() == BookingStatus.CONFIRMED)
                .mapToDouble(Booking::getAmountPaid)
                .sum();

        // revenue by seat category
        Map<String, Double> revenueByCategory = eventBookings.stream()
                .filter(b -> b.getStatus() == BookingStatus.CONFIRMED)
                .collect(Collectors.groupingBy(
                        b -> b.getSeat().getCategory().name(),
                        Collectors.summingDouble(Booking::getAmountPaid)
                ));

        // bookings by hour (for trend chart)
        Map<Integer, Long> bookingsByHour = eventBookings.stream()
                .filter(b -> b.getBookedAt() != null)
                .collect(Collectors.groupingBy(
                        b -> b.getBookedAt().getHour(),
                        Collectors.counting()
                ));

        var event = eventRepository.findById(eventId).orElseThrow();

        return Map.of(
                "eventName", event.getName(),
                "totalSeats", event.getTotalSeats(),
                "availableSeats", event.getAvailableSeats(),
                "confirmedBookings", confirmed,
                "cancelledBookings", cancelled,
                "revenue", revenue,
                "revenueByCategory", revenueByCategory,
                "bookingsByHour", bookingsByHour,
                "fillRate", Math.round(
                        (confirmed * 100.0) / event.getTotalSeats()) + "%"
        );
    }

    public List<Map<String, Object>> getAllEventsStats() {
        return eventRepository.findAll().stream().map(event -> {
            List<Booking> bookings = bookingRepository.findByEventId(event.getId());
            long confirmed = bookings.stream()
                    .filter(b -> b.getStatus() == BookingStatus.CONFIRMED)
                    .count();
            double revenue = bookings.stream()
                    .filter(b -> b.getStatus() == BookingStatus.CONFIRMED)
                    .mapToDouble(Booking::getAmountPaid)
                    .sum();

            Map<String, Object> stats = new LinkedHashMap<>();
            stats.put("eventId", event.getId());
            stats.put("eventName", event.getName());
            stats.put("venue", event.getVenue());
            stats.put("eventDate", event.getEventDate());
            stats.put("totalSeats", event.getTotalSeats());
            stats.put("soldSeats", confirmed);
            stats.put("availableSeats", event.getAvailableSeats());
            stats.put("revenue", revenue);
            stats.put("fillRate",
                    Math.round((confirmed * 100.0) / event.getTotalSeats()) + "%");
            return stats;
        }).toList();
    }
}