package com.example.trackinvoices.controller;

import com.example.trackinvoices.model.entity.BonDeLivraison;
import com.example.trackinvoices.model.entity.Facture;
import com.example.trackinvoices.model.enums.StatutLivraison;
import com.example.trackinvoices.repository.BonDeLivraisonRepository;
import com.example.trackinvoices.service.BonDeLivraisonService;
import com.example.trackinvoices.service.FactureService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.time.LocalDate;
import java.util.List;

@Controller
@RequestMapping("/bons-de-livraison")
public class BonDeLivraisonController {

    private final BonDeLivraisonService bonDeLivraisonService;
    private final BonDeLivraisonRepository bonDeLivraisonRepository;
    private final FactureService factureService;

    public BonDeLivraisonController(BonDeLivraisonService bonDeLivraisonService, 
                                     BonDeLivraisonRepository bonDeLivraisonRepository,
                                     FactureService factureService) {
        this.bonDeLivraisonService = bonDeLivraisonService;
        this.bonDeLivraisonRepository = bonDeLivraisonRepository;
        this.factureService = factureService;
    }

    @GetMapping
    public String list(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end,
            @RequestParam(required = false) StatutLivraison statut,
            Model model) {
        
        List<BonDeLivraison> bls = bonDeLivraisonRepository.findAll(); // Simplified for now
        model.addAttribute("bls", bls);
        model.addAttribute("statuts", StatutLivraison.values());
        model.addAttribute("activePage", "bons-de-livraison");
        return "bl-list";
    }

    @GetMapping("/{id}")
    public String detail(@PathVariable Long id, Model model) {
        BonDeLivraison bl = bonDeLivraisonRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Invalid BL Id:" + id));
        model.addAttribute("bl", bl);
        model.addAttribute("activePage", "bons-de-livraison");
        return "bl-detail";
    }

    @PostMapping("/creer-depuis-facture/{factureId}")
    public String createFromFacture(@PathVariable Long factureId, RedirectAttributes ra) {
        try {
            Facture f = factureService.getFactureById(factureId);
            BonDeLivraison bl = bonDeLivraisonService.createFromFacture(f);
            ra.addFlashAttribute("success", "Le Bon de Livraison " + bl.getNumeroBL() + " a été généré.");
            return "redirect:/bons-de-livraison/" + bl.getId();
        } catch (Exception e) {
            ra.addFlashAttribute("error", "Erreur lors de la création du BL.");
            return "redirect:/factures/" + factureId;
        }
    }
    
    @GetMapping("/{id}/imprimer")
    public String print(@PathVariable Long id, Model model) {
        BonDeLivraison bl = bonDeLivraisonRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Invalid BL Id:" + id));
        model.addAttribute("bl", bl);
        return "bl-print";
    }
}