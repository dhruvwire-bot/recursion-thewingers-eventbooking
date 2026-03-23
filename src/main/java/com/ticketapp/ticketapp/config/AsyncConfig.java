package com.ticketapp.ticketapp.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@Configuration
@EnableAsync
@EnableScheduling
public class AsyncConfig {
    // @EnableAsync allows @Async on NFT minting service
    // @EnableScheduling allows @Scheduled for seat hold expiry
}