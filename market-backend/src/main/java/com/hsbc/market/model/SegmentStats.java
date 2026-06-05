package com.hsbc.market.model;

public record SegmentStats(
        String group,
        long count,
        double mean,
        double min,
        double max,
        double median
) {}
