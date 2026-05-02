package com.example.trackinvoices.controller;

import com.example.trackinvoices.service.ClientService;
import com.example.trackinvoices.service.FactureService;
import com.example.trackinvoices.service.SearchService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.List;
import java.util.Map;

@Controller
public class SearchController {

    private final SearchService searchService;
    private final ClientService clientService;
    private final FactureService factureService;

    public SearchController(SearchService searchService, ClientService clientService, FactureService factureService) {
        this.searchService = searchService;
        this.clientService = clientService;
        this.factureService = factureService;
    }

    @GetMapping("/recherche/ajax")
    @ResponseBody
    public List<Map<String, Object>> searchAjax(@RequestParam String q) {
        return searchService.globalSearch(q);
    }

    @GetMapping("/recherche")
    public String rechercher(@RequestParam(required = false, defaultValue = "") String q, Model model) {
        if (q != null && !q.isEmpty()) {
            model.addAttribute("clients", clientService.rechercherParNom(q));
            model.addAttribute("factures", factureService.rechercherParNumeroOuClient(q));
        } else {
            model.addAttribute("clients", List.of());
            model.addAttribute("factures", List.of());
        }
        model.addAttribute("q", q);
        model.addAttribute("activePage", "recherche");
        return "recherche/resultats";
    }
}