package com.ticketapp.ticketapp.service;

import com.ticketapp.ticketapp.dto.request.BookingRequest;
import com.ticketapp.ticketapp.dto.response.BookingResponse;
import com.ticketapp.ticketapp.exception.ResourceNotFoundException;
import com.ticketapp.ticketapp.exception.SeatNotAvailableException;
import com.ticketapp.ticketapp.model.*;
import com.ticketapp.ticketapp.model.enums.BookingStatus;
import com.ticketapp.ticketapp.model.enums.SeatStatus;
import com.ticketapp.ticketapp.repository.*;
import com.ticketapp.ticketapp.websocket.SeatStateHandler;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.util.Base64;
import java.util.List;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final SeatRepository seatRepository;
    private final EventRepository eventRepository;
    private final UserRepository userRepository;
    private final WaitlistRepository waitlistRepository;
    private final RedisTemplate<String, String> redisTemplate;
    private final SeatStateHandler seatStateHandler;
    private final NFTService nftService;

    private static final String LOCK_PREFIX = "seat:lock:";
    private static final String HOLD_PREFIX = "seat:hold:";
    private static final long HOLD_MINUTES = 8;
    private static final String HMAC_SECRET = "cookmyshow-secret-2024";

    @Transactional
    public BookingResponse bookSeat(BookingRequest request, String userEmail) {
        String lockKey = LOCK_PREFIX + request.getSeatId();

        Boolean locked = redisTemplate.opsForValue()
                .setIfAbsent(lockKey, userEmail, 30, TimeUnit.SECONDS);

        if (Boolean.FALSE.equals(locked)) {
            throw new SeatNotAvailableException(
                    "Seat is currently being booked by another user");
        }

        try {
            Seat seat = seatRepository.findById(request.getSeatId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Seat not found: " + request.getSeatId()));

            if (seat.getStatus() != SeatStatus.AVAILABLE
                    && seat.getStatus() != SeatStatus.HELD) {
                throw new SeatNotAvailableException(
                        "Seat " + seat.getSeatNumber() + " is not available");
            }

            if (seat.getStatus() == SeatStatus.HELD) {
                String holdKey = HOLD_PREFIX + request.getSeatId();
                String holdOwner = redisTemplate.opsForValue().get(holdKey);
                if (!userEmail.equals(holdOwner)) {
                    throw new SeatNotAvailableException(
                            "Seat is held by another user");
                }
            }

            User user = userRepository.findByEmail(userEmail)
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "User not found"));

            Event event = eventRepository.findById(request.getEventId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Event not found"));

            seat.setStatus(SeatStatus.BOOKED);
            seatRepository.save(seat);

            event.setAvailableSeats(event.getAvailableSeats() - 1);
            eventRepository.save(event);

            String qrToken = generateHmacToken(
                    seat.getId() + ":" + user.getId() + ":" + event.getId());

            Booking booking = Booking.builder()
                    .user(user)
                    .seat(seat)
                    .event(event)
                    .status(BookingStatus.CONFIRMED)
                    .qrToken(qrToken)
                    .amountPaid(seat.getPrice())
                    .build();

            bookingRepository.save(booking);

            // async NFT mint — non-blocking
            nftService.mintTicketNFT(booking);

            seatStateHandler.broadcastSeatUpdate(
                    event.getId(), seat.getId(), "BOOKED");

            redisTemplate.delete(HOLD_PREFIX + request.getSeatId());

            log.info("Booking confirmed: user={} seat={} event={}",
                    userEmail, seat.getSeatNumber(), event.getName());

            return BookingResponse.builder()
                    .bookingId(booking.getId())
                    .seatNumber(seat.getSeatNumber())
                    .eventName(event.getName())
                    .amountPaid(seat.getPrice())
                    .status("CONFIRMED")
                    .qrToken(qrToken)
                    .build();

        } finally {
            redisTemplate.delete(lockKey);
        }
    }

    public void holdSeat(Long seatId, String userEmail) {
        String holdKey = HOLD_PREFIX + seatId;

        Seat seat = seatRepository.findById(seatId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Seat not found"));

        if (seat.getStatus() != SeatStatus.AVAILABLE) {
            throw new SeatNotAvailableException(
                    "Seat is not available to hold");
        }

        redisTemplate.opsForValue()
                .set(holdKey, userEmail, HOLD_MINUTES, TimeUnit.MINUTES);

        seat.setStatus(SeatStatus.HELD);
        seatRepository.save(seat);

        seatStateHandler.broadcastSeatUpdate(
                seat.getEvent().getId(), seatId, "HELD");
    }

    @Transactional
    public void cancelBooking(Long bookingId, String userEmail) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Booking not found"));

        if (!booking.getUser().getEmail().equals(userEmail)) {
            throw new RuntimeException(
                    "Not authorized to cancel this booking");
        }

        Seat seat = booking.getSeat();
        seat.setStatus(SeatStatus.AVAILABLE);
        seatRepository.save(seat);

        Event event = booking.getEvent();
        event.setAvailableSeats(event.getAvailableSeats() + 1);
        eventRepository.save(event);

        booking.setStatus(BookingStatus.CANCELLED);
        bookingRepository.save(booking);

        seatStateHandler.broadcastSeatUpdate(
                event.getId(), seat.getId(), "AVAILABLE");

        processWaitlist(event.getId(), seat.getId());
    }

    private void processWaitlist(Long eventId, Long seatId) {
        waitlistRepository
                .findFirstByEventIdOrderByPositionAsc(eventId)
                .ifPresent(entry -> {
                    log.info("Notifying waitlist user: {}",
                            entry.getUser().getEmail());
                    holdSeat(seatId, entry.getUser().getEmail());
                    waitlistRepository.delete(entry);
                });
    }

    public List<Booking> getUserBookings(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found"));
        return bookingRepository.findByUserId(user.getId());
    }

    public boolean verifyQrToken(String qrToken) {
        return bookingRepository.findByQrToken(qrToken).isPresent();
    }

    private String generateHmacToken(String data) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec key = new SecretKeySpec(
                    HMAC_SECRET.getBytes(), "HmacSHA256");
            mac.init(key);
            return Base64.getUrlEncoder().encodeToString(
                    mac.doFinal(data.getBytes()));
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate QR token", e);
        }
    }
}