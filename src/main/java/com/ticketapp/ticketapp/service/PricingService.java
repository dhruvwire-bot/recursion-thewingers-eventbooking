package com.ticketapp.ticketapp.service;

import com.ticketapp.ticketapp.model.Event;
import com.ticketapp.ticketapp.repository.EventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class PricingService {

    private final EventRepository eventRepository;

    // runs every 30 minutes automatically
    @Scheduled(fixedRate = 1800000)
    @Transactional
    public void updateAllEventPrices() {
        eventRepository.findAll().forEach(event -> {
            double newPrice = calculatePrice(event);
            event.setBasePrice(newPrice);
            eventRepository.save(event);
            log.info("Price updated: event={} newPrice={}",
                    event.getName(), newPrice);
        });
    }

    // calculate price for one event
    public double calculatePrice(Event event) {
        double currentPrice = event.getBasePrice();
        double minPrice = event.getMinPrice();
        double maxPrice = event.getMaxPrice();

        // fill rate — how full is the event
        double fillRate = 0;
        if (event.getTotalSeats() > 0) {
            int soldSeats = event.getTotalSeats() - event.getAvailableSeats();
            fillRate = (double) soldSeats / event.getTotalSeats();
        }

        // days until event
        long daysUntilEvent = ChronoUnit.DAYS.between(
                LocalDateTime.now(), event.getEventDate());

        double newPrice = currentPrice;

        // RULE 1 — high demand, price goes up
        // above 80% full → increase 15%
        if (fillRate >= 0.80) {
            newPrice = currentPrice * 1.15;
            log.info("Event {} is {}% full — price UP 15%",
                    event.getName(), Math.round(fillRate * 100));
        }
        // above 60% full → increase 8%
        else if (fillRate >= 0.60) {
            newPrice = currentPrice * 1.08;
        }
        // above 40% full → increase 3%
        else if (fillRate >= 0.40) {
            newPrice = currentPrice * 1.03;
        }

        // RULE 2 — low demand close to event, flash discount
        // under 30% sold with less than 3 days to go → drop 20%
        if (fillRate < 0.30 && daysUntilEvent <= 3) {
            newPrice = currentPrice * 0.80;
            log.info("Event {} — flash discount triggered ({}% full, {} days left)",
                    event.getName(),
                    Math.round(fillRate * 100),
                    daysUntilEvent);
        }
        // under 20% sold with less than 1 day to go → drop 35%
        else if (fillRate < 0.20 && daysUntilEvent <= 1) {
            newPrice = currentPrice * 0.65;
        }

        // never go below min or above max
        newPrice = Math.max(minPrice, Math.min(maxPrice, newPrice));

        return Math.round(newPrice * 100.0) / 100.0;
    }

    // get full pricing analysis for an event
    public Map<String, Object> getPricingAnalysis(Long eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() ->
                        new RuntimeException("Event not found"));

        int soldSeats = event.getTotalSeats() - event.getAvailableSeats();
        double fillRate = event.getTotalSeats() > 0
                ? (double) soldSeats / event.getTotalSeats()
                : 0;

        long daysUntilEvent = ChronoUnit.DAYS.between(
                LocalDateTime.now(), event.getEventDate());

        double suggestedPrice = calculatePrice(event);

        String priceDirection;
        String reason;

        if (suggestedPrice > event.getBasePrice()) {
            priceDirection = "UP";
            reason = fillRate >= 0.80
                    ? "High demand — event is " + Math.round(fillRate * 100) + "% full"
                    : "Moderate demand — " + Math.round(fillRate * 100) + "% fill rate";
        } else if (suggestedPrice < event.getBasePrice()) {
            priceDirection = "DOWN";
            reason = "Low demand with " + daysUntilEvent
                    + " days to go — flash discount activated";
        } else {
            priceDirection = "STABLE";
            reason = "Demand is steady";
        }

        // price history simulation — 5 checkpoints
        List<Map<String, Object>> priceHistory = new ArrayList<>();
        double[] fillCheckpoints = {0.0, 0.20, 0.40, 0.60, 0.80};
        String[] labels = {"0%", "20%", "40%", "60%", "80%"};

        for (int i = 0; i < fillCheckpoints.length; i++) {
            Event simulated = Event.builder()
                    .totalSeats(event.getTotalSeats())
                    .availableSeats((int)(event.getTotalSeats()
                            * (1 - fillCheckpoints[i])))
                    .basePrice(event.getBasePrice())
                    .minPrice(event.getMinPrice())
                    .maxPrice(event.getMaxPrice())
                    .eventDate(event.getEventDate())
                    .build();

            priceHistory.add(Map.of(
                    "fillRate", labels[i],
                    "price", calculatePrice(simulated)
            ));
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("eventName", event.getName());
        result.put("currentPrice", event.getBasePrice());
        result.put("suggestedPrice", suggestedPrice);
        result.put("minPrice", event.getMinPrice());
        result.put("maxPrice", event.getMaxPrice());
        result.put("fillRate", Math.round(fillRate * 100) + "%");
        result.put("soldSeats", soldSeats);
        result.put("availableSeats", event.getAvailableSeats());
        result.put("daysUntilEvent", daysUntilEvent);
        result.put("priceDirection", priceDirection);
        result.put("reason", reason);
        result.put("priceHistory", priceHistory);

        return result;
    }

    // manually trigger price update for one event
    @Transactional
    public Map<String, Object> triggerPriceUpdate(Long eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() ->
                        new RuntimeException("Event not found"));

        double oldPrice = event.getBasePrice();
        double newPrice = calculatePrice(event);

        event.setBasePrice(newPrice);
        eventRepository.save(event);

        return Map.of(
                "eventName", event.getName(),
                "oldPrice", oldPrice,
                "newPrice", newPrice,
                "change", Math.round((newPrice - oldPrice) / oldPrice * 100) + "%",
                "message", newPrice > oldPrice
                        ? "Price increased due to high demand"
                        : newPrice < oldPrice
                        ? "Flash discount applied due to low demand"
                        : "Price unchanged — demand is steady"
        );
    }
}