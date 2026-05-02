package com.example.trackinvoices.controller.api;

import com.example.trackinvoices.model.entity.Client;
import com.example.trackinvoices.model.enums.StatutFacture;
import com.example.trackinvoices.repository.BonDeLivraisonRepository;
import com.example.trackinvoices.repository.ClientRepository;
import com.example.trackinvoices.repository.FactureRepository;
import com.example.trackinvoices.service.ExcelExportService;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api/exports")
public class ApiExportController {

    private final ExcelExportService excelExportService;
    private final FactureRepository factureRepository;
    private final ClientRepository clientRepository;
    private final BonDeLivraisonRepository blRepository;

    public ApiExportController(ExcelExportService excelExportService, FactureRepository factureRepository,
                               ClientRepository clientRepository, BonDeLivraisonRepository blRepository) {
        this.excelExportService = excelExportService;
        this.factureRepository = factureRepository;
        this.clientRepository = clientRepository;
        this.blRepository = blRepository;
    }

    @GetMapping("/factures-excel")
    public void exportAllFactures(HttpServletResponse response) throws IOException {
        var factures = factureRepository.findAll();
        response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        response.setHeader("Content-Disposition", "attachment; filename=\"export_factures_" + LocalDate.now() + ".xlsx\"");
        excelExportService.exportFacturesToExcel(factures, response.getOutputStream());
        response.getOutputStream().flush();
    }

    @GetMapping("/factures-filtrees")
    public void exportFilteredFactures(@RequestParam(required = false) String statut, HttpServletResponse response) throws IOException {
        var factures = factureRepository.findAll();
        if (statut != null && !statut.isEmpty()) {
            try {
                StatutFacture sf = StatutFacture.valueOf(statut);
                factures = factures.stream().filter(f -> f.getStatutFacture() == sf).toList();
            } catch (Exception ignored) {}
        }
        response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        response.setHeader("Content-Disposition", "attachment; filename=\"export_factures_filtrees_" + LocalDate.now() + ".xlsx\"");
        excelExportService.exportFacturesToExcel(factures, response.getOutputStream());
        response.getOutputStream().flush();
    }

    @GetMapping("/clients-excel")
    public void exportAllClients(HttpServletResponse response) throws IOException {
        var clients = clientRepository.findAllByOrderByRaisonSocialeAsc();
        response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        response.setHeader("Content-Disposition", "attachment; filename=\"export_clients_" + LocalDate.now() + ".xlsx\"");
        excelExportService.exportClientsToExcel(clients, response.getOutputStream());
        response.getOutputStream().flush();
    }

    @GetMapping("/bons-de-livraison-excel")
    public void exportAllBLs(HttpServletResponse response) throws IOException {
        var bls = blRepository.findAll();
        response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        response.setHeader("Content-Disposition", "attachment; filename=\"export_bls_" + LocalDate.now() + ".xlsx\"");
        excelExportService.exportBLsToExcel(bls, response.getOutputStream());
        response.getOutputStream().flush();
    }

    @GetMapping("/clients-rapport")
    public List<Map<String, Object>> getClientsForRapport() {
        var clients = clientRepository.findAllByOrderByRaisonSocialeAsc();
        List<Map<String, Object>> result = new ArrayList<>();
        for (Client c : clients) {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("id", c.getId());
            map.put("raisonSociale", c.getRaisonSociale());
            map.put("code", c.getCodeClient());
            int nbFactures = c.getFactures() != null ? c.getFactures().size() : 0;
            BigDecimal total = BigDecimal.ZERO;
            if (c.getFactures() != null) {
                for (var f : c.getFactures()) {
                    total = total.add(f.getTotalTTC() != null ? f.getTotalTTC() : BigDecimal.ZERO);
                }
            }
            map.put("nombreFactures", nbFactures);
            map.put("totalFacture", total);
            result.add(map);
        }
        return result;
    }
}
