package com.inventory.inventory_management.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.inventory.inventory_management.entity.Purchase;
import com.inventory.inventory_management.service.PurchaseService;

@RestController
@RequestMapping("/api/purchases")
public class PurchaseController {

    private final PurchaseService purchaseService;

    public PurchaseController(PurchaseService purchaseService) {
        this.purchaseService = purchaseService;
    }

    @PostMapping
    public ResponseEntity<Purchase> createPurchase(
            @RequestBody Purchase purchase) {

        return new ResponseEntity<>(
                purchaseService.createPurchase(purchase),
                HttpStatus.CREATED
        );
    }

    @GetMapping
    public ResponseEntity<List<Purchase>> getAllPurchases() {
        return ResponseEntity.ok(purchaseService.getAllPurchases());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Purchase> getPurchaseById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                purchaseService.getPurchaseById(id)
        );
    }
}
