package com.hsbc.market.controller;

import com.hsbc.market.model.*;
import com.hsbc.market.service.MarketService;
import com.hsbc.market.service.MlClientService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/market")
public class MarketController {

    private final MarketService marketService;
    private final MlClientService mlClientService;

    public MarketController(MarketService marketService, MlClientService mlClientService) {
        this.marketService = marketService;
        this.mlClientService = mlClientService;
    }

    @GetMapping("/summary")
    public MarketSummary summary() {
        return marketService.getSummary();
    }

    @GetMapping("/segments")
    public SegmentsResponse segments(
            @RequestParam(defaultValue = "bedrooms") String groupBy) {
        return marketService.getSegments(groupBy);
    }

    @GetMapping("/analysis")
    public AnalysisResponse analysis(
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) Integer minBedrooms,
            @RequestParam(required = false) Integer maxBedrooms) {
        return marketService.getAnalysis(minPrice, maxPrice, minBedrooms, maxBedrooms);
    }

    @PostMapping("/whatif")
    public WhatIfResponse whatIf(@RequestBody @Valid WhatIfRequest request) {
        double predictedPrice = mlClientService.predict(request);
        double percentile = marketService.computePercentile(predictedPrice);
        MarketSummary summary = marketService.getSummary();

        String position = predictedPrice < summary.median() ? "below_median" : "above_median";

        return new WhatIfResponse(predictedPrice, percentile, position, summary);
    }
}
