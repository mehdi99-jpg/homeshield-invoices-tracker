package com.example.trackinvoices.controller;

import com.example.trackinvoices.model.entity.BonDeLivraison;
import com.example.trackinvoices.model.entity.Client;
import com.example.trackinvoices.model.entity.Facture;
import com.example.trackinvoices.model.entity.Passage;
import com.example.trackinvoices.model.enums.StatutFacture;
import com.example.trackinvoices.repository.BonDeLivraisonRepository;
import com.example.trackinvoices.repository.ClientRepository;
import com.example.trackinvoices.repository.FactureRepository;
import com.example.trackinvoices.repository.PassageRepository;
import com.example.trackinvoices.service.ExcelExportService;
import com.example.trackinvoices.service.FactureService;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Controller
@RequestMapping("/export")
public class ExportController {

    private final ExcelExportService excelExportService;
    private final FactureService factureService;
    private final FactureRepository factureRepository;
    private final ClientRepository clientRepository;
    private final BonDeLivraisonRepository blRepository;
    private final PassageRepository passageRepository;

    public ExportController(ExcelExportService excelExportService, FactureService factureService,
                            FactureRepository factureRepository, ClientRepository clientRepository,
                            BonDeLivraisonRepository blRepository, PassageRepository passageRepository) {
        this.excelExportService = excelExportService;
        this.factureService = factureService;
        this.factureRepository = factureRepository;
        this.clientRepository = clientRepository;
        this.blRepository = blRepository;
        this.passageRepository = passageRepository;
    }

    @GetMapping
    public String showExportHub(Model model) {
        model.addAttribute("activePage", "export");
        model.addAttribute("clients", clientRepository.findAllByOrderByRaisonSocialeAsc());
        model.addAttribute("statuts", StatutFacture.values());
        model.addAttribute("currentYear", LocalDate.now().getYear());
        return "export";
    }

    @GetMapping("/factures/excel")
    public void exportFactures(
            @RequestParam(required = false) StatutFacture statut,
            @RequestParam(required = false) String start,
            @RequestParam(required = false) String end,
            HttpServletResponse response) throws IOException {
        
        LocalDate startDate = (start != null && !start.isEmpty()) ? LocalDate.parse(start) : LocalDate.of(2000, 1, 1);
        LocalDate endDate = (end != null && !end.isEmpty()) ? LocalDate.parse(end) : LocalDate.now().plusYears(1);
        
        List<Facture> factures = factureRepository.findByDatePropositionBetween(startDate, endDate);
        if (statut != null) {
            factures = factures.stream().filter(f -> f.getStatutFacture() == statut).toList();
        }

        response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        response.setHeader("Content-Disposition", "attachment; filename=\"export_factures_" + LocalDate.now() + ".xlsx\"");
        excelExportService.exportFacturesToExcel(factures, response.getOutputStream());
    }

    @GetMapping("/clients/excel")
    public void exportClients(HttpServletResponse response) throws IOException {
        List<Client> clients = clientRepository.findAllByOrderByRaisonSocialeAsc();
        response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        response.setHeader("Content-Disposition", "attachment; filename=\"export_clients_" + LocalDate.now() + ".xlsx\"");
        excelExportService.exportClientsToExcel(clients, response.getOutputStream());
    }

    @GetMapping("/bons-de-livraison/excel")
    public void exportBLs(HttpServletResponse response) throws IOException {
        List<BonDeLivraison> bls = blRepository.findAll();
        response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        response.setHeader("Content-Disposition", "attachment; filename=\"export_bls_" + LocalDate.now() + ".xlsx\"");
        excelExportService.exportBLsToExcel(bls, response.getOutputStream());
    }

    @GetMapping("/rapport-mensuel")
    public void exportRapportMensuel(@RequestParam int month, @RequestParam int year, HttpServletResponse response) throws IOException {
        LocalDate start = LocalDate.of(year, month, 1);
        LocalDate end = start.with(TemporalAdjusters.lastDayOfMonth());
        
        List<Facture> factures = factureRepository.findByDatePropositionBetween(start, end);
        List<Passage> passages = passageRepository.findByDatePassageBetween(start, end);
        
        response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        response.setHeader("Content-Disposition", "attachment; filename=\"rapport_mensuel_" + month + "_" + year + ".xlsx\"");
        excelExportService.exportMonthlyReport(factures, passages, response.getOutputStream());
    }

    @GetMapping("/rapport-annuel")
    public void exportRapportAnnuel(@RequestParam int year, HttpServletResponse response) throws IOException {
        Map<String, Object> annualData = new HashMap<>();
        
        BigDecimal[] monthlyRevenue = new BigDecimal[12];
        for (int i = 0; i < 12; i++) monthlyRevenue[i] = BigDecimal.ZERO;
        
        List<Object[]> results = factureRepository.getMonthlyRevenue(year);
        BigDecimal totalYear = BigDecimal.ZERO;
        for (Object[] row : results) {
            int m = (int) row[0];
            BigDecimal val = (BigDecimal) row[1];
            monthlyRevenue[m-1] = val;
            totalYear = totalYear.add(val);
        }
        
        annualData.put("monthlyRevenue", monthlyRevenue);
        annualData.put("totalYear", totalYear);
        
        response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        response.setHeader("Content-Disposition", "attachment; filename=\"rapport_annuel_" + year + ".xlsx\"");
        excelExportService.exportAnnualReport(annualData, response.getOutputStream());
    }

    @GetMapping("/rapport-personnalise")
    public void exportRapportPersonnalise(
            @RequestParam String start,
            @RequestParam String end,
            @RequestParam(defaultValue = "false") boolean factures,
            @RequestParam(defaultValue = "false") boolean passages,
            @RequestParam(defaultValue = "false") boolean bls,
            @RequestParam(defaultValue = "false") boolean clientSummary,
            HttpServletResponse response) throws IOException {
        
        LocalDate startDate = LocalDate.parse(start);
        LocalDate endDate = LocalDate.parse(end);
        
        List<Facture> fList = factures ? factureRepository.findByDatePropositionBetween(startDate, endDate) : null;
        List<Passage> pList = passages ? passageRepository.findByDatePassageBetween(startDate, endDate) : null;
        List<BonDeLivraison> bList = bls ? blRepository.findByDateEmissionBetween(startDate, endDate) : null;
        List<Client> cList = clientSummary ? clientRepository.findAllByOrderByRaisonSocialeAsc() : null;
        
        response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        response.setHeader("Content-Disposition", "attachment; filename=\"rapport_personnalise.xlsx\"");
        excelExportService.exportCustomReport(fList, pList, bList, cList, response.getOutputStream());
    }
}
