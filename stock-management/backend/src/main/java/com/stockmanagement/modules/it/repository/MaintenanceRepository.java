package com.stockmanagement.modules.it.repository;

import com.stockmanagement.modules.it.entity.Maintenance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MaintenanceRepository extends JpaRepository<Maintenance, Long> {
    List<Maintenance> findByCompanyId(Long companyId);
    List<Maintenance> findByEquipmentId(Long equipmentId);
}
