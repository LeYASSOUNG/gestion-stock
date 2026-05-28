package com.stockmanagement.modules.pharmacy.repository;

import com.stockmanagement.modules.pharmacy.entity.MedicationBatch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MedicationBatchRepository extends JpaRepository<MedicationBatch, Long> {
    List<MedicationBatch> findByCompanyId(Long companyId);
    List<MedicationBatch> findByProductId(Long productId);
}
