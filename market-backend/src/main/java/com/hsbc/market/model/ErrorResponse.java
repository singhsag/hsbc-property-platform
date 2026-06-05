package com.hsbc.market.model;

import java.time.Instant;

public record ErrorResponse(
        String error,
        String detail,
        Instant timestamp
) {}
