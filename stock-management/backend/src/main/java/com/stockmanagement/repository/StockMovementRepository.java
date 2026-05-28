package com.stockmanagement.repository;

import com.stockmanagement.entity.StockMovement;
import com.stockmanagement.entity.Product;
import com.stockmanagement.entity.Warehouse;
import com.stockmanagement.entity.MovementType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Référentiel pour l'entité StockMovement.
 * Permet de consulter l'historique des mouvements de stock avec pagination et
 * filtres temporels.
 */
@Repository
public interface StockMovementRepository extends JpaRepository<StockMovement, Long> {
    List<StockMovement> findByProduct(Product product);

    List<StockMovement> findByFromWarehouseOrToWarehouse(Warehouse from, Warehouse to);

    List<StockMovement> findByType(MovementType type);

    List<StockMovement> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);


    long countByCreatedAtAfter(LocalDateTime date);
}
