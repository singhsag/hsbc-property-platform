package com.hsbc.market;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableCaching
public class MarketBackendApplication {
    public static void main(String[] args) {
        SpringApplication.run(MarketBackendApplication.class, args);
    }
}
