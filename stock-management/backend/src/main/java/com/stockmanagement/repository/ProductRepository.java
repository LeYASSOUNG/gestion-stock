package com.stockmanagement.repository;

import com.stockmanagement.entity.Product;
import com.stockmanagement.entity.Category;
import com.stockmanagement.entity.Supplier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

/**
 * Référentiel pour l'entité Product.
 * Fournit des méthodes pour accéder aux données des produits, y compris la
 * recherche par SKU et les alertes de stock bas.
 */
@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    Optional<Product> findBySku(String sku);

    List<Product> findByCategory(Category category);

    List<Product> findBySupplier(Supplier supplier);

    List<Product> findByActiveTrue();

    @Query("SELECT p FROM Product p WHERE (SELECT COALESCE(SUM(s.quantity), 0) FROM Stock s WHERE s.product = p) <= p.minStockAlert")
    List<Product> findLowStockProducts();

    boolean existsBySku(String sku);

    org.springframework.data.domain.Page<Product> findByActiveTrue(org.springframework.data.domain.Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.active = true AND (LOWER(p.name) LIKE LOWER(CONCAT('%', :name, '%')) OR LOWER(p.sku) LIKE LOWER(CONCAT('%', :sku, '%')))")
    org.springframework.data.domain.Page<Product> findByNameOrSkuContaining(String name, String sku, org.springframework.data.domain.Pageable pageable);
}
