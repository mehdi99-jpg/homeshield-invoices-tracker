package com.example.trackinvoices.controller.api;

import com.example.trackinvoices.model.dto.AlertDTO;
import com.example.trackinvoices.service.AlertService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/notifications")
public class ApiNotificationController {

    private final AlertService alertService;

    public ApiNotificationController(AlertService alertService) {
        this.alertService = alertService;
    }

    @GetMapping("/overdue")
    public List<Map<String, Object>> getOverdueNotifications() {
        List<AlertDTO> alerts = alertService.getAlerts();
        List<Map<String, Object>> result = new ArrayList<>();
        for (AlertDTO a : alerts) {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("id", a.getFactureId());
            map.put("numero", a.getNumeroFacture());
            map.put("client", a.getClientName());
            map.put("message", a.getMessage());
            map.put("type", a.getType());
            map.put("alertType", a.getAlertType());
            map.put("joursRetard", a.getDays());
            result.add(map);
        }
        return result;
    }

    @PostMapping("/mark-all-read")
    public ResponseEntity<?> markAllRead() {
        return ResponseEntity.ok(Map.of("message", "Notifications marquées comme lues"));
    }
}
