package com.hsbc.market.model;

import java.util.List;

public record SegmentsResponse(
        String groupBy,
        List<SegmentStats> segments
) {}
