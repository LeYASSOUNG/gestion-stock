package com.stockmanagement.modules.restaurant.repository;

import com.stockmanagement.modules.restaurant.entity.RestaurantOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RestaurantOrderRepository extends JpaRepository<RestaurantOrder, Long> {
    List<RestaurantOrder> findByCompanyId(Long companyId);
    List<RestaurantOrder> findByTableId(Long tableId);
}
