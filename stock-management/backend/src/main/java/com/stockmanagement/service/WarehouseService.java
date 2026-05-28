package com.stockmanagement.service;

import com.stockmanagement.entity.Warehouse;
import com.stockmanagement.repository.WarehouseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * Service gérant la logique métier des entrepôts.
 */
@Service
@RequiredArgsConstructor
public class WarehouseService {

    private final WarehouseRepository warehouseRepository;

    public List<Warehouse> getAllWarehouses() {
        return warehouseRepository.findAll();
    }

    public List<Warehouse> getActiveWarehouses() {
        return warehouseRepository.findByActiveTrue();
    }

    public Optional<Warehouse> getWarehouseById(@org.springframework.lang.NonNull Long id) {
        return warehouseRepository.findById(id);
    }

    public Optional<Warehouse> getWarehouseByCode(String code) {
        return warehouseRepository.findByCode(code);
    }

    @Transactional
    public Warehouse createWarehouse(Warehouse warehouse) {
        if (warehouseRepository.findByCode(warehouse.getCode()).isPresent()) {
            throw new RuntimeException("Error: Warehouse code is already in use!");
        }
        return warehouseRepository.save(warehouse);
    }

    @Transactional
    public Warehouse updateWarehouse(@org.springframework.lang.NonNull Long id, Warehouse warehouseDetails) {
        Warehouse warehouse = warehouseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Error: Warehouse not found with id: " + id));

        warehouse.setName(warehouseDetails.getName());
        warehouse.setLocation(warehouseDetails.getLocation());
        warehouse.setAddress(warehouseDetails.getAddress());
        warehouse.setManager(warehouseDetails.getManager());
        warehouse.setActive(warehouseDetails.isActive());

        return warehouseRepository.save(warehouse);
    }

    @SuppressWarnings("null")
    @Transactional
    public void deleteWarehouse(@org.springframework.lang.NonNull Long id) {
        Warehouse warehouse = warehouseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Error: Warehouse not found with id: " + id));
        warehouseRepository.delete(warehouse);
    }
}
