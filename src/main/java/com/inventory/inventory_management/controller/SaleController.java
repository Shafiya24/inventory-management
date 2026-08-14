package com.inventory.inventory_management.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.inventory.inventory_management.entity.Sale;
import com.inventory.inventory_management.service.SaleService;

@RestController
@RequestMapping("/api/sales")
public class SaleController {

    private final SaleService saleService;

    public SaleController(SaleService saleService) {
        this.saleService = saleService;
    }

    @PostMapping
    public ResponseEntity<Sale> createSale(
            @RequestBody Sale sale) {

        return new ResponseEntity<>(
                saleService.createSale(sale),
                HttpStatus.CREATED
        );
    }

    @GetMapping
    public ResponseEntity<List<Sale>> getAllSales() {
        return ResponseEntity.ok(saleService.getAllSales());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Sale> getSaleById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                saleService.getSaleById(id)
        );
    }
}
