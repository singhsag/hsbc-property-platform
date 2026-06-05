package com.hsbc.market.service;

import com.hsbc.market.model.Property;
import jakarta.annotation.PostConstruct;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.InputStreamReader;
import java.io.Reader;
import java.nio.charset.StandardCharsets;
import java.util.Collections;
import java.util.List;
import java.util.ArrayList;

@Service
public class DataLoaderService {

    private static final Logger log = LoggerFactory.getLogger(DataLoaderService.class);

    private List<Property> properties = Collections.emptyList();

    @PostConstruct
    public void load() {
        try {
            ClassPathResource resource = new ClassPathResource("data/House_Price_Dataset.csv");
            // Explicit headers + skip first row: avoids BOM corruption on the first column name.
            try (Reader reader = new InputStreamReader(resource.getInputStream(), StandardCharsets.UTF_8);
                 CSVParser parser = CSVFormat.DEFAULT.builder()
                         .setHeader("id", "square_footage", "bedrooms", "bathrooms",
                                    "year_built", "lot_size", "distance_to_city_center",
                                    "school_rating", "price")
                         .setSkipHeaderRecord(true)
                         .setTrim(true)
                         .build()
                         .parse(reader)) {

                List<Property> loaded = new ArrayList<>();
                for (var record : parser) {
                    loaded.add(new Property(
                            Integer.parseInt(record.get("id")),
                            Double.parseDouble(record.get("square_footage")),
                            Integer.parseInt(record.get("bedrooms")),
                            Double.parseDouble(record.get("bathrooms")),
                            Integer.parseInt(record.get("year_built")),
                            Double.parseDouble(record.get("lot_size")),
                            Double.parseDouble(record.get("distance_to_city_center")),
                            Double.parseDouble(record.get("school_rating")),
                            Double.parseDouble(record.get("price"))
                    ));
                }
                this.properties = Collections.unmodifiableList(loaded);
                log.info("Loaded {} properties from CSV", properties.size());
            }
        } catch (Exception e) {
            log.error("Failed to load property data: {}", e.getMessage(), e);
            throw new IllegalStateException("Cannot start without property data", e);
        }
    }

    public List<Property> getAll() {
        return properties;
    }
}
