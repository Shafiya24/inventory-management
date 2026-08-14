package com.inventory.inventory_management.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.inventory.inventory_management.entity.Supplier;

public interface SupplierRepository extends JpaRepository<Supplier, Long> {
}
