package com.ticketapp.ticketapp.dto.request;

import lombok.Data;

@Data
public class RegisterRequest {
    private String name;
    private String email;
    private String password;
    private String walletAddress;
}