package com.stockmanagement.repository;

import com.stockmanagement.entity.Stock;
import com.stockmanagement.entity.Product;
import com.stockmanagement.entity.Warehouse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

/**
 * Référentiel pour l'entité Stock.
 * Fournit des méthodes pour consulter l'état des stocks par produit et par
 * entrepôt.
 */
@Repository
public interface StockRepository extends JpaRepository<Stock, Long> {
    Optional<Stock> findByProductAndWarehouse(Product product, Warehouse warehouse);

    List<Stock> findByWarehouse(Warehouse warehouse);

    List<Stock> findByProduct(Product product);

    @Query("SELECT s FROM Stock s WHERE s.quantity <= s.product.minStockAlert")
    List<Stock> findLowStock();

    @Query("SELECT SUM(s.quantity) FROM Stock s WHERE s.product = ?1")
    Integer getTotalStockForProduct(Product product);
}
