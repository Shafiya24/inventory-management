package com.inventory.inventory_management.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.inventory.inventory_management.entity.Supplier;
import com.inventory.inventory_management.repository.SupplierRepository;

@Service
public class SupplierService {

    private final SupplierRepository supplierRepository;

    public SupplierService(SupplierRepository supplierRepository) {
        this.supplierRepository = supplierRepository;
    }

    public Supplier createSupplier(Supplier supplier) {
        return supplierRepository.save(supplier);
    }

    public List<Supplier> getAllSuppliers() {
        return supplierRepository.findAll();
    }

    public Supplier getSupplierById(Long id) {
        return supplierRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Supplier not found with id: " + id));
    }

    public Supplier updateSupplier(Long id, Supplier details) {
        Supplier supplier = getSupplierById(id);

        supplier.setName(details.getName());
        supplier.setEmail(details.getEmail());
        supplier.setPhone(details.getPhone());
        supplier.setAddress(details.getAddress());

        return supplierRepository.save(supplier);
    }

    public void deleteSupplier(Long id) {
        Supplier supplier = getSupplierById(id);
        supplierRepository.delete(supplier);
    }
}
