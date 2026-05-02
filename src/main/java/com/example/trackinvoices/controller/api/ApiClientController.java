package com.example.trackinvoices.controller.api;

import com.example.trackinvoices.model.entity.Client;
import com.example.trackinvoices.model.entity.Facture;
import com.example.trackinvoices.model.enums.StatutFacture;
import com.example.trackinvoices.service.ClientService;
import com.example.trackinvoices.service.ExcelExportService;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api/clients")
public class ApiClientController {

    private final ClientService clientService;
    private final ExcelExportService excelExportService;

    public ApiClientController(ClientService clientService, ExcelExportService excelExportService) {
        this.clientService = clientService;
        this.excelExportService = excelExportService;
    }

    @GetMapping
    public List<Map<String, Object>> getAllClients() {
        List<Client> clients = clientService.getAllClients();
        List<Map<String, Object>> result = new ArrayList<>();
        for (Client c : clients) {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("id", c.getId());
            map.put("code", c.getCodeClient());
            map.put("raisonSociale", c.getRaisonSociale());
            map.put("ville", c.getVille());
            map.put("type", c.getTypeClient() != null ? c.getTypeClient().getLibelle() : null);
            map.put("typeEnum", c.getTypeClient() != null ? c.getTypeClient().name() : null);
            map.put("email", c.getEmail());
            map.put("telephone", c.getTelephone());
            map.put("nombreFactures", c.getFactures() != null ? c.getFactures().size() : 0);
            result.add(map);
        }
        return result;
    }

    @GetMapping("/{id}")
    public Map<String, Object> getClient(@PathVariable Long id) {
        Client c = clientService.getClientById(id);
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", c.getId());
        map.put("code", c.getCodeClient());
        map.put("raisonSociale", c.getRaisonSociale());
        map.put("type", c.getTypeClient() != null ? c.getTypeClient().getLibelle() : null);
        map.put("typeEnum", c.getTypeClient() != null ? c.getTypeClient().name() : null);
        map.put("adresse", c.getAdresse());
        map.put("ville", c.getVille());
        map.put("telephone", c.getTelephone());
        map.put("email", c.getEmail());
        map.put("notes", c.getNotes());

        BigDecimal totalFacture = BigDecimal.ZERO;
        BigDecimal totalPaye = BigDecimal.ZERO;
        int nombreFactures = 0;
        if (c.getFactures() != null) {
            nombreFactures = c.getFactures().size();
            for (Facture f : c.getFactures()) {
                totalFacture = totalFacture.add(f.getTotalTTC() != null ? f.getTotalTTC() : BigDecimal.ZERO);
                if (f.getStatutFacture() == StatutFacture.PAYEE) {
                    totalPaye = totalPaye.add(f.getTotalTTC() != null ? f.getTotalTTC() : BigDecimal.ZERO);
                }
            }
        }
        map.put("totalFacture", totalFacture);
        map.put("totalPaye", totalPaye);
        map.put("enAttente", totalFacture.subtract(totalPaye));
        map.put("nombreFactures", nombreFactures);

        return map;
    }

    @GetMapping("/{id}/factures")
    public List<Map<String, Object>> getClientFactures(@PathVariable Long id) {
        Client c = clientService.getClientById(id);
        List<Map<String, Object>> result = new ArrayList<>();
        if (c.getFactures() != null) {
            for (Facture f : c.getFactures()) {
                Map<String, Object> map = new LinkedHashMap<>();
                map.put("id", f.getId());
                map.put("numero", f.getNumeroFacture());
                map.put("date", f.getDateProposition());
                map.put("montantTTC", f.getTotalTTC());
                map.put("statut", f.getStatutFacture() != null ? f.getStatutFacture().name() : null);
                map.put("statutLabel", f.getStatutFacture() != null ? f.getStatutFacture().getLibelle() : null);
                result.add(map);
            }
        }
        return result;
    }

    @PostMapping
    public ResponseEntity<?> createClient(@RequestBody Map<String, String> body) {
        Client client = new Client();
        client.setRaisonSociale(body.get("raisonSociale"));
        client.setCodeClient(body.get("codeClient"));
        client.setTelephone(body.get("telephone"));
        client.setEmail(body.get("email"));
        client.setAdresse(body.get("adresse"));
        client.setVille(body.get("ville"));
        client.setNotes(body.get("notes"));
        if (body.get("typeClient") != null) {
            client.setTypeClient(com.example.trackinvoices.model.enums.TypeClient.valueOf(body.get("typeClient")));
        }
        
        // Check unique code
        Optional<Client> existing = clientService.findByCodeClient(client.getCodeClient());
        if (existing.isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Ce code client est déjà utilisé"));
        }
        
        clientService.saveClient(client);
        return ResponseEntity.ok(Map.of("message", "Client créé avec succès", "id", client.getId()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateClient(@PathVariable Long id, @RequestBody Map<String, String> body) {
        Client client = clientService.getClientById(id);
        client.setRaisonSociale(body.get("raisonSociale"));
        client.setCodeClient(body.get("codeClient"));
        client.setTelephone(body.get("telephone"));
        client.setEmail(body.get("email"));
        client.setAdresse(body.get("adresse"));
        client.setVille(body.get("ville"));
        client.setNotes(body.get("notes"));
        if (body.get("typeClient") != null) {
            client.setTypeClient(com.example.trackinvoices.model.enums.TypeClient.valueOf(body.get("typeClient")));
        }
        clientService.saveClient(client);
        return ResponseEntity.ok(Map.of("message", "Client modifié avec succès"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteClient(@PathVariable Long id) {
        try {
            if (clientService.hasInvoices(id)) {
                return ResponseEntity.badRequest().body(Map.of("error", "Impossible de supprimer ce client : il possède des factures associées."));
            }
            clientService.deleteClient(id);
            return ResponseEntity.ok(Map.of("message", "Client supprimé avec succès"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Erreur lors de la suppression : " + e.getMessage()));
        }
    }

    @GetMapping("/{id}/export-excel")
    public void exportClientExcel(@PathVariable Long id, HttpServletResponse response) throws IOException {
        Client client = clientService.getClientById(id);
        String filename = "historique_" + client.getCodeClient() + "_" + LocalDate.now() + ".xlsx";
        response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        response.setHeader("Content-Disposition", "attachment; filename=\"" + filename + "\"");
        excelExportService.exportFacturesToExcel(client.getFactures(), response.getOutputStream());
        response.getOutputStream().flush();
    }
}
