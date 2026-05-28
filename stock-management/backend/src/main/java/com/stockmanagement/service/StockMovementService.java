package com.stockmanagement.service;

import com.stockmanagement.entity.*;
import com.stockmanagement.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Service gérant les mouvements de stock (entrées, sorties, transferts).
 * Responsable de la mise à jour des quantités en stock lors de chaque
 * mouvement.
 */
@Service
@RequiredArgsConstructor
public class StockMovementService {
    private final StockMovementRepository movementRepository;
    private final StockRepository stockRepository;
    private final ProductRepository productRepository;

    @Transactional
    public StockMovement createEntry(StockMovement movement) {
        validateMovement(movement);
        movement.setType(MovementType.ENTRY);

        // Update stock
        Stock stock = getOrCreateStock(movement.getProduct(), movement.getToWarehouse());
        stock.setQuantity(stock.getQuantity() + movement.getQuantity());
        stockRepository.save(stock);

        return movementRepository.save(movement);
    }

    @Transactional
    public StockMovement createExit(StockMovement movement) {
        validateMovement(movement);
        movement.setType(MovementType.EXIT);

        // Update stock
        Stock stock = getStock(movement.getProduct(), movement.getFromWarehouse());
        if (stock.getQuantity() < movement.getQuantity()) {
            throw new RuntimeException("Insufficient stock");
        }
        stock.setQuantity(stock.getQuantity() - movement.getQuantity());
        stockRepository.save(stock);

        return movementRepository.save(movement);
    }

    @Transactional
    public StockMovement createTransfer(StockMovement movement) {
        if (movement.getFromWarehouse() == null || movement.getToWarehouse() == null) {
            throw new RuntimeException("Both warehouses required for transfer");
        }
        if (movement.getFromWarehouse().equals(movement.getToWarehouse())) {
            throw new RuntimeException("Source and destination warehouses must be different");
        }

        movement.setType(MovementType.TRANSFER);

        // Remove from source
        Stock fromStock = getStock(movement.getProduct(), movement.getFromWarehouse());
        if (fromStock.getQuantity() < movement.getQuantity()) {
            throw new RuntimeException("Insufficient stock in source warehouse");
        }
        fromStock.setQuantity(fromStock.getQuantity() - movement.getQuantity());
        stockRepository.save(fromStock);

        // Add to destination
        Stock toStock = getOrCreateStock(movement.getProduct(), movement.getToWarehouse());
        toStock.setQuantity(toStock.getQuantity() + movement.getQuantity());
        stockRepository.save(toStock);

        return movementRepository.save(movement);
    }

    @Transactional
    public StockMovement createAdjustment(StockMovement movement) {
        movement.setType(MovementType.ADJUSTMENT);

        Stock stock = getStock(movement.getProduct(), movement.getToWarehouse());
        stock.setQuantity(movement.getQuantity());
        stockRepository.save(stock);

        return movementRepository.save(movement);
    }

    private void validateMovement(StockMovement movement) {
        if (movement.getQuantity() <= 0) {
            throw new RuntimeException("Quantity must be positive");
        }
        if (movement.getProduct() == null || movement.getProduct().getId() == null) {
            throw new RuntimeException("Product is required");
        }
    }

    private Stock getStock(Product product, Warehouse warehouse) {
        return stockRepository.findByProductAndWarehouse(product, warehouse)
                .orElseThrow(() -> new RuntimeException("Stock not found"));
    }

    private Stock getOrCreateStock(Product product, Warehouse warehouse) {
        return stockRepository.findByProductAndWarehouse(product, warehouse)
                .orElseGet(() -> {
                    Stock newStock = new Stock();
                    newStock.setProduct(product);
                    newStock.setWarehouse(warehouse);
                    newStock.setQuantity(0);
                    return stockRepository.save(newStock);
                });
    }

    public List<StockMovement> getMovementsByProduct(@org.springframework.lang.NonNull Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        return movementRepository.findByProduct(product);
    }

    public List<StockMovement> getMovementsByDateRange(LocalDateTime start, LocalDateTime end) {
        return movementRepository.findByCreatedAtBetween(start, end);
    }
}
