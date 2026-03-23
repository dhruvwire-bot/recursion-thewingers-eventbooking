package com.ticketapp.ticketapp.service;

import com.ticketapp.ticketapp.model.Booking;
import com.ticketapp.ticketapp.repository.BookingRepository;
import com.ticketapp.ticketapp.web3.TicketNFT;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.web3j.abi.datatypes.Type;
import org.web3j.crypto.Credentials;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.core.methods.response.TransactionReceipt;
import org.web3j.tx.gas.ContractGasProvider;

import java.math.BigInteger;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class NFTService {

    private final Web3j web3j;
    private final Credentials credentials;
    private final ContractGasProvider gasProvider;
    private final BookingRepository bookingRepository;

    @Value("${web3j.contract.address}")
    private String contractAddress;

    @Async
    public void mintTicketNFT(Booking booking) {
        try {
            log.info("Minting NFT for booking: {}", booking.getId());

            TicketNFT contract = TicketNFT.load(
                    contractAddress, web3j, credentials, gasProvider);

            String toAddress = booking.getUser().getWalletAddress() != null
                    && !booking.getUser().getWalletAddress().isEmpty()
                    ? booking.getUser().getWalletAddress()
                    : credentials.getAddress();

            String tokenURI = "https://cookmyshow.app/metadata/"
                    + booking.getId();

            TransactionReceipt receipt = contract.mintTicket(
                    toAddress,
                    BigInteger.valueOf(booking.getEvent().getId()),
                    BigInteger.valueOf(booking.getSeat().getId()),
                    booking.getSeat().getSeatNumber(),
                    booking.getEvent().getName(),
                    BigInteger.valueOf((long) booking.getAmountPaid()),
                    tokenURI
            ).send();

            TicketNFT.TicketMintedEventResponse mintEvent =
                    TicketNFT.getTicketMintedEvents(receipt).get(0);

            String tokenId = mintEvent.tokenId.toString();

            booking.setNftTokenId(tokenId);
            bookingRepository.save(booking);

            log.info("NFT minted: tokenId={} booking={}",
                    tokenId, booking.getId());

        } catch (Exception e) {
            log.error("NFT minting failed for booking {}: {}",
                    booking.getId(), e.getMessage());
        }
    }

    public Map<String, Object> verifyOnChain(String tokenId,
                                             String walletAddress) {
        try {
            TicketNFT contract = TicketNFT.load(
                    contractAddress, web3j, credentials, gasProvider);

            List<Type> result = contract.verifyTicket(
                    new BigInteger(tokenId),
                    walletAddress
            ).send();

            boolean valid = (Boolean) result.get(0).getValue();
            String reason = (String) result.get(1).getValue();

            return Map.of(
                    "valid", valid,
                    "reason", reason,
                    "tokenId", tokenId,
                    "walletAddress", walletAddress
            );

        } catch (Exception e) {
            return Map.of(
                    "valid", false,
                    "reason", "Verification failed: " + e.getMessage()
            );
        }
    }

    public Map<String, Object> markTicketUsed(String tokenId) {
        try {
            TicketNFT contract = TicketNFT.load(
                    contractAddress, web3j, credentials, gasProvider);

            contract.useTicket(new BigInteger(tokenId)).send();

            return Map.of(
                    "success", true,
                    "tokenId", tokenId,
                    "message", "Ticket marked as used on-chain"
            );

        } catch (Exception e) {
            return Map.of(
                    "success", false,
                    "message", "Failed: " + e.getMessage()
            );
        }
    }
}