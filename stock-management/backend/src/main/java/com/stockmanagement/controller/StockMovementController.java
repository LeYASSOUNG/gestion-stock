package com.stockmanagement.controller;

import com.stockmanagement.entity.StockMovement;
import com.stockmanagement.entity.User;
import com.stockmanagement.repository.UserRepository;
import com.stockmanagement.service.StockMovementService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Contrôleur REST pour la gestion des mouvements de stock.
 */
@RestController
@RequestMapping("/api/movements")
@RequiredArgsConstructor
public class StockMovementController {

    private final StockMovementService movementService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<StockMovement>> getAllMovements() {
        return ResponseEntity.ok(movementService.getMovementsByDateRange(
                java.time.LocalDateTime.now().minusYears(1),
                java.time.LocalDateTime.now()));
    }

    @PostMapping("/entry")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'OPERATOR')")
    public ResponseEntity<StockMovement> createEntry(@RequestBody StockMovement movement) {
        movement.setCreatedBy(getCurrentUser());
        return ResponseEntity.ok(movementService.createEntry(movement));
    }

    @PostMapping("/exit")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'OPERATOR')")
    public ResponseEntity<StockMovement> createExit(@RequestBody StockMovement movement) {
        movement.setCreatedBy(getCurrentUser());
        return ResponseEntity.ok(movementService.createExit(movement));
    }

    @PostMapping("/transfer")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'OPERATOR')")
    public ResponseEntity<StockMovement> createTransfer(@RequestBody StockMovement movement) {
        movement.setCreatedBy(getCurrentUser());
        return ResponseEntity.ok(movementService.createTransfer(movement));
    }

    @PostMapping("/adjustment")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<StockMovement> createAdjustment(@RequestBody StockMovement movement) {
        movement.setCreatedBy(getCurrentUser());
        return ResponseEntity.ok(movementService.createAdjustment(movement));
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
