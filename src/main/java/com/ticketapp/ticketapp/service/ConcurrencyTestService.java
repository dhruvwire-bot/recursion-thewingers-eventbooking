package com.ticketapp.ticketapp.service;

import com.ticketapp.ticketapp.dto.request.BookingRequest;
import com.ticketapp.ticketapp.exception.SeatNotAvailableException;
import com.ticketapp.ticketapp.model.User;
import com.ticketapp.ticketapp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

@Slf4j
@Service
@RequiredArgsConstructor
public class ConcurrencyTestService {

    private final BookingService bookingService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public Map<String, Object> runStressTest(Long seatId,
                                             Long eventId,
                                             int threads) {

        // pre-create all test users before firing threads
        // this ensures "user not found" never happens
        for (int i = 1; i <= threads; i++) {
            String email = "stressuser" + i + "@test.com";
            if (!userRepository.existsByEmail(email)) {
                User user = User.builder()
                        .name("Stress User " + i)
                        .email(email)
                        .password(passwordEncoder.encode("password"))
                        .build();
                userRepository.save(user);
            }
        }

        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger failCount = new AtomicInteger(0);
        AtomicInteger conflictCount = new AtomicInteger(0);
        List<String> logs = Collections.synchronizedList(new ArrayList<>());

        ExecutorService executor = Executors.newFixedThreadPool(threads);
        CountDownLatch startGate = new CountDownLatch(1);
        CountDownLatch doneLatch = new CountDownLatch(threads);
        long startTime = System.currentTimeMillis();

        for (int i = 0; i < threads; i++) {
            final int threadNum = i + 1;
            final String email = "stressuser" + threadNum + "@test.com";

            executor.submit(() -> {
                try {
                    // all threads wait here until startGate opens
                    // this makes them truly simultaneous
                    startGate.await();

                    BookingRequest request = new BookingRequest();
                    request.setSeatId(seatId);
                    request.setEventId(eventId);

                    bookingService.bookSeat(request, email);
                    successCount.incrementAndGet();
                    logs.add("Thread-" + threadNum
                            + " [" + email + "] → SUCCESS");

                } catch (SeatNotAvailableException e) {
                    conflictCount.incrementAndGet();
                    logs.add("Thread-" + threadNum
                            + " [" + email + "] → CONFLICT (correctly blocked)");
                } catch (Exception e) {
                    failCount.incrementAndGet();
                    logs.add("Thread-" + threadNum
                            + " [" + email + "] → ERROR: " + e.getMessage());
                } finally {
                    doneLatch.countDown();
                }
            });
        }

        // fire all threads at exactly the same moment
        startGate.countDown();

        try {
            doneLatch.await(30, TimeUnit.SECONDS);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        executor.shutdown();

        long duration = System.currentTimeMillis() - startTime;

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("totalRequests", threads);
        result.put("successCount", successCount.get());
        result.put("conflictCount", conflictCount.get());
        result.put("errorCount", failCount.get());
        result.put("durationMs", duration);
        result.put("verdict", successCount.get() == 1
                ? "✅ PASSED — exactly 1 booking succeeded, "
                + conflictCount.get() + " correctly blocked"
                : successCount.get() == 0
                ? "⚠️ No success — pick a fresh available seat"
                : "❌ FAILED — " + successCount.get()
                + " bookings succeeded (double booking!)");
        result.put("log", logs);

        return result;
    }
}
