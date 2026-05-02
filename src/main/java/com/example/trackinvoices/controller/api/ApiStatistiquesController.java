package com.example.trackinvoices.controller.api;

import com.example.trackinvoices.service.DashboardService;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.*;

@RestController
@RequestMapping("/api/statistiques")
public class ApiStatistiquesController {

    private final DashboardService dashboardService;

    public ApiStatistiquesController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping
    public Map<String, Object> getStatistiques(
            @RequestParam(defaultValue = "CE_MOIS") String periode,
            @RequestParam(required = false) String dateDebut,
            @RequestParam(required = false) String dateFin) {
        
        LocalDate[] range = resolveRange(periode, dateDebut, dateFin);
        Map<String, Object> raw = dashboardService.getDashboardStats(range[0], range[1]);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("caEncaisse", raw.get("caMois"));
        result.put("nombreFactures", raw.get("nbFacturesMois"));
        result.put("nombreImpayees", raw.get("nbFacturesImpayees"));
        result.put("nombreEnRetard", raw.get("countOverdue"));
        result.put("tauxRecouvrement", raw.get("recoveryRate"));
        result.put("panierMoyen", raw.get("avgBasket"));
        
        // Build period summary sentence
        result.put("periodeSummary", "Statistiques du " + range[0] + " au " + range[1]);
        return result;
    }

    @GetMapping("/charts")
    public Map<String, Object> getCharts(
            @RequestParam(defaultValue = "CE_MOIS") String periode,
            @RequestParam(required = false) String dateDebut,
            @RequestParam(required = false) String dateFin) {
        
        LocalDate[] range = resolveRange(periode, dateDebut, dateFin);
        Map<String, Object> raw = dashboardService.getFullStatistics(range[0], range[1]);

        String[] labels = {"Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"};
        Map<String, Object> result = new LinkedHashMap<>();

        // Comparatif CA
        BigDecimal[] thisYear = (BigDecimal[]) raw.get("revenueThisYear");
        BigDecimal[] lastYear = (BigDecimal[]) raw.get("revenueLastYear");
        List<Map<String, Object>> comparatifCA = new ArrayList<>();
        for (int i = 0; i < 12; i++) {
            Map<String, Object> entry = new LinkedHashMap<>();
            entry.put("month", labels[i]);
            entry.put("thisYear", thisYear[i]);
            entry.put("lastYear", lastYear[i]);
            comparatifCA.add(entry);
        }
        result.put("comparatifCA", comparatifCA);

        // Top 5 Clients
        @SuppressWarnings("unchecked")
        List<Object[]> topClientsRaw = (List<Object[]>) raw.get("topClients");
        List<Map<String, Object>> top5Clients = new ArrayList<>();
        if (topClientsRaw != null) {
            for (Object[] row : topClientsRaw) {
                Map<String, Object> entry = new LinkedHashMap<>();
                entry.put("client", row[0]);
                entry.put("total", row[1]);
                top5Clients.add(entry);
            }
        }
        result.put("top5Clients", top5Clients);

        // Répartition Statuts
        @SuppressWarnings("unchecked")
        Map<String, Long[]> statusBreakdown = (Map<String, Long[]>) raw.get("statusBreakdown");
        List<Map<String, Object>> repartitionStatuts = new ArrayList<>();
        if (statusBreakdown != null) {
            for (int i = 0; i < 12; i++) {
                Map<String, Object> entry = new LinkedHashMap<>();
                entry.put("month", labels[i]);
                for (Map.Entry<String, Long[]> e : statusBreakdown.entrySet()) {
                    entry.put(e.getKey(), e.getValue()[i]);
                }
                repartitionStatuts.add(entry);
            }
        }
        result.put("repartitionStatuts", repartitionStatuts);

        // Panier moyen par mois
        Double[] avgMonthly = (Double[]) raw.get("avgInvoiceValue");
        List<Map<String, Object>> panierMoyenParMois = new ArrayList<>();
        if (avgMonthly != null) {
            String[] limitedLabels = (String[]) raw.get("chartLabelsLimited");
            for (int i = 0; i < avgMonthly.length && i < limitedLabels.length; i++) {
                Map<String, Object> entry = new LinkedHashMap<>();
                entry.put("month", limitedLabels[i]);
                entry.put("value", avgMonthly[i]);
                panierMoyenParMois.add(entry);
            }
        }
        result.put("panierMoyenParMois", panierMoyenParMois);

        return result;
    }

    private LocalDate[] resolveRange(String periode, String dateDebut, String dateFin) {
        LocalDate now = LocalDate.now();
        LocalDate start, end;
        switch (periode) {
            case "CE_TRIMESTRE":
                int q = (now.getMonthValue() - 1) / 3;
                start = LocalDate.of(now.getYear(), q * 3 + 1, 1);
                end = start.plusMonths(3).minusDays(1);
                break;
            case "CETTE_ANNEE":
                start = now.with(TemporalAdjusters.firstDayOfYear());
                end = now.with(TemporalAdjusters.lastDayOfYear());
                break;
            case "PERSONNALISE":
                start = (dateDebut != null && !dateDebut.isEmpty()) ? LocalDate.parse(dateDebut) : now.with(TemporalAdjusters.firstDayOfMonth());
                end = (dateFin != null && !dateFin.isEmpty()) ? LocalDate.parse(dateFin) : now.with(TemporalAdjusters.lastDayOfMonth());
                break;
            default: // CE_MOIS
                start = now.with(TemporalAdjusters.firstDayOfMonth());
                end = now.with(TemporalAdjusters.lastDayOfMonth());
                break;
        }
        return new LocalDate[]{start, end};
    }
}
