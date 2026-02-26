package com.stockmanagement.service;

import com.stockmanagement.entity.Product;
import com.stockmanagement.entity.Stock;
import com.stockmanagement.repository.ProductRepository;
import com.stockmanagement.repository.StockRepository;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;

/**
 * Service pour l'exportation des données.
 * Permet de générer des fichiers Excel pour les produits et l'état des stocks à
 * l'aide d'Apache POI.
 */
@Service
@RequiredArgsConstructor
public class ExportService {
    private final ProductRepository productRepository;
    private final StockRepository stockRepository;

    public byte[] exportProductsToExcel() throws IOException {
        List<Product> products = productRepository.findAll();

        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Products");

            // Header
            Row headerRow = sheet.createRow(0);
            String[] columns = { "ID", "SKU", "Name", "Description", "Price", "Unit", "Category", "Supplier",
                    "Min Stock", "Max Stock" };
            for (int i = 0; i < columns.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(columns[i]);
                cell.setCellStyle(createHeaderCellStyle(workbook));
            }

            // Data
            int rowNum = 1;
            for (Product product : products) {
                Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(product.getId());
                row.createCell(1).setCellValue(product.getSku());
                row.createCell(2).setCellValue(product.getName());
                row.createCell(3).setCellValue(product.getDescription());
                row.createCell(4).setCellValue(product.getPrice() != null ? product.getPrice().doubleValue() : 0);
                row.createCell(5).setCellValue(product.getUnit());
                row.createCell(6).setCellValue(product.getCategory() != null ? product.getCategory().getName() : "");
                row.createCell(7).setCellValue(product.getSupplier() != null ? product.getSupplier().getName() : "");
                row.createCell(8).setCellValue(product.getMinStockAlert());
                row.createCell(9).setCellValue(product.getMaxStockAlert());
            }

            // Auto-size columns
            for (int i = 0; i < columns.length; i++) {
                sheet.autoSizeColumn(i);
            }

            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            workbook.write(outputStream);
            return outputStream.toByteArray();
        }
    }

    public byte[] exportStockToExcel() throws IOException {
        List<Stock> stocks = stockRepository.findAll();

        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Stock");

            // Header
            Row headerRow = sheet.createRow(0);
            String[] columns = { "Product SKU", "Product Name", "Warehouse", "Quantity", "Reserved", "Location" };
            for (int i = 0; i < columns.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(columns[i]);
                cell.setCellStyle(createHeaderCellStyle(workbook));
            }

            // Data
            int rowNum = 1;
            for (Stock stock : stocks) {
                Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(stock.getProduct().getSku());
                row.createCell(1).setCellValue(stock.getProduct().getName());
                row.createCell(2).setCellValue(stock.getWarehouse().getName());
                row.createCell(3).setCellValue(stock.getQuantity());
                row.createCell(4).setCellValue(stock.getReservedQuantity());
                row.createCell(5).setCellValue(stock.getLocation() != null ? stock.getLocation() : "");
            }

            // Auto-size columns
            for (int i = 0; i < columns.length; i++) {
                sheet.autoSizeColumn(i);
            }

            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            workbook.write(outputStream);
            return outputStream.toByteArray();
        }
    }

    private CellStyle createHeaderCellStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        style.setFont(font);
        style.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        return style;
    }
}
