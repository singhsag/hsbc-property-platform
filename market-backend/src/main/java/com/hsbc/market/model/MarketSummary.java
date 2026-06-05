package com.hsbc.market.model;

public record MarketSummary(
        long count,
        double mean,
        double min,
        double max,
        double median,
        double stdDev
) {}
