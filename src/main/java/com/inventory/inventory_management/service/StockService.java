package com.inventory.inventory_management.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.inventory.inventory_management.entity.Stock;
import com.inventory.inventory_management.repository.StockRepository;

@Service
public class StockService {

    private final StockRepository stockRepository;

    public StockService(StockRepository stockRepository) {
        this.stockRepository = stockRepository;
    }

    public Stock createStock(Stock stock) {
        stock.setUpdatedAt(LocalDateTime.now());
        return stockRepository.save(stock);
    }

    public List<Stock> getAllStock() {
        return stockRepository.findAll();
    }

    public Stock getStockById(Long id) {
        return stockRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Stock not found"));
    }

    public Stock getStockByProductId(Long productId) {
        return stockRepository.findByProductId(productId)
                .orElseThrow(() -> new RuntimeException("Stock not found for product"));
    }

    public Stock updateStock(Long id, Stock details) {
        Stock stock = getStockById(id);

        stock.setQuantity(details.getQuantity());
        stock.setUpdatedAt(LocalDateTime.now());

        return stockRepository.save(stock);
    }
}