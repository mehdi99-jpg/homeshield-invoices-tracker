package com.example.trackinvoices.service;

import com.example.trackinvoices.model.dto.AlertDTO;
import org.springframework.stereotype.Service;
import org.springframework.web.context.annotation.ApplicationScope;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
@ApplicationScope
public class AlertService {
    private List<AlertDTO> activeAlerts = Collections.synchronizedList(new ArrayList<>());

    public void setAlerts(List<AlertDTO> alerts) {
        this.activeAlerts.clear();
        this.activeAlerts.addAll(alerts);
    }

    public List<AlertDTO> getAlerts() {
        return new ArrayList<>(activeAlerts);
    }

    public int getCount() {
        return activeAlerts.size();
    }
}