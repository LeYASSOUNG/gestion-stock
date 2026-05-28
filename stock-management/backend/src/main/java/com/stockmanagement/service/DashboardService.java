package com.stockmanagement.service;

import com.stockmanagement.repository.*;
import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

/**
 * Service pour les indicateurs du tableau de bord.
 * Calcule les KPIs (nombre de produits, entrepôts, alertes de stock, etc.) et
 * les valeurs totales du stock.
 */
@Service
@RequiredArgsConstructor
public class DashboardService {
    private final ProductRepository productRepository;
    private final StockRepository stockRepository;
    private final WarehouseRepository warehouseRepository;
    private final SupplierRepository supplierRepository;
    private final StockMovementRepository movementRepository;

    public Map<String, Object> getKPIs() {
        Map<String, Object> kpis = new HashMap<>();

        kpis.put("totalProducts", productRepository.count());
        kpis.put("totalWarehouses", warehouseRepository.count());
        kpis.put("totalSuppliers", supplierRepository.count());
        kpis.put("lowStockProducts", productRepository.findLowStockProducts().size());

        // Total stock value
        BigDecimal totalValue = calculateTotalStockValue();
        kpis.put("totalStockValue", totalValue);

        // Recent movements count (last 30 days)
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        kpis.put("recentMovements", movementRepository.countByCreatedAtAfter(thirtyDaysAgo));

        return kpis;
    }

    private BigDecimal calculateTotalStockValue() {
        return stockRepository.findAll().stream()
                .filter(stock -> stock.getProduct() != null)
                .map(stock -> {
                    BigDecimal price = stock.getProduct().getPrice();
                    if (price == null) {
                        price = BigDecimal.ZERO;
                    }
                    Integer quantity = stock.getQuantity();
                    if (quantity == null) {
                        quantity = 0;
                    }
                    return price.multiply(new BigDecimal(quantity));
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public Map<String, Object> getStockAlerts() {
        Map<String, Object> alerts = new HashMap<>();
        java.util.List<Map<String, Object>> lowStockList = productRepository.findLowStockProducts().stream()
                .map(product -> {
                    Map<String, Object> item = new HashMap<>();
                    item.put("id", product.getId());
                    item.put("sku", product.getSku());
                    item.put("name", product.getName());
                    item.put("minStockAlert", product.getMinStockAlert());
                    item.put("unit", product.getUnit());
                    Integer totalStock = stockRepository.getTotalStockForProduct(product);
                    item.put("currentQuantity", totalStock != null ? totalStock : 0);
                    return item;
                })
                .collect(java.util.stream.Collectors.toList());
        alerts.put("lowStock", lowStockList);
        return alerts;
    }
}
