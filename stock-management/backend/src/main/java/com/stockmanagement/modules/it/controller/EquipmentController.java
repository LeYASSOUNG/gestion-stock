package com.stockmanagement.modules.it.controller;

import com.stockmanagement.modules.it.entity.Equipment;
import com.stockmanagement.modules.it.service.EquipmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/modules/it/equipments")
@RequiredArgsConstructor
public class EquipmentController {

    private final EquipmentService equipmentService;

    @GetMapping("/company/{companyId}")
    public ResponseEntity<List<Equipment>> getAllEquipments(@PathVariable Long companyId) {
        return ResponseEntity.ok(equipmentService.getAllEquipmentsByCompany(companyId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Equipment> getEquipmentById(@PathVariable Long id) {
        return equipmentService.getEquipmentById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Equipment> createEquipment(@RequestBody Equipment equipment) {
        return ResponseEntity.ok(equipmentService.saveEquipment(equipment));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Equipment> updateEquipment(@PathVariable Long id, @RequestBody Equipment equipmentDetails) {
        return equipmentService.getEquipmentById(id)
                .map(equipment -> {
                    equipment.setName(equipmentDetails.getName());
                    equipment.setBrand(equipmentDetails.getBrand());
                    equipment.setModel(equipmentDetails.getModel());
                    equipment.setSerialNumber(equipmentDetails.getSerialNumber());
                    equipment.setStatus(equipmentDetails.getStatus());
                    return ResponseEntity.ok(equipmentService.saveEquipment(equipment));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEquipment(@PathVariable Long id) {
        equipmentService.deleteEquipment(id);
        return ResponseEntity.ok().build();
    }
}
