package com.inventory.inventory_management.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.inventory.inventory_management.entity.Product;
import com.inventory.inventory_management.entity.Stock;
import com.inventory.inventory_management.repository.ProductRepository;
import com.inventory.inventory_management.repository.StockRepository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final StockRepository stockRepository;

    public ProductService(
            ProductRepository productRepository,
            StockRepository stockRepository) {

        this.productRepository = productRepository;
        this.stockRepository = stockRepository;
    }

    public Product createProduct(Product product) {

        Product savedProduct = productRepository.save(product);

        // Automatically create stock record
        // for every new product
        Stock stock = new Stock();
        stock.setProduct(savedProduct);
        stock.setQuantity(savedProduct.getQuantity());
        stock.setUpdatedAt(java.time.LocalDateTime.now());

        stockRepository.save(stock);

        return savedProduct;
    }

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public Product getProductById(Long id) {

        return productRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Product not found with id: " + id
                        )
                );
    }

    public Page<Product> searchProducts(
            String name,
            Pageable pageable) {

        if (name == null || name.isBlank()) {
            return productRepository.findAll(pageable);
        }

        return productRepository
                .findByNameContainingIgnoreCase(name, pageable);
    }

    public List<Product> getLowStockProducts(Integer quantity) {

        return productRepository
                .findByQuantityLessThanEqual(quantity);
    }

    public Product updateProduct(
            Long id,
            Product productDetails) {

        Product product = getProductById(id);

        product.setName(productDetails.getName());
        product.setDescription(productDetails.getDescription());
        product.setSku(productDetails.getSku());
        product.setPrice(productDetails.getPrice());
        product.setQuantity(productDetails.getQuantity());
        product.setCategory(productDetails.getCategory());

        Product updatedProduct =
                productRepository.save(product);

        // Keep Stock synchronized with Product
        Stock stock = stockRepository
                .findByProductId(id)
                .orElseGet(() -> {
                    Stock newStock = new Stock();
                    newStock.setProduct(updatedProduct);
                    return newStock;
                });

        stock.setQuantity(updatedProduct.getQuantity());
        stock.setUpdatedAt(java.time.LocalDateTime.now());

        stockRepository.save(stock);

        return updatedProduct;
    }

    public void deleteProduct(Long id) {

        Product product = getProductById(id);

        // Delete stock first because it references Product
        stockRepository
                .findByProductId(id)
                .ifPresent(stockRepository::delete);

        productRepository.delete(product);
    }
}