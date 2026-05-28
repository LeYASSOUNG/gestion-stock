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

    public byte[] exportProductsToPdf() {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            com.lowagie.text.Document document = new com.lowagie.text.Document();
            com.lowagie.text.pdf.PdfWriter.getInstance(document, baos);
            document.open();

            document.add(new com.lowagie.text.Paragraph("Rapport des Produits - Systeme de Gestion de Stock"));
            document.add(new com.lowagie.text.Paragraph(" "));

            com.lowagie.text.pdf.PdfPTable table = new com.lowagie.text.pdf.PdfPTable(6);
            table.setWidthPercentage(100);
            table.addCell("SKU");
            table.addCell("Nom");
            table.addCell("Prix");
            table.addCell("Unite");
            table.addCell("Categorie");
            table.addCell("Seuil Min");

            List<Product> products = productRepository.findAll();
            for (Product product : products) {
                table.addCell(product.getSku());
                table.addCell(product.getName());
                table.addCell(product.getPrice() != null ? product.getPrice().toString() : "0.00");
                table.addCell(product.getUnit() != null ? product.getUnit() : "");
                table.addCell(product.getCategory() != null ? product.getCategory().getName() : "");
                table.addCell(String.valueOf(product.getMinStockAlert()));
            }

            document.add(table);
            document.close();
            return baos.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Erreur de generation PDF", e);
        }
    }

    public byte[] exportStockToPdf() {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            com.lowagie.text.Document document = new com.lowagie.text.Document();
            com.lowagie.text.pdf.PdfWriter.getInstance(document, baos);
            document.open();

            document.add(new com.lowagie.text.Paragraph("Rapport de l'Etat des Stocks"));
            document.add(new com.lowagie.text.Paragraph(" "));

            com.lowagie.text.pdf.PdfPTable table = new com.lowagie.text.pdf.PdfPTable(5);
            table.setWidthPercentage(100);
            table.addCell("SKU");
            table.addCell("Produit");
            table.addCell("Entrepot");
            table.addCell("Quantite");
            table.addCell("Localisation");

            List<Stock> stocks = stockRepository.findAll();
            for (Stock stock : stocks) {
                table.addCell(stock.getProduct().getSku());
                table.addCell(stock.getProduct().getName());
                table.addCell(stock.getWarehouse().getName());
                table.addCell(String.valueOf(stock.getQuantity()));
                table.addCell(stock.getLocation() != null ? stock.getLocation() : "");
            }

            document.add(table);
            document.close();
            return baos.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Erreur de generation PDF", e);
        }
    }
}
