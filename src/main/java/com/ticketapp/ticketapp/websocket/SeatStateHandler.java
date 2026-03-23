package com.ticketapp.ticketapp.websocket;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class SeatStateHandler {

    private final SimpMessagingTemplate messagingTemplate;

    public void broadcastSeatUpdate(Long eventId, Long seatId, String status) {
        String destination = "/topic/event/" + eventId + "/seats";
        Map<String, Object> payload = Map.of(
                "seatId", seatId,
                "status", status
        );
        messagingTemplate.convertAndSend(destination, payload);
        log.info("WS broadcast → {} : seat={} status={}", destination, seatId, status);
    }

    public void broadcastViewingState(Long eventId, Long seatId,
                                      String status, String userEmail) {
        String destination = "/topic/event/" + eventId + "/seats";
        Map<String, Object> payload = Map.of(
                "seatId", seatId,
                "status", status,
                "viewer", userEmail.split("@")[0] // only show username, not full email
        );
        messagingTemplate.convertAndSend(destination, payload);
    }
}