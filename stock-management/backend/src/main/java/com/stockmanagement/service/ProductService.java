package com.stockmanagement.service;

import com.stockmanagement.entity.Product;
import com.stockmanagement.entity.Category;
import com.stockmanagement.entity.Supplier;
import com.stockmanagement.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

/**
 * Service gérant la logique métier des produits.
 * Effectue les opérations CRUD, la gestion des stocks bas et les recherches par
 * catégorie/fournisseur.
 */
@Service
@RequiredArgsConstructor
public class ProductService {
    private final ProductRepository productRepository;

    @Transactional
    public Product createProduct(Product product) {
        if (productRepository.existsBySku(product.getSku())) {
            throw new RuntimeException("SKU already exists");
        }
        return productRepository.save(product);
    }

    public Product getProductById(@org.springframework.lang.NonNull Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
    }

    public Product getProductBySku(String sku) {
        return productRepository.findBySku(sku)
                .orElseThrow(() -> new RuntimeException("Product not found"));
    }

    public List<Product> getAllProducts() {
        return productRepository.findByActiveTrue();
    }

    @Transactional
    public Product updateProduct(@org.springframework.lang.NonNull Long id, Product productDetails) {
        Product product = getProductById(id);
        product.setName(productDetails.getName());
        product.setDescription(productDetails.getDescription());
        product.setPrice(productDetails.getPrice());
        product.setMinStockAlert(productDetails.getMinStockAlert());
        product.setMaxStockAlert(productDetails.getMaxStockAlert());
        product.setUnit(productDetails.getUnit());
        product.setCategory(productDetails.getCategory());
        product.setSupplier(productDetails.getSupplier());
        product.setImageUrl(productDetails.getImageUrl());
        return productRepository.save(product);
    }

    @Transactional
    public void deleteProduct(@org.springframework.lang.NonNull Long id) {
        Product product = getProductById(id);
        product.setActive(false);
        productRepository.save(product);
    }

    public List<Product> getLowStockProducts() {
        return productRepository.findLowStockProducts();
    }

    public List<Product> getProductsByCategory(Category category) {
        return productRepository.findByCategory(category);
    }

    public List<Product> getProductsBySupplier(Supplier supplier) {
        return productRepository.findBySupplier(supplier);
    }

    public org.springframework.data.domain.Page<Product> getProductsPaginatedAndSearched(String search, int page, int size) {
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size);
        if (search != null && !search.trim().isEmpty()) {
            return productRepository.findByNameOrSkuContaining(search, search, pageable);
        }
        return productRepository.findByActiveTrue(pageable);
    }
}
