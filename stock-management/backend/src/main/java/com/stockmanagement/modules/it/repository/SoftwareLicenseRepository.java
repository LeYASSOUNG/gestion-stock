package com.stockmanagement.modules.it.repository;

import com.stockmanagement.modules.it.entity.SoftwareLicense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SoftwareLicenseRepository extends JpaRepository<SoftwareLicense, Long> {
    List<SoftwareLicense> findByCompanyId(Long companyId);
}
