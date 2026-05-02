package com.example.trackinvoices.controller.api;

import com.example.trackinvoices.model.entity.Client;
import com.example.trackinvoices.model.entity.Facture;
import com.example.trackinvoices.model.enums.ModeReglement;
import com.example.trackinvoices.model.enums.StatutFacture;
import com.example.trackinvoices.repository.FactureRepository;
import com.example.trackinvoices.service.DashboardService;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.*;

@RestController
@RequestMapping("/api/dashboard")
public class ApiDashboardController {

    private final DashboardService dashboardService;
    private final FactureRepository factureRepository;

    public ApiDashboardController(DashboardService dashboardService, FactureRepository factureRepository) {
        this.dashboardService = dashboardService;
        this.factureRepository = factureRepository;
    }

    @GetMapping("/stats")
    public Map<String, Object> getStats() {
        Map<String, Object> raw = dashboardService.getDashboardStats();
        Map<String, Object> result = new LinkedHashMap<>();

        result.put("caMonth", raw.get("caMois"));
        
        // Calculate yearly CA
        LocalDate now = LocalDate.now();
        LocalDate yearStart = now.with(TemporalAdjusters.firstDayOfYear());
        LocalDate yearEnd = now.with(TemporalAdjusters.lastDayOfYear());
        BigDecimal caYear = factureRepository.sumTotalTTCPayeeBetween(yearStart, yearEnd);
        result.put("caYear", caYear != null ? caYear : BigDecimal.ZERO);

        result.put("bestClient", raw.get("meilleurClient"));
        result.put("invoicesThisMonth", raw.get("nbFacturesMois"));
        result.put("unpaidInvoices", raw.get("nbFacturesImpayees"));
        result.put("overdueCount", raw.get("countOverdue"));

        return result;
    }

    @GetMapping("/chart-data")
    public List<Map<String, Object>> getChartData() {
        String[] labels = {"Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"};
        Map<String, Object> raw = dashboardService.getDashboardStats();
        BigDecimal[] data = (BigDecimal[]) raw.get("chartData");
        
        List<Map<String, Object>> result = new ArrayList<>();
        for (int i = 0; i < 12; i++) {
            Map<String, Object> entry = new LinkedHashMap<>();
            entry.put("month", labels[i]);
            entry.put("amount", data[i]);
            result.add(entry);
        }
        return result;
    }

    @GetMapping("/payment-modes")
    public List<Map<String, Object>> getPaymentModes() {
        Map<String, Object> raw = dashboardService.getDashboardStats();
        @SuppressWarnings("unchecked")
        Map<String, BigDecimal> dist = (Map<String, BigDecimal>) raw.get("statusDistribution");
        
        List<Map<String, Object>> result = new ArrayList<>();
        if (dist != null) {
            dist.forEach((mode, amount) -> {
                Map<String, Object> entry = new LinkedHashMap<>();
                entry.put("mode", mode);
                entry.put("count", amount);
                result.add(entry);
            });
        }
        return result;
    }
}
