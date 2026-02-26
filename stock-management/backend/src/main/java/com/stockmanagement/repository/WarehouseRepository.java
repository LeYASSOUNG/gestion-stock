package com.stockmanagement.repository;

import com.stockmanagement.entity.Warehouse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.List;

/**
 * Référentiel pour l'entité Warehouse.
 * Gère l'accès aux données des entrepôts.
 */
@Repository
public interface WarehouseRepository extends JpaRepository<Warehouse, Long> {
    Optional<Warehouse> findByCode(String code);

    List<Warehouse> findByActiveTrue();
}
