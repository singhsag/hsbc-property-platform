package com.hsbc.market.model;

import jakarta.validation.constraints.*;

public record WhatIfRequest(
        @Positive double squareFootage,
        @Min(1) @Max(20) int bedrooms,
        @DecimalMin("0.5") @DecimalMax("20") double bathrooms,
        @Min(1800) @Max(2030) int yearBuilt,
        @Positive double lotSize,
        @PositiveOrZero double distanceToCityCenter,
        @DecimalMin("0") @DecimalMax("10") double schoolRating
) {}
