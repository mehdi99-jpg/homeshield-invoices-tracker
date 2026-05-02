package com.example.trackinvoices.controller;

import com.example.trackinvoices.service.AlertService;
import jakarta.servlet.http.HttpSession;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
@RequestMapping("/notifications")
public class NotificationController {

    private final AlertService alertService;

    public NotificationController(AlertService alertService) {
        this.alertService = alertService;
    }

    @GetMapping
    public String showNotifications(Model model) {
        model.addAttribute("activePage", "notifications");
        model.addAttribute("fullHistory", alertService.getAlerts());
        return "notifications";
    }

    @PostMapping("/marquer-lu")
    @ResponseBody
    public void markAsRead(HttpSession session) {
        session.setAttribute("notificationsDismissed", true);
        session.setAttribute("lastKnownNotifCount", alertService.getCount());
    }
}