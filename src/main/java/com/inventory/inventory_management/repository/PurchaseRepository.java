package com.inventory.inventory_management.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.inventory.inventory_management.entity.Purchase;

public interface PurchaseRepository extends JpaRepository<Purchase, Long> {
}
