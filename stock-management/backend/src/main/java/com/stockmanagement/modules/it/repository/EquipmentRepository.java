package com.stockmanagement.modules.it.repository;

import com.stockmanagement.modules.it.entity.Equipment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EquipmentRepository extends JpaRepository<Equipment, Long> {
    List<Equipment> findByCompanyId(Long companyId);
}
