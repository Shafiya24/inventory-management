package com.inventory.inventory_management.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.inventory.inventory_management.entity.Sale;

public interface SaleRepository extends JpaRepository<Sale, Long> {
}