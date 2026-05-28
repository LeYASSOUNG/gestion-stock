package com.stockmanagement.service;

import com.stockmanagement.entity.Category;
import com.stockmanagement.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * Service gérant la logique métier des catégories.
 */
@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    public List<Category> getRootCategories() {
        return categoryRepository.findByParentIsNull();
    }

    public List<Category> getSubCategories(@org.springframework.lang.NonNull Long parentId) {
        Category parent = categoryRepository.findById(parentId)
                .orElseThrow(() -> new RuntimeException("Error: Parent category not found with id: " + parentId));
        return categoryRepository.findByParent(parent);
    }

    public Optional<Category> getCategoryById(@org.springframework.lang.NonNull Long id) {
        return categoryRepository.findById(id);
    }

    @Transactional
    public Category createCategory(Category category) {
        if (categoryRepository.findByName(category.getName()).isPresent()) {
            throw new RuntimeException("Error: Category name is already in use!");
        }
        return categoryRepository.save(category);
    }

    @Transactional
    public Category updateCategory(@org.springframework.lang.NonNull Long id, Category categoryDetails) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Error: Category not found with id: " + id));

        category.setName(categoryDetails.getName());
        category.setDescription(categoryDetails.getDescription());
        category.setParent(categoryDetails.getParent());

        return categoryRepository.save(category);
    }

    @SuppressWarnings("null")
    @Transactional
    public void deleteCategory(@org.springframework.lang.NonNull Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Error: Category not found with id: " + id));

        // Before deleting, ensure no children categories or handle them
        List<Category> children = categoryRepository.findByParent(category);
        for (Category child : children) {
            child.setParent(null);
            categoryRepository.save(child);
        }

        categoryRepository.delete(category);
    }
}
