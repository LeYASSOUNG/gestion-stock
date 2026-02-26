package com.stockmanagement.repository;

import com.stockmanagement.entity.Supplier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.List;

/**
 * Référentiel pour l'entité Supplier.
 * Gère l'accès aux données des fournisseurs.
 */
@Repository
public interface SupplierRepository extends JpaRepository<Supplier, Long> {
    Optional<Supplier> findByEmail(String email);

    Optional<Supplier> findByName(String name);

    List<Supplier> findByActiveTrue();
}
