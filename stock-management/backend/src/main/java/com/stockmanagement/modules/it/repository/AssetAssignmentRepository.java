package com.stockmanagement.modules.it.repository;

import com.stockmanagement.modules.it.entity.AssetAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AssetAssignmentRepository extends JpaRepository<AssetAssignment, Long> {
    List<AssetAssignment> findByCompanyId(Long companyId);
    List<AssetAssignment> findByAssignedToId(Long userId);
}
