package com.inventory.inventory_management;

import com.inventory.inventory_management.entity.Product;
import com.inventory.inventory_management.entity.Stock;
import com.inventory.inventory_management.repository.ProductRepository;
import com.inventory.inventory_management.repository.StockRepository;
import com.inventory.inventory_management.service.AuthService;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.LocalDateTime;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initializeData(
            AuthService authService,
            ProductRepository productRepository,
            StockRepository stockRepository) {

        return args -> {

            // =========================
            // DEFAULT ADMIN USER
            // =========================

            try {
                authService.createUser(
                        "admin",
                        "admin123",
                        "ADMIN"
                );
            } catch (Exception ignored) {
            }


            // =========================
            // DEFAULT EMPLOYEE USER
            // =========================

            try {
                authService.createUser(
                        "employee",
                        "employee123",
                        "EMPLOYEE"
                );
            } catch (Exception ignored) {
            }


            // =========================
            // CREATE MISSING STOCK
            // =========================

            for (Product product : productRepository.findAll()) {

                boolean stockExists =
                        stockRepository
                                .findByProductId(product.getId())
                                .isPresent();

                if (!stockExists) {

                    Stock stock = new Stock();

                    stock.setProduct(product);
                    stock.setQuantity(product.getQuantity());
                    stock.setUpdatedAt(
                            LocalDateTime.now()
                    );

                    stockRepository.save(stock);
                }
            }
        };
    }
}