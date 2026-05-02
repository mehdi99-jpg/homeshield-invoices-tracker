package com.example.trackinvoices.service;

import com.example.trackinvoices.model.entity.BonDeLivraison;
import com.example.trackinvoices.model.entity.Client;
import com.example.trackinvoices.model.entity.Facture;
import com.example.trackinvoices.model.entity.Passage;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.*;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.OutputStream;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Service
public class ExcelExportService {

    private final PassageService passageService;

    public ExcelExportService(PassageService passageService) {
        this.passageService = passageService;
    }

    // --- Core Export Methods ---

    public void exportFacturesToExcel(List<Facture> factures, OutputStream outputStream) throws IOException {
        try (XSSFWorkbook workbook = new XSSFWorkbook()) {
            writeFacturesSheet(workbook, "Factures", factures);
            workbook.write(outputStream);
        }
    }

    public void exportClientsToExcel(List<Client> clients, OutputStream outputStream) throws IOException {
        try (XSSFWorkbook workbook = new XSSFWorkbook()) {
            XSSFSheet sheet = workbook.createSheet("Clients");
            XSSFCellStyle headerStyle = createHeaderStyle(workbook);
            XSSFCellStyle altStyle = createAltStyle(workbook);
            XSSFCellStyle amountStyle = createAmountStyle(workbook);

            String[] headers = {"Code", "Raison Sociale", "Type", "Ville", "Email", "Téléphone", "Nombre de Factures", "Total Facturé"};
            writeHeader(sheet, headers, headerStyle);

            int rowNum = 1;
            for (Client c : clients) {
                Row row = sheet.createRow(rowNum);
                XSSFCellStyle rowStyle = (rowNum % 2 == 0) ? altStyle : null;
                
                BigDecimal totalInvoiced = c.getFactures().stream()
                        .map(Facture::getTotalTTC)
                        .reduce(BigDecimal.ZERO, BigDecimal::add);

                createStringCell(row, 0, c.getCodeClient(), rowStyle);
                createStringCell(row, 1, c.getRaisonSociale(), rowStyle);
                createStringCell(row, 2, c.getTypeClient() != null ? c.getTypeClient().getLibelle() : "", rowStyle);
                createStringCell(row, 3, c.getVille(), rowStyle);
                createStringCell(row, 4, c.getEmail(), rowStyle);
                createStringCell(row, 5, c.getTelephone(), rowStyle);
                createNumericCell(row, 6, BigDecimal.valueOf(c.getFactures().size()), null, rowStyle);
                createNumericCell(row, 7, totalInvoiced, amountStyle, rowStyle);

                rowNum++;
            }
            finalizeSheet(sheet, headers.length);
            workbook.write(outputStream);
        }
    }

    public void exportBLsToExcel(List<BonDeLivraison> bls, OutputStream outputStream) throws IOException {
        try (XSSFWorkbook workbook = new XSSFWorkbook()) {
            XSSFSheet sheet = workbook.createSheet("Bons de Livraison");
            XSSFCellStyle headerStyle = createHeaderStyle(workbook);
            XSSFCellStyle altStyle = createAltStyle(workbook);
            XSSFCellStyle dateStyle = createDateStyle(workbook);

            String[] headers = {"N° BL", "Facture associée", "Client", "Date Émission", "Date Livraison", "Statut", "Adresse Livraison"};
            writeHeader(sheet, headers, headerStyle);

            int rowNum = 1;
            for (BonDeLivraison bl : bls) {
                Row row = sheet.createRow(rowNum);
                XSSFCellStyle rowStyle = (rowNum % 2 == 0) ? altStyle : null;

                createStringCell(row, 0, bl.getNumeroBL(), rowStyle);
                createStringCell(row, 1, bl.getFacture() != null ? bl.getFacture().getNumeroFacture() : "", rowStyle);
                createStringCell(row, 2, bl.getFacture() != null && bl.getFacture().getClient() != null ? bl.getFacture().getClient().getRaisonSociale() : "", rowStyle);
                
                Cell cellDateEm = row.createCell(3);
                if (bl.getDateEmission() != null) {
                    cellDateEm.setCellValue(java.sql.Date.valueOf(bl.getDateEmission()));
                    cellDateEm.setCellStyle(dateStyle);
                }
                
                Cell cellDateLiv = row.createCell(4);
                if (bl.getDateLivraison() != null) {
                    cellDateLiv.setCellValue(java.sql.Date.valueOf(bl.getDateLivraison()));
                    cellDateLiv.setCellStyle(dateStyle);
                }

                createStringCell(row, 5, bl.getStatutLivraison() != null ? bl.getStatutLivraison().getLibelle() : "", rowStyle);
                createStringCell(row, 6, bl.getAdresseLivraison(), rowStyle);

                rowNum++;
            }
            finalizeSheet(sheet, headers.length);
            workbook.write(outputStream);
        }
    }

    // --- Reports ---

    public void exportMonthlyReport(List<Facture> factures, List<Passage> passages, OutputStream outputStream) throws IOException {
        try (XSSFWorkbook workbook = new XSSFWorkbook()) {
            // Sheet 1: Invoices
            XSSFSheet sheet1 = writeFacturesSheet(workbook, "Factures", factures);
            
            // Add summary row at the bottom of sheet 1
            int lastRow = factures.size() + 1;
            Row summaryRow = sheet1.createRow(lastRow);
            XSSFCellStyle boldStyle = workbook.createCellStyle();
            Font boldFont = workbook.createFont();
            boldFont.setBold(true);
            boldStyle.setFont(boldFont);
            
            summaryRow.createCell(0).setCellValue("TOTAL");
            summaryRow.getCell(0).setCellStyle(boldStyle);
            
            BigDecimal totalHT = factures.stream().map(Facture::getTotalHT).reduce(BigDecimal.ZERO, BigDecimal::add);
            BigDecimal totalTVA = factures.stream().map(Facture::getTotalTVA).reduce(BigDecimal.ZERO, BigDecimal::add);
            BigDecimal totalTTC = factures.stream().map(Facture::getTotalTTC).reduce(BigDecimal.ZERO, BigDecimal::add);
            
            XSSFCellStyle amountStyle = createAmountStyle(workbook);
            amountStyle.setFont(boldFont);
            
            Cell cellHT = summaryRow.createCell(5);
            cellHT.setCellValue(totalHT.doubleValue());
            cellHT.setCellStyle(amountStyle);
            
            Cell cellTVA = summaryRow.createCell(6);
            cellTVA.setCellValue(totalTVA.doubleValue());
            cellTVA.setCellStyle(amountStyle);
            
            Cell cellTTC = summaryRow.createCell(7);
            cellTTC.setCellValue(totalTTC.doubleValue());
            cellTTC.setCellStyle(amountStyle);

            // Sheet 2: Passages
            writePassagesSheet(workbook, "Suivi Passages", passages);

            workbook.write(outputStream);
        }
    }

    public void exportAnnualReport(Map<String, Object> annualData, OutputStream outputStream) throws IOException {
        try (XSSFWorkbook workbook = new XSSFWorkbook()) {
            XSSFSheet sheet = workbook.createSheet("Rapport Annuel");
            XSSFCellStyle headerStyle = createHeaderStyle(workbook);
            
            // Monthly Revenue breakdown
            String[] revHeaders = {"Mois", "Chiffre d'Affaires (TTC)"};
            writeHeader(sheet, revHeaders, headerStyle);
            
            String[] months = {"Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"};
            BigDecimal[] revData = (BigDecimal[]) annualData.get("monthlyRevenue");
            XSSFCellStyle amountStyle = createAmountStyle(workbook);
            
            int rowNum = 1;
            for (int i = 0; i < 12; i++) {
                Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(months[i]);
                Cell cell = row.createCell(1);
                cell.setCellValue(revData[i].doubleValue());
                cell.setCellStyle(amountStyle);
            }
            
            rowNum++;
            Row totalRow = sheet.createRow(rowNum++);
            totalRow.createCell(0).setCellValue("TOTAL ANNUEL");
            Cell totalCell = totalRow.createCell(1);
            totalCell.setCellValue(((BigDecimal) annualData.get("totalYear")).doubleValue());
            totalCell.setCellStyle(amountStyle);

            finalizeSheet(sheet, 2);
            workbook.write(outputStream);
        }
    }

    public void exportCustomReport(List<Facture> factures, List<Passage> passages, List<BonDeLivraison> bls, List<Client> clients, OutputStream outputStream) throws IOException {
        try (XSSFWorkbook workbook = new XSSFWorkbook()) {
            if (factures != null) writeFacturesSheet(workbook, "Factures", factures);
            if (passages != null) writePassagesSheet(workbook, "Passages", passages);
            if (bls != null) {
                XSSFSheet sheet = workbook.createSheet("Bons de Livraison");
                XSSFCellStyle headerStyle = createHeaderStyle(workbook);
                XSSFCellStyle altStyle = createAltStyle(workbook);
                XSSFCellStyle dateStyle = createDateStyle(workbook);
                String[] headers = {"N° BL", "Facture", "Client", "Date Emission", "Statut"};
                writeHeader(sheet, headers, headerStyle);
                int rowNum = 1;
                for (BonDeLivraison bl : bls) {
                    Row row = sheet.createRow(rowNum);
                    XSSFCellStyle rowStyle = (rowNum % 2 == 0) ? altStyle : null;
                    createStringCell(row, 0, bl.getNumeroBL(), rowStyle);
                    createStringCell(row, 1, bl.getFacture() != null ? bl.getFacture().getNumeroFacture() : "", rowStyle);
                    createStringCell(row, 2, bl.getFacture() != null && bl.getFacture().getClient() != null ? bl.getFacture().getClient().getRaisonSociale() : "", rowStyle);
                    Cell cDate = row.createCell(3);
                    if (bl.getDateEmission() != null) {
                        cDate.setCellValue(java.sql.Date.valueOf(bl.getDateEmission()));
                        cDate.setCellStyle(dateStyle);
                    }
                    createStringCell(row, 4, bl.getStatutLivraison() != null ? bl.getStatutLivraison().getLibelle() : "", rowStyle);
                    rowNum++;
                }
                finalizeSheet(sheet, headers.length);
            }
            if (clients != null) {
                XSSFSheet sheet = workbook.createSheet("Résumé Clients");
                XSSFCellStyle headerStyle = createHeaderStyle(workbook);
                XSSFCellStyle altStyle = createAltStyle(workbook);
                XSSFCellStyle amountStyle = createAmountStyle(workbook);
                String[] headers = {"Code", "Raison Sociale", "Ville", "Total Facturé"};
                writeHeader(sheet, headers, headerStyle);
                int rowNum = 1;
                for (Client c : clients) {
                    Row row = sheet.createRow(rowNum);
                    XSSFCellStyle rowStyle = (rowNum % 2 == 0) ? altStyle : null;
                    BigDecimal total = c.getFactures().stream().map(Facture::getTotalTTC).reduce(BigDecimal.ZERO, BigDecimal::add);
                    createStringCell(row, 0, c.getCodeClient(), rowStyle);
                    createStringCell(row, 1, c.getRaisonSociale(), rowStyle);
                    createStringCell(row, 2, c.getVille(), rowStyle);
                    createNumericCell(row, 3, total, amountStyle, rowStyle);
                    rowNum++;
                }
                finalizeSheet(sheet, headers.length);
            }
            workbook.write(outputStream);
        }
    }

    // --- Helper Sheet Writers ---

    private XSSFSheet writeFacturesSheet(XSSFWorkbook workbook, String name, List<Facture> factures) {
        XSSFSheet sheet = workbook.createSheet(name);
        XSSFCellStyle headerStyle = createHeaderStyle(workbook);
        XSSFCellStyle altStyle = createAltStyle(workbook);
        XSSFCellStyle amountStyle = createAmountStyle(workbook);
        XSSFCellStyle dateStyle = createDateStyle(workbook);

        String[] headers = {
            "N° Facture", "Client", "Type Client", "Ville",
            "Date", "Montant HT", "TVA", "Montant TTC",
            "Statut", "Mode Règlement", "Date Règlement", "Passages Effectués"
        };
        writeHeader(sheet, headers, headerStyle);

        int rowNum = 1;
        for (Facture f : factures) {
            Row row = sheet.createRow(rowNum);
            XSSFCellStyle rowStyle = (rowNum % 2 == 0) ? altStyle : null;

            createStringCell(row, 0, f.getNumeroFacture(), rowStyle);
            createStringCell(row, 1, f.getClient() != null ? f.getClient().getRaisonSociale() : "", rowStyle);
            createStringCell(row, 2, f.getClient() != null && f.getClient().getTypeClient() != null ? f.getClient().getTypeClient().getLibelle() : "", rowStyle);
            createStringCell(row, 3, f.getClient() != null ? f.getClient().getVille() : "", rowStyle);

            Cell dateCell = row.createCell(4);
            if (f.getDateProposition() != null) {
                dateCell.setCellValue(java.sql.Date.valueOf(f.getDateProposition()));
                dateCell.setCellStyle(dateStyle);
            }

            createNumericCell(row, 5, f.getTotalHT(), amountStyle, rowStyle);
            createNumericCell(row, 6, f.getTotalTVA(), amountStyle, rowStyle);
            createNumericCell(row, 7, f.getTotalTTC(), amountStyle, rowStyle);

            createStringCell(row, 8, f.getStatutFacture() != null ? f.getStatutFacture().getLibelle() : "", rowStyle);
            createStringCell(row, 9, f.getModeReglement() != null ? f.getModeReglement().getLibelle() : "", rowStyle);

            Cell dateReglCell = row.createCell(10);
            if (f.getDateReglement() != null) {
                dateReglCell.setCellValue(java.sql.Date.valueOf(f.getDateReglement()));
                dateReglCell.setCellStyle(dateStyle);
            }

            createNumericCell(row, 11, BigDecimal.valueOf(passageService.countEffectuesByFacture(f)), null, rowStyle);

            rowNum++;
        }
        finalizeSheet(sheet, headers.length);
        return sheet;
    }

    private void writePassagesSheet(XSSFWorkbook workbook, String name, List<Passage> passages) {
        XSSFSheet sheet = workbook.createSheet(name);
        XSSFCellStyle headerStyle = createHeaderStyle(workbook);
        XSSFCellStyle altStyle = createAltStyle(workbook);
        XSSFCellStyle dateStyle = createDateStyle(workbook);

        String[] headers = {"Facture N°", "Client", "N° Passage", "Date", "Heure", "Technicien", "Zones Traitées", "Statut"};
        writeHeader(sheet, headers, headerStyle);

        int rowNum = 1;
        for (Passage p : passages) {
            Row row = sheet.createRow(rowNum);
            XSSFCellStyle rowStyle = (rowNum % 2 == 0) ? altStyle : null;

            createStringCell(row, 0, p.getFacture() != null ? p.getFacture().getNumeroFacture() : "", rowStyle);
            createStringCell(row, 1, p.getFacture() != null && p.getFacture().getClient() != null ? p.getFacture().getClient().getRaisonSociale() : "", rowStyle);
            createNumericCell(row, 2, BigDecimal.valueOf(p.getNumeroPassage()), null, rowStyle);
            
            Cell cellDate = row.createCell(3);
            if (p.getDatePassage() != null) {
                cellDate.setCellValue(java.sql.Date.valueOf(p.getDatePassage()));
                cellDate.setCellStyle(dateStyle);
            }
            
            createStringCell(row, 4, p.getHeurePrise() != null ? p.getHeurePrise().toString() : "", rowStyle);
            createStringCell(row, 5, p.getTechnicien(), rowStyle);
            createStringCell(row, 6, p.getZonesTraitees(), rowStyle);
            createStringCell(row, 7, p.getStatutPassage() != null ? p.getStatutPassage().getLibelle() : "", rowStyle);

            rowNum++;
        }
        finalizeSheet(sheet, headers.length);
    }

    // --- Style Helpers ---

    private XSSFCellStyle createHeaderStyle(XSSFWorkbook workbook) {
        XSSFCellStyle style = workbook.createCellStyle();
        style.setFillForegroundColor(new XSSFColor(new byte[]{(byte) 33, (byte) 89, (byte) 60}, null));
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setBorderBottom(BorderStyle.THIN);
        XSSFFont font = workbook.createFont();
        font.setBold(true);
        font.setColor(IndexedColors.WHITE.getIndex());
        font.setFontHeightInPoints((short) 11);
        style.setFont(font);
        return style;
    }

    private XSSFCellStyle createAltStyle(XSSFWorkbook workbook) {
        XSSFCellStyle style = workbook.createCellStyle();
        style.setFillForegroundColor(new XSSFColor(new byte[]{(byte) 235, (byte) 245, (byte) 235}, null));
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        return style;
    }

    private XSSFCellStyle createAmountStyle(XSSFWorkbook workbook) {
        XSSFCellStyle style = workbook.createCellStyle();
        style.setDataFormat(workbook.createDataFormat().getFormat("#,##0.00"));
        return style;
    }

    private XSSFCellStyle createDateStyle(XSSFWorkbook workbook) {
        XSSFCellStyle style = workbook.createCellStyle();
        style.setDataFormat(workbook.createDataFormat().getFormat("dd/mm/yyyy"));
        return style;
    }

    private void writeHeader(XSSFSheet sheet, String[] headers, XSSFCellStyle style) {
        Row headerRow = sheet.createRow(0);
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(style);
        }
        headerRow.setHeightInPoints(20);
    }

    private void finalizeSheet(XSSFSheet sheet, int columnCount) {
        for (int i = 0; i < columnCount; i++) {
            sheet.autoSizeColumn(i);
            sheet.setColumnWidth(i, sheet.getColumnWidth(i) + 512);
        }
        sheet.createFreezePane(0, 1);
    }

    private void createStringCell(Row row, int col, String value, XSSFCellStyle style) {
        Cell cell = row.createCell(col);
        cell.setCellValue(value != null ? value : "");
        if (style != null) cell.setCellStyle(style);
    }

    private void createNumericCell(Row row, int col, BigDecimal value, XSSFCellStyle amountStyle, XSSFCellStyle rowStyle) {
        Cell cell = row.createCell(col);
        cell.setCellValue(value != null ? value.doubleValue() : 0.0);
        if (amountStyle != null) cell.setCellStyle(amountStyle);
        else if (rowStyle != null) cell.setCellStyle(rowStyle);
    }
}
