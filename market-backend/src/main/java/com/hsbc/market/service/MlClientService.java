package com.hsbc.market.service;

import com.hsbc.market.model.WhatIfRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientRequestException;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.util.Map;

@Service
public class MlClientService {

    private static final Logger log = LoggerFactory.getLogger(MlClientService.class);

    private final WebClient mlWebClient;

    public MlClientService(WebClient mlWebClient) {
        this.mlWebClient = mlWebClient;
    }

    public double predict(WhatIfRequest request) {
        Map<String, Object> payload = Map.of(
                "square_footage", request.squareFootage(),
                "bedrooms", request.bedrooms(),
                "bathrooms", request.bathrooms(),
                "year_built", request.yearBuilt(),
                "lot_size", request.lotSize(),
                "distance_to_city_center", request.distanceToCityCenter(),
                "school_rating", request.schoolRating()
        );

        try {
            Map<?, ?> response = mlWebClient.post()
                    .uri("/predict")
                    .bodyValue(payload)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

            if (response == null || !response.containsKey("predicted_price")) {
                throw new IllegalStateException("Unexpected response from ML service");
            }
            double price = ((Number) response.get("predicted_price")).doubleValue();
            log.debug("ML prediction: {}", price);
            return price;

        } catch (WebClientRequestException e) {
            log.error("ML service unreachable: {}", e.getMessage());
            throw new MlServiceUnavailableException("ML service is unreachable", e);
        } catch (WebClientResponseException e) {
            log.error("ML service HTTP {}: {}", e.getStatusCode(), e.getResponseBodyAsString());
            throw new MlServiceUnavailableException("ML service returned an error", e);
        }
    }

    public static class MlServiceUnavailableException extends RuntimeException {
        public MlServiceUnavailableException(String message, Throwable cause) {
            super(message, cause);
        }
    }
}
