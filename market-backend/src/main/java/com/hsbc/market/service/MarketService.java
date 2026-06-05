package com.hsbc.market.service;

import com.hsbc.market.model.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class MarketService {

    private static final Logger log = LoggerFactory.getLogger(MarketService.class);

    private final DataLoaderService dataLoader;

    public MarketService(DataLoaderService dataLoader) {
        this.dataLoader = dataLoader;
    }

    @Cacheable("market-summary")
    public MarketSummary getSummary() {
        log.debug("Computing market summary (cache miss)");
        return computeSummary(dataLoader.getAll().stream()
                .mapToDouble(Property::price)
                .toArray());
    }

    @Cacheable(value = "market-segments", key = "#groupBy")
    public SegmentsResponse getSegments(String groupBy) {
        log.debug("Computing segments for groupBy={} (cache miss)", groupBy);
        Map<String, List<Double>> groups = new LinkedHashMap<>();

        for (var prop : dataLoader.getAll()) {
            String key = resolveGroupKey(prop, groupBy);
            groups.computeIfAbsent(key, k -> new ArrayList<>()).add(prop.price());
        }

        List<SegmentStats> segments = groups.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(e -> {
                    double[] arr = e.getValue().stream().mapToDouble(Double::doubleValue).toArray();
                    MarketSummary s = computeSummary(arr);
                    return new SegmentStats(e.getKey(), s.count(), s.mean(), s.min(), s.max(), s.median());
                })
                .collect(Collectors.toList());

        return new SegmentsResponse(groupBy, segments);
    }

    public AnalysisResponse getAnalysis(Double minPrice, Double maxPrice,
                                        Integer minBedrooms, Integer maxBedrooms) {
        double[] prices = dataLoader.getAll().stream()
                .filter(p -> minPrice == null || p.price() >= minPrice)
                .filter(p -> maxPrice == null || p.price() <= maxPrice)
                .filter(p -> minBedrooms == null || p.bedrooms() >= minBedrooms)
                .filter(p -> maxBedrooms == null || p.bedrooms() <= maxBedrooms)
                .mapToDouble(Property::price)
                .toArray();

        MarketSummary s = computeSummary(prices);

        Map<String, String> filters = new LinkedHashMap<>();
        if (minPrice != null) filters.put("minPrice", String.valueOf(minPrice));
        if (maxPrice != null) filters.put("maxPrice", String.valueOf(maxPrice));
        if (minBedrooms != null) filters.put("minBedrooms", String.valueOf(minBedrooms));
        if (maxBedrooms != null) filters.put("maxBedrooms", String.valueOf(maxBedrooms));

        return new AnalysisResponse(filters, s.count(), s.mean(), s.min(), s.max(), s.median(), s.stdDev());
    }

    public double computePercentile(double predictedPrice) {
        long below = dataLoader.getAll().stream()
                .filter(p -> p.price() < predictedPrice)
                .count();
        return (double) below / dataLoader.getAll().size() * 100.0;
    }

    private String resolveGroupKey(Property prop, String groupBy) {
        return switch (groupBy.toLowerCase()) {
            case "bedrooms" -> String.valueOf(prop.bedrooms()) + " bed";
            case "bathrooms" -> String.valueOf(prop.bathrooms()) + " bath";
            case "year_built" -> decadeLabel(prop.yearBuilt());
            default -> throw new IllegalArgumentException("Unsupported groupBy: " + groupBy);
        };
    }

    private String decadeLabel(int year) {
        int decade = (year / 10) * 10;
        return decade + "s";
    }

    private MarketSummary computeSummary(double[] prices) {
        if (prices.length == 0) {
            return new MarketSummary(0, 0, 0, 0, 0, 0);
        }
        double[] sorted = Arrays.copyOf(prices, prices.length);
        Arrays.sort(sorted);

        double mean = Arrays.stream(sorted).average().orElse(0);
        double variance = Arrays.stream(sorted)
                .map(p -> Math.pow(p - mean, 2))
                .average()
                .orElse(0);
        double stdDev = Math.sqrt(variance);
        double median = sorted.length % 2 == 0
                ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2.0
                : sorted[sorted.length / 2];

        return new MarketSummary(sorted.length, mean, sorted[0], sorted[sorted.length - 1], median, stdDev);
    }
}
