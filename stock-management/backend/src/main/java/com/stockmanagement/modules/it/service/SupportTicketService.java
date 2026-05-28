package com.stockmanagement.modules.it.service;

import com.stockmanagement.modules.it.entity.SupportTicket;
import com.stockmanagement.modules.it.repository.SupportTicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class SupportTicketService {

    private final SupportTicketRepository supportTicketRepository;

    public List<SupportTicket> getTicketsByCompany(Long companyId) {
        return supportTicketRepository.findByCompanyId(companyId);
    }

    public Optional<SupportTicket> getTicketById(Long id) {
        return supportTicketRepository.findById(id);
    }

    @Transactional
    public SupportTicket createTicket(SupportTicket ticket) {
        return supportTicketRepository.save(ticket);
    }

    @Transactional
    public SupportTicket resolveTicket(Long id) {
        SupportTicket ticket = supportTicketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket non trouvé"));
        ticket.setStatus(com.stockmanagement.modules.it.entity.TicketStatus.RESOLVED);
        ticket.setResolvedAt(LocalDateTime.now());
        return supportTicketRepository.save(ticket);
    }

    @Transactional
    public void deleteTicket(Long id) {
        supportTicketRepository.deleteById(id);
    }
}
