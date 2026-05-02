package com.example.trackinvoices.controller;

import com.example.trackinvoices.model.entity.Client;
import com.example.trackinvoices.model.enums.TypeClient;
import com.example.trackinvoices.service.ClientService;
import com.example.trackinvoices.service.ExcelExportService;
import jakarta.validation.Valid;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

@Controller
@RequestMapping("/clients")
public class ClientController {

    private final ClientService clientService;
    private final ExcelExportService excelExportService;

    public ClientController(ClientService clientService, ExcelExportService excelExportService) {
        this.clientService = clientService;
        this.excelExportService = excelExportService;
    }

    @GetMapping("/{id}/export/excel")
    public void exportClientHistory(@PathVariable Long id, jakarta.servlet.http.HttpServletResponse response) throws java.io.IOException {
        Client client = clientService.getClientById(id);
        
        String filename = "historique_" + client.getCodeClient() + "_" + java.time.LocalDate.now() + ".xlsx";
        
        response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        response.setHeader("Content-Disposition", "attachment; filename=\"" + filename + "\"");
        
        excelExportService.exportFacturesToExcel(client.getFactures(), response.getOutputStream());
        response.getOutputStream().flush();
    }

    @GetMapping
    public String listClients(
            @RequestParam(required = false) String raisonSociale,
            @RequestParam(required = false) TypeClient typeClient,
            Model model) {
        
        model.addAttribute("clients", clientService.filterClients(raisonSociale, typeClient));
        model.addAttribute("types", TypeClient.values());
        model.addAttribute("activePage", "clients");
        model.addAttribute("raisonSociale", raisonSociale);
        model.addAttribute("typeClient", typeClient);
        
        return "clients";
    }

    @GetMapping("/nouveau")
    public String showCreateForm(Model model) {
        model.addAttribute("client", new Client());
        prepareFormModel(model);
        return "client-form";
    }

    @GetMapping("/{id}/modifier")
    public String showEditForm(@PathVariable Long id, Model model) {
        model.addAttribute("client", clientService.getClientById(id));
        prepareFormModel(model);
        return "client-form";
    }

    @PostMapping("/enregistrer")
    public String enregistrerClient(@Valid @ModelAttribute("client") Client client,
                                    BindingResult result,
                                    Model model,
                                    RedirectAttributes redirectAttributes) {
        // Validate unique codeClient
        clientService.findByCodeClient(client.getCodeClient()).ifPresent(existingClient -> {
            if (client.getId() == null || !client.getId().equals(existingClient.getId())) {
                result.rejectValue("codeClient", "duplicate", "Ce code client est déjà utilisé par un autre client.");
            }
        });

        if (result.hasErrors()) {
            prepareFormModel(model);
            return "client-form";
        }
        clientService.saveClient(client);
        redirectAttributes.addFlashAttribute("success", "Le client a été enregistré.");
        return "redirect:/clients";
    }

    @GetMapping("/{id}")
    public String showClientDetail(@PathVariable Long id, Model model) {
        Client client = clientService.getClientById(id);
        
        java.math.BigDecimal totalFacture = client.getFactures().stream()
                .map(com.example.trackinvoices.model.entity.Facture::getTotalTTC)
                .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);
                
        java.math.BigDecimal totalPaye = client.getFactures().stream()
                .filter(f -> f.getStatutFacture() == com.example.trackinvoices.model.enums.StatutFacture.PAYEE)
                .map(com.example.trackinvoices.model.entity.Facture::getTotalTTC)
                .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);
                
        model.addAttribute("client", client);
        model.addAttribute("totalFacture", totalFacture);
        model.addAttribute("totalPaye", totalPaye);
        model.addAttribute("totalAttente", totalFacture.subtract(totalPaye));
        model.addAttribute("activePage", "clients");
        
        return "client-detail";
    }

    @PostMapping("/{id}/supprimer")
    public String supprimerClient(@PathVariable Long id, RedirectAttributes ra) {
        try {
            if (clientService.hasInvoices(id)) {
                ra.addFlashAttribute("error", "Impossible de supprimer ce client : il possède des factures associées.");
                return "redirect:/clients";
            }
            clientService.deleteClient(id);
            ra.addFlashAttribute("success", "Client supprimé avec succès.");
        } catch (Exception e) {
            ra.addFlashAttribute("error", "Erreur lors de la suppression : " + e.getMessage());
        }
        return "redirect:/clients";
    }

    @PostMapping("/delete/{id}")
    @Deprecated
    public String deleteClient(@PathVariable Long id, RedirectAttributes ra) {
        return supprimerClient(id, ra);
    }

    private void prepareFormModel(Model model) {
        model.addAttribute("types", TypeClient.values());
        model.addAttribute("activePage", "clients");
    }
}
