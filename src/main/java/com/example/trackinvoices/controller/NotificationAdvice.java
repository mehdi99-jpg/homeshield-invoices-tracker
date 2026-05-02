package com.example.trackinvoices.controller;

import com.example.trackinvoices.service.AlertService;
import jakarta.servlet.http.HttpSession;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ModelAttribute;

@ControllerAdvice
public class NotificationAdvice {

    private final AlertService alertService;

    public NotificationAdvice(AlertService alertService) {
        this.alertService = alertService;
    }

    @ModelAttribute
    public void addAttributes(Model model, HttpSession session) {
        int realCount = alertService.getCount();
        Boolean dismissed = (Boolean) session.getAttribute("notificationsDismissed");
        Integer lastKnown = (Integer) session.getAttribute("lastKnownNotifCount");
        
        // If new notifications appeared since dismissing, reset dismissal
        if (dismissed != null && dismissed && lastKnown != null && realCount > lastKnown) {
            session.setAttribute("notificationsDismissed", false);
            dismissed = false;
        }

        if (dismissed != null && dismissed) {
            model.addAttribute("notifCount", 0);
            model.addAttribute("notificationsRead", true);
        } else {
            model.addAttribute("notifCount", realCount);
            model.addAttribute("notificationsRead", false);
        }
        
        model.addAttribute("notifications", alertService.getAlerts());
    }
}