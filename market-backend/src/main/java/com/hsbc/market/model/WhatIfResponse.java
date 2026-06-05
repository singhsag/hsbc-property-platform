package com.hsbc.market.model;

public record WhatIfResponse(
        double predictedPrice,
        double percentile,
        String marketPosition,
        MarketSummary marketSummary
) {}
