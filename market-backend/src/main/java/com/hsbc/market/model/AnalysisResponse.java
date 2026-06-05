package com.hsbc.market.model;

import java.util.Map;

public record AnalysisResponse(
        Map<String, String> filters,
        long count,
        double mean,
        double min,
        double max,
        double median,
        double stdDev
) {}
