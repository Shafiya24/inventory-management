package com.inventory.inventory_management.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.inventory.inventory_management.entity.Stock;
import com.inventory.inventory_management.service.StockService;

@RestController
@RequestMapping("/api/stock")
public class StockController {

    private final StockService stockService;

    public StockController(StockService stockService) {
        this.stockService = stockService;
    }

    @PostMapping
    public ResponseEntity<Stock> createStock(@RequestBody Stock stock) {
        return new ResponseEntity<>(
                stockService.createStock(stock),
                HttpStatus.CREATED
        );
    }

    @GetMapping
    public ResponseEntity<List<Stock>> getAllStock() {
        return ResponseEntity.ok(stockService.getAllStock());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Stock> getStockById(@PathVariable Long id) {
        return ResponseEntity.ok(stockService.getStockById(id));
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<Stock> getStockByProduct(
            @PathVariable Long productId) {

        return ResponseEntity.ok(
                stockService.getStockByProductId(productId)
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<Stock> updateStock(
            @PathVariable Long id,
            @RequestBody Stock stock) {

        return ResponseEntity.ok(
                stockService.updateStock(id, stock)
        );
    }
}
