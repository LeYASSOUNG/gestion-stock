package com.stockmanagement.modules.it.entity;

import com.stockmanagement.entity.Company;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDate;

@Entity
@Table(name = "it_software_licenses")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SoftwareLicense {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String softwareName;

    private String licenseKey;
    private int totalSeats;
    private int usedSeats;

    private LocalDate expirationDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;
}
