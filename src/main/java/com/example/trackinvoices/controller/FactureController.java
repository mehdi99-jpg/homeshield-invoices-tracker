package com.example.trackinvoices.controller;

import com.example.trackinvoices.model.dto.FactureDTO;
import com.example.trackinvoices.model.dto.LigneFactureDTO;
import com.example.trackinvoices.model.entity.Facture;
import com.example.trackinvoices.model.entity.Passage;
import com.example.trackinvoices.model.enums.ModeReglement;
import com.example.trackinvoices.model.enums.StatutFacture;
import com.example.trackinvoices.model.enums.StatutLivraison;
import com.example.trackinvoices.model.enums.StatutPassage;
import com.example.trackinvoices.repository.ClientRepository;
import com.example.trackinvoices.repository.PassageRepository;
import com.example.trackinvoices.service.ExcelExportService;
import com.example.trackinvoices.service.FactureService;
import com.example.trackinvoices.service.PassageService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.io.OutputStreamWriter;
import java.io.PrintWriter;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.stream.IntStream;

@Controller
@RequestMapping("/factures")
public class FactureController {

    private final FactureService factureService;
    private final ClientRepository clientRepository;
    private final PassageRepository passageRepository;
    private final PassageService passageService;
    private final ExcelExportService excelExportService;

    public FactureController(FactureService factureService, ClientRepository clientRepository, PassageRepository passageRepository, PassageService passageService, ExcelExportService excelExportService) {
        this.factureService = factureService;
        this.clientRepository = clientRepository;
        this.passageRepository = passageRepository;
        this.passageService = passageService;
        this.excelExportService = excelExportService;
    }

    @GetMapping
    public String listFactures(
            @RequestParam(required = false) String clientName,
            @RequestParam(required = false) StatutFacture statut,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) BigDecimal minAmount,
            @RequestParam(required = false) BigDecimal maxAmount,
            @RequestParam(defaultValue = "dateProposition") String sortField,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(defaultValue = "0") int page,
            Model model) {
        
        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortField).ascending() : Sort.by(sortField).descending();
        Pageable pageable = PageRequest.of(page, 15, sort);
        
        Page<Facture> facturePage = factureService.getFactures(null, clientName, statut, month, year, minAmount, maxAmount, pageable);
        
        model.addAttribute("facturePage", facturePage);
        model.addAttribute("statuts", StatutFacture.values());
        model.addAttribute("activePage", "factures");
        
        // Filter options
        model.addAttribute("years", IntStream.rangeClosed(LocalDate.now().getYear() - 5, LocalDate.now().getYear() + 1).toArray());
        model.addAttribute("months", new String[]{"Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"});
        
        // State persistence
        model.addAttribute("clientName", clientName);
        model.addAttribute("statut", statut);
        model.addAttribute("month", month);
        model.addAttribute("year", year);
        model.addAttribute("minAmount", minAmount);
        model.addAttribute("maxAmount", maxAmount);
        model.addAttribute("sortField", sortField);
        model.addAttribute("sortDir", sortDir);
        
        return "factures";
    }

    @GetMapping("/nouveau")
    public String showCreateForm(Model model) {
        FactureDTO dto = new FactureDTO();
        dto.setDateProposition(LocalDate.now());
        dto.getLignes().add(new LigneFactureDTO());
        prepareFormModel(model, dto);
        return "facture-form";
    }

    @GetMapping("/{id}/modifier")
    public String showEditForm(@PathVariable Long id, Model model) {
        FactureDTO dto = factureService.getFactureDtoById(id);
        prepareFormModel(model, dto);
        return "facture-form";
    }

    @PostMapping("/enregistrer")
    public String saveFacture(@Valid @ModelAttribute("facture") FactureDTO dto, BindingResult bindingResult, Model model, RedirectAttributes ra) {
        if (bindingResult.hasErrors()) {
            prepareFormModel(model, dto);
            return "facture-form";
        }
        factureService.saveFacture(dto);
        ra.addFlashAttribute("success", "La facture a été enregistrée avec succès.");
        return "redirect:/factures";
    }

    @GetMapping("/{id}")
    public String viewFacture(@PathVariable Long id, Model model) {
        Facture f = factureService.getFactureById(id);
        model.addAttribute("facture", f);
        model.addAttribute("statuts", StatutFacture.values());
        model.addAttribute("livraisons", StatutLivraison.values());
        model.addAttribute("passagesStatuts", StatutPassage.values());
        model.addAttribute("activePage", "factures");
        return "facture-detail";
    }

    @PostMapping("/{factureId}/passages/enregistrer")
    public String savePassage(@PathVariable Long factureId, 
                              @ModelAttribute Passage passage, 
                              @RequestParam(required = false) List<String> zones, 
                              RedirectAttributes ra) {
        Facture f = factureService.getFactureById(factureId);
        
        // Handle zones (checkboxes to comma-separated string)
        // Only overwrite if checkboxes were actually present in the request
        if (zones != null && !zones.isEmpty()) {
            passage.setZonesTraitees(String.join(", ", zones));
        } 
        // If zones is null, we keep whatever was bound to passage.zonesTraitees from the text input
        
        // Essential: Link the passage to the parent Facture
        passage.setFacture(f);
        
        // For new passages, ensure we have a valid numeroPassage
        if (passage.getNumeroPassage() == null) {
            passage.setNumeroPassage((int) (passageService.countByFacture(f) + 1));
        }

        // Handle case where ID might be bound as 0 from an empty hidden input
        if (passage.getId() != null && passage.getId() == 0) {
            passage.setId(null);
        }
        
        // If we are updating an existing passage, we might want to preserve 
        // fields not present in the modal if necessary, but here we replace.
        passageService.savePassage(passage);
        
        ra.addFlashAttribute("success", "L'intervention a été enregistrée avec succès.");
        return "redirect:/factures/" + factureId;
    }

    @PostMapping("/{factureId}/statuts")
    public String updateStatuses(@PathVariable Long factureId, @RequestParam(required = false) StatutFacture statutFacture, @RequestParam(required = false) StatutLivraison statutLivraison, RedirectAttributes ra) {
        Facture f = factureService.getFactureById(factureId);
        if (statutFacture != null) {
            f.setStatutFacture(statutFacture);
            if (statutFacture == StatutFacture.PAYEE && f.getDateReglement() == null) f.setDateReglement(LocalDate.now());
        }
        if (statutLivraison != null) f.setStatutLivraison(statutLivraison);
        factureService.saveFacture(f);
        ra.addFlashAttribute("success", "Les statuts ont été mis à jour.");
        return "redirect:/factures/" + factureId;
    }

    @PostMapping("/{id}/supprimer")
    public String deleteFacture(@PathVariable Long id, RedirectAttributes ra) {
        try {
            factureService.deleteFacture(id);
            ra.addFlashAttribute("success", "La facture a été supprimée.");
        } catch (Exception e) {
            ra.addFlashAttribute("error", "Impossible de supprimer la facture.");
        }
        return "redirect:/factures";
    }

    @GetMapping("/export/excel")
    public void exportExcel(
            @RequestParam(required = false) String clientName,
            @RequestParam(required = false) StatutFacture statut,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) BigDecimal minAmount,
            @RequestParam(required = false) BigDecimal maxAmount,
            jakarta.servlet.http.HttpServletResponse response) throws java.io.IOException {

        List<Facture> factures = factureService.getFacturesList(null, clientName, statut, month, year, minAmount, maxAmount);

        response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        response.setHeader("Content-Disposition", "attachment; filename=\"factures_export_" + java.time.LocalDate.now() + ".xlsx\"");
        
        excelExportService.exportFacturesToExcel(factures, response.getOutputStream());
        response.getOutputStream().flush();
    }

    @GetMapping("/{id}/imprimer")
    public String printFacture(@PathVariable Long id, Model model) {
        Facture f = factureService.getFactureById(id);
        model.addAttribute("facture", f);
        return "facture-print";
    }

    private void prepareFormModel(Model model, FactureDTO dto) {
        model.addAttribute("facture", dto);
        model.addAttribute("clients", clientRepository.findAll());
        model.addAttribute("statuts", StatutFacture.values());
        model.addAttribute("modes", ModeReglement.values());
        model.addAttribute("livraisons", StatutLivraison.values());
        model.addAttribute("activePage", "factures");
    }
}