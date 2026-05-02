package com.example.trackinvoices.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AlertDTO {
    private Long factureId;
    private String numeroFacture;
    private String clientName;
    private String message;
    private String type; // "danger" or "warning"
    private String alertType; // "EN_RETARD" or "EXPIRATION_PROCHE"
    private long days; // Overdue if positive for EN_RETARD, or until expiry if positive for EXPIRATION_PROCHE
    private java.time.LocalDateTime detectedAt;
}