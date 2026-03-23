package com.ticketapp.ticketapp.web3;

import org.web3j.abi.TypeReference;
import org.web3j.abi.datatypes.*;
import org.web3j.abi.datatypes.generated.Uint256;
import org.web3j.crypto.Credentials;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.core.RemoteFunctionCall;
import org.web3j.protocol.core.methods.response.TransactionReceipt;
import org.web3j.tx.Contract;
import org.web3j.tx.gas.ContractGasProvider;

import java.math.BigInteger;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

public class TicketNFT extends Contract {

    public static final String BINARY = "0x";

    protected TicketNFT(String contractAddress, Web3j web3j,
                        Credentials credentials,
                        ContractGasProvider gasProvider) {
        super(BINARY, contractAddress, web3j, credentials, gasProvider);
    }

    public static TicketNFT load(String contractAddress, Web3j web3j,
                                 Credentials credentials,
                                 ContractGasProvider gasProvider) {
        return new TicketNFT(contractAddress, web3j, credentials, gasProvider);
    }

    public RemoteFunctionCall<TransactionReceipt> mintTicket(
            String to,
            BigInteger eventId,
            BigInteger seatId,
            String seatNumber,
            String eventName,
            BigInteger originalPrice,
            String tokenURI) {

        final Function function = new Function(
                "mintTicket",
                Arrays.asList(
                        new Address(to),
                        new Uint256(eventId),
                        new Uint256(seatId),
                        new Utf8String(seatNumber),
                        new Utf8String(eventName),
                        new Uint256(originalPrice),
                        new Utf8String(tokenURI)
                ),
                Collections.emptyList()
        );
        return executeRemoteCallTransaction(function);
    }

    public RemoteFunctionCall<TransactionReceipt> useTicket(
            BigInteger tokenId) {
        final Function function = new Function(
                "useTicket",
                Arrays.asList(new Uint256(tokenId)),
                Collections.emptyList()
        );
        return executeRemoteCallTransaction(function);
    }

    public RemoteFunctionCall<List<Type>> verifyTicket(
            BigInteger tokenId, String claimer) {
        final Function function = new Function(
                "verifyTicket",
                Arrays.asList(new Uint256(tokenId), new Address(claimer)),
                Arrays.asList(
                        new TypeReference<Bool>() {},
                        new TypeReference<Utf8String>() {}
                )
        );
        return executeRemoteCallMultipleValueReturn(function);
    }

    public RemoteFunctionCall<BigInteger> totalMinted() {
        final Function function = new Function(
                "totalMinted",
                Collections.emptyList(),
                Arrays.asList(new TypeReference<Uint256>() {})
        );
        return executeRemoteCallSingleValueReturn(function, BigInteger.class);
    }

    public static class TicketMintedEventResponse {
        public BigInteger tokenId;
        public String owner;
        public BigInteger eventId;
        public String seatNumber;
    }

    public static List<TicketMintedEventResponse> getTicketMintedEvents(
            TransactionReceipt receipt) {
        TicketMintedEventResponse response = new TicketMintedEventResponse();
        if (receipt.getLogs() != null && !receipt.getLogs().isEmpty()) {
            try {
                String tokenIdHex = receipt.getLogs()
                        .get(0).getTopics().get(1);
                response.tokenId = new BigInteger(
                        tokenIdHex.substring(2), 16);
            } catch (Exception e) {
                response.tokenId = BigInteger.ZERO;
            }
        } else {
            response.tokenId = BigInteger.ZERO;
        }
        return List.of(response);
    }
}