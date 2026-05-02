package com.example.trackinvoices.service;

import com.example.trackinvoices.model.dto.AlertDTO;
import com.example.trackinvoices.model.entity.Facture;
import com.example.trackinvoices.model.enums.StatutFacture;
import com.example.trackinvoices.repository.FactureRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

@Service
public class NotificationService {

    private final FactureRepository factureRepository;
    private final AlertService alertService;

    public NotificationService(FactureRepository factureRepository, AlertService alertService) {
        this.factureRepository = factureRepository;
        this.alertService = alertService;
    }

    @PostConstruct
    public void init() {
        refreshAlerts();
    }

    @Scheduled(cron = "0 0 8 * * *") // Every day at 8 AM
    @Transactional
    public void scheduledScan() {
        refreshAlerts();
    }

    @Transactional
    public void refreshAlerts() {
        LocalDate today = LocalDate.now();
        List<Facture> allFactures = factureRepository.findAll();
        List<AlertDTO> alerts = new ArrayList<>();

        for (Facture f : allFactures) {
            // Skip paid or cancelled
            if (f.getStatutFacture() == StatutFacture.PAYEE || f.getStatutFacture() == StatutFacture.ANNULEE) {
                continue;
            }

            // 1. Automatic Transition to EN_RETARD if dateFinValidite passed
            if (f.getDateFinValidite() != null && f.getDateFinValidite().isBefore(today)) {
                if (f.getStatutFacture() != StatutFacture.EN_RETARD) {
                    f.setStatutFacture(StatutFacture.EN_RETARD);
                    factureRepository.save(f);
                }
            }

            // 2. Already EN_RETARD
            if (f.getStatutFacture() == StatutFacture.EN_RETARD) {
                long daysOverdue = f.getDateFinValidite() != null ? ChronoUnit.DAYS.between(f.getDateFinValidite(), today) : 0;
                alerts.add(new AlertDTO(
                    f.getId(), 
                    f.getNumeroFacture(), 
                    f.getClient().getRaisonSociale(), 
                    "EN RETARD : Paiement dépassé", 
                    "danger", 
                    "EN_RETARD",
                    daysOverdue,
                    LocalDateTime.now()
                ));
            } 
            // 3. Imminent expiration (within 5 days)
            else if (f.getDateFinValidite() != null) {
                long daysUntil = ChronoUnit.DAYS.between(today, f.getDateFinValidite());
                if (daysUntil >= 0 && daysUntil <= 5) {
                    alerts.add(new AlertDTO(
                        f.getId(), 
                        f.getNumeroFacture(), 
                        f.getClient().getRaisonSociale(), 
                        "EXPIRATION PROCHE : Échéance à " + daysUntil + " jours", 
                        "warning", 
                        "EXPIRATION_PROCHE",
                        daysUntil,
                        LocalDateTime.now()
                    ));
                }
            }
        }
        
        // Sorting: EN_RETARD first, then EXPIRATION_PROCHE by days (ascending)
        alerts.sort((a, b) -> {
            if (a.getAlertType().equals(b.getAlertType())) {
                if ("EN_RETARD".equals(a.getAlertType())) {
                    return Long.compare(b.getDays(), a.getDays()); // More overdue first
                } else {
                    return Long.compare(a.getDays(), b.getDays()); // Sooner expiry first
                }
            }
            return a.getAlertType().equals("EN_RETARD") ? -1 : 1;
        });

        alertService.setAlerts(alerts);
    }
}