package com.stockmanagement.repository;

import com.stockmanagement.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

/**
 * Référentiel pour l'entité Category.
 * Gère la hiérarchie des catégories de produits.
 */
@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    Optional<Category> findByName(String name);

    List<Category> findByParentIsNull();

    List<Category> findByParent(Category parent);
}
