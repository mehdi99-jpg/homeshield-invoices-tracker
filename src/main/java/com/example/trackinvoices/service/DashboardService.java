package com.example.trackinvoices.service;

import com.example.trackinvoices.model.entity.Client;
import com.example.trackinvoices.model.entity.Facture;
import com.example.trackinvoices.model.enums.StatutFacture;
import com.example.trackinvoices.repository.FactureRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class DashboardService {

    private final FactureRepository factureRepository;

    public DashboardService(FactureRepository factureRepository) {
        this.factureRepository = factureRepository;
    }

    public Map<String, Object> getDashboardStats() {
        LocalDate now = LocalDate.now();
        return getDashboardStats(now.with(TemporalAdjusters.firstDayOfMonth()), now.with(TemporalAdjusters.lastDayOfMonth()));
    }

    public Map<String, Object> getDashboardStats(LocalDate start, LocalDate end) {
        Map<String, Object> stats = new HashMap<>();
        
        // Use period-aware repository calls
        BigDecimal revenuePeriod = factureRepository.sumTotalTTCPayeeBetween(start, end);
        long countPeriod = factureRepository.countBetween(start, end);
        long countUnpaid = factureRepository.countUnpaidBetween(start, end);
        long countOverdue = factureRepository.countOverdueBetween(start, end);
        Client topClient = factureRepository.findTopClientBetween(start, end);

        // Additional KPIs for Statistics page enhancement
        long countPayee = factureRepository.countPayeeBetween(start, end);
        double recoveryRate = countPeriod > 0 ? (double) countPayee / countPeriod * 100 : 0;
        BigDecimal avgBasket = factureRepository.averageTotalTTCBetween(start, end);

        stats.put("caMois", revenuePeriod != null ? revenuePeriod : BigDecimal.ZERO);
        stats.put("nbFacturesMois", countPeriod);
        stats.put("nbFacturesImpayees", countUnpaid);
        stats.put("countOverdue", countOverdue);
        stats.put("recoveryRate", (int) recoveryRate);
        stats.put("avgBasket", avgBasket != null ? avgBasket : BigDecimal.ZERO);
        stats.put("meilleurClient", topClient != null ? topClient.getRaisonSociale() : "Aucun");

        // Charts data (mostly yearly)
        LocalDate now = LocalDate.now();
        BigDecimal[] monthlyRevenue = getMonthlyData(now.getYear(), factureRepository.getMonthlyRevenue(now.getYear()));
        
        String[] chartLabels = {"Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"};
        stats.put("chartLabels", chartLabels);
        stats.put("chartData", monthlyRevenue);

        List<Object[]> paymentData = factureRepository.getRevenueByPaymentModeBetween(start, end);
        Map<String, BigDecimal> statusDistribution = new HashMap<>();
        for (Object[] row : paymentData) {
            String label = "Non défini";
            if (row[0] != null) {
                if (row[0] instanceof com.example.trackinvoices.model.enums.ModeReglement) {
                    label = ((com.example.trackinvoices.model.enums.ModeReglement) row[0]).getLibelle();
                } else {
                    label = row[0].toString();
                }
            }
            statusDistribution.put(label, row[1] != null ? (BigDecimal) row[1] : BigDecimal.ZERO);
        }
        stats.put("statusDistribution", statusDistribution);

        // Dashboard Specifics (Warnings)
        List<Facture> overdueFactures = factureRepository.findByStatutFacture(StatutFacture.EN_RETARD);
        LocalDate sevenDaysFromNow = now.plusDays(7);
        List<Facture> imminentFactures = factureRepository.findAll().stream()
                .filter(f -> f.getStatutFacture() != StatutFacture.PAYEE && f.getStatutFacture() != StatutFacture.ANNULEE)
                .filter(f -> f.getDateFinValidite() != null && 
                             !f.getDateFinValidite().isBefore(now) && 
                             !f.getDateFinValidite().isAfter(sevenDaysFromNow))
                .toList();

        stats.put("overdueFactures", overdueFactures);
        stats.put("imminentFactures", imminentFactures);
        stats.put("dernieresFactures", factureRepository.findTop5ByOrderByDatePropositionDesc());

        return stats;
    }

    public Map<String, Object> getFullStatistics(LocalDate start, LocalDate end) {
        Map<String, Object> stats = getDashboardStats(start, end);
        LocalDate now = LocalDate.now();
        int currentMonth = now.getMonthValue();

        // 1. Revenue comparison (this year vs last year)
        stats.put("revenueThisYear", getMonthlyData(now.getYear(), factureRepository.getMonthlyRevenue(now.getYear())));
        stats.put("revenueLastYear", getMonthlyData(now.getYear() - 1, factureRepository.getMonthlyRevenue(now.getYear() - 1)));

        // 2. Top 5 clients (already period-filtered)
        List<Object[]> topClientsRaw = factureRepository.getTopClients(start, end);
        stats.put("topClients", topClientsRaw);

        // 3. Status breakdown (Monthly stacked)
        List<Object[]> statusRaw = factureRepository.getStatusBreakdownByMonth(now.getYear());
        Map<String, Long[]> statusBreakdown = new HashMap<>();
        for (Object[] row : statusRaw) {
            int month = (int) row[0];
            String status = "Non défini";
            if (row[1] != null) {
                if (row[1] instanceof com.example.trackinvoices.model.enums.StatutFacture) {
                    status = ((com.example.trackinvoices.model.enums.StatutFacture) row[1]).getLibelle();
                } else {
                    status = row[1].toString();
                }
            }
            long count = (long) row[2];
            statusBreakdown.computeIfAbsent(status, k -> {
                Long[] arr = new Long[12];
                for (int i = 0; i < 12; i++) arr[i] = 0L;
                return arr;
            })[month - 1] = count;
        }
        stats.put("statusBreakdown", statusBreakdown);

        // 4. Average invoice value - Filtered to current month
        List<Object[]> avgRaw = factureRepository.getAverageInvoiceValueByMonth(now.getYear());
        Double[] avgMonthly = new Double[currentMonth];
        for (int i = 0; i < currentMonth; i++) avgMonthly[i] = 0.0;
        for (Object[] row : avgRaw) {
            int month = (int) row[0];
            if (month <= currentMonth) {
                avgMonthly[month - 1] = ((Number) row[1]).doubleValue();
            }
        }
        stats.put("avgInvoiceValue", avgMonthly);
        
        // For the line chart labels, also slice them
        String[] chartLabelsFull = (String[]) stats.get("chartLabels");
        String[] chartLabelsLimited = new String[currentMonth];
        System.arraycopy(chartLabelsFull, 0, chartLabelsLimited, 0, currentMonth);
        stats.put("chartLabelsLimited", chartLabelsLimited);

        return stats;
    }

    private BigDecimal[] getMonthlyData(int year, List<Object[]> data) {
        BigDecimal[] monthly = new BigDecimal[12];
        for (int i = 0; i < 12; i++) monthly[i] = BigDecimal.ZERO;
        for (Object[] row : data) {
            int month = (int) row[0];
            monthly[month - 1] = row[1] != null ? (BigDecimal) row[1] : BigDecimal.ZERO;
        }
        return monthly;
    }
}
