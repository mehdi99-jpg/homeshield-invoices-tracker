package com.example.trackinvoices.controller;

import com.example.trackinvoices.model.entity.Facture;
import com.example.trackinvoices.service.DashboardService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.List;
import java.util.Map;

@Controller
public class NavigationController {

    private final DashboardService dashboardService;

    public NavigationController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/")
    public String index(Model model, jakarta.servlet.http.HttpSession session) {
        Map<String, Object> stats = dashboardService.getDashboardStats();

        // Filter out ignored notifications
        java.util.Set<Long> ignoredIds = (java.util.Set<Long>) session.getAttribute("ignoredNotifications");
        if (ignoredIds == null) ignoredIds = new java.util.HashSet<>();

        final java.util.Set<Long> finalIgnoredIds = ignoredIds;
        List<Facture> overdue = (List<Facture>) stats.get("overdueFactures");
        List<Facture> imminent = (List<Facture>) stats.get("imminentFactures");

        stats.put("overdueFactures", overdue.stream().filter(f -> !finalIgnoredIds.contains(f.getId())).toList());
        stats.put("imminentFactures", imminent.stream().filter(f -> !finalIgnoredIds.contains(f.getId())).toList());

        model.addAllAttributes(stats);
        model.addAttribute("activePage", "dashboard");
        return "index";
    }

    @PostMapping("/notifications/{id}/ignorer")
    @ResponseBody
    public void ignoreNotification(@PathVariable Long id, jakarta.servlet.http.HttpSession session) {
        java.util.Set<Long> ignoredIds = (java.util.Set<Long>) session.getAttribute("ignoredNotifications");
        if (ignoredIds == null) {
            ignoredIds = new java.util.HashSet<>();
            session.setAttribute("ignoredNotifications", ignoredIds);
        }
        ignoredIds.add(id);
    }

    @GetMapping("/statistiques")
    public String statistiques(
            @RequestParam(required = false) String period,
            @RequestParam(required = false) String start,
            @RequestParam(required = false) String end,
            Model model) {
        
        LocalDate startDate = LocalDate.now().with(TemporalAdjusters.firstDayOfMonth());
        LocalDate endDate = LocalDate.now().with(TemporalAdjusters.lastDayOfMonth());

        if (period != null) {
            LocalDate now = LocalDate.now();
            switch (period) {
                case "week":
                    startDate = now.minusDays(now.getDayOfWeek().getValue() - 1);
                    endDate = startDate.plusDays(6);
                    break;
                case "month":
                    startDate = now.with(TemporalAdjusters.firstDayOfMonth());
                    endDate = now.with(TemporalAdjusters.lastDayOfMonth());
                    break;
                case "year":
                    startDate = now.with(TemporalAdjusters.firstDayOfYear());
                    endDate = now.with(TemporalAdjusters.lastDayOfYear());
                    break;
                case "custom":
                    if (start != null && end != null) {
                        startDate = LocalDate.parse(start);
                        endDate = LocalDate.parse(end);
                    }
                    break;
            }
        }

        model.addAllAttributes(dashboardService.getFullStatistics(startDate, endDate));
        model.addAttribute("activePage", "statistiques");
        model.addAttribute("period", period != null ? period : "month");
        model.addAttribute("startDate", startDate);
        model.addAttribute("endDate", endDate);
        
        return "statistiques";
    }
}
