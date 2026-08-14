package com.inventory.inventory_management.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import com.inventory.inventory_management.entity.Product;

public interface ProductRepository extends JpaRepository<Product, Long> {

    Page<Product> findByNameContainingIgnoreCase(
            String name,
            Pageable pageable
    );
    
    List<Product> findByQuantityLessThanEqual(Integer quantity);
}