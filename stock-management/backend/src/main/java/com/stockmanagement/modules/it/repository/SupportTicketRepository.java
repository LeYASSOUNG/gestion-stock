package com.stockmanagement.modules.it.repository;

import com.stockmanagement.modules.it.entity.SupportTicket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SupportTicketRepository extends JpaRepository<SupportTicket, Long> {
    List<SupportTicket> findByCompanyId(Long companyId);
    List<SupportTicket> findByAssignedToId(Long userId);
    List<SupportTicket> findByReportedById(Long userId);
}
