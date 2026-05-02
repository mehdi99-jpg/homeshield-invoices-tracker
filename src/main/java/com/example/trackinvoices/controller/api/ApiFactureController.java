package com.example.trackinvoices.controller.api;

import com.example.trackinvoices.model.dto.FactureDTO;
import com.example.trackinvoices.model.dto.LigneFactureDTO;
import com.example.trackinvoices.model.entity.Facture;
import com.example.trackinvoices.model.entity.LigneFacture;
import com.example.trackinvoices.model.entity.Passage;
import com.example.trackinvoices.model.enums.ModeReglement;
import com.example.trackinvoices.model.enums.StatutFacture;
import com.example.trackinvoices.model.enums.StatutLivraison;
import com.example.trackinvoices.model.enums.StatutPassage;
import com.example.trackinvoices.repository.ClientRepository;
import com.example.trackinvoices.repository.FactureRepository;
import com.example.trackinvoices.service.BonDeLivraisonService;
import com.example.trackinvoices.service.FactureService;
import com.example.trackinvoices.service.PassageService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@RestController
@RequestMapping("/api/factures")
public class ApiFactureController {

    private final FactureService factureService;
    private final FactureRepository factureRepository;
    private final ClientRepository clientRepository;
    private final PassageService passageService;
    private final BonDeLivraisonService bonDeLivraisonService;

    public ApiFactureController(FactureService factureService, FactureRepository factureRepository,
                                ClientRepository clientRepository, PassageService passageService,
                                BonDeLivraisonService bonDeLivraisonService) {
        this.factureService = factureService;
        this.factureRepository = factureRepository;
        this.clientRepository = clientRepository;
        this.passageService = passageService;
        this.bonDeLivraisonService = bonDeLivraisonService;
    }

    @GetMapping
    public List<Map<String, Object>> getFactures(
            @RequestParam(required = false) String statut,
            @RequestParam(required = false) Long clientId,
            @RequestParam(required = false) String dateDebut,
            @RequestParam(required = false) String dateFin) {

        StatutFacture sf = null;
        if (statut != null && !statut.isEmpty()) {
            try { sf = StatutFacture.valueOf(statut); } catch (Exception ignored) {}
        }

        Integer month = null, year = null;
        if (dateDebut != null && !dateDebut.isEmpty()) {
            LocalDate d = LocalDate.parse(dateDebut);
            month = d.getMonthValue();
            year = d.getYear();
        }

        List<Facture> factures = factureService.getFacturesList(clientId, null, sf, month, year, null, null);
        
        // Filter by date range if both provided
        if (dateDebut != null && !dateDebut.isEmpty() && dateFin != null && !dateFin.isEmpty()) {
            LocalDate start = LocalDate.parse(dateDebut);
            LocalDate end = LocalDate.parse(dateFin);
            factures = factures.stream()
                .filter(f -> f.getDateProposition() != null && 
                    !f.getDateProposition().isBefore(start) && !f.getDateProposition().isAfter(end))
                .toList();
        }

        return factures.stream().map(this::mapFactureSummary).toList();
    }

    @GetMapping("/recent")
    public List<Map<String, Object>> getRecentFactures(@RequestParam(defaultValue = "5") int limit) {
        List<Facture> factures = factureRepository.findTop5ByOrderByDatePropositionDesc();
        return factures.stream().limit(limit).map(this::mapFactureSummary).toList();
    }

    @GetMapping("/{id}")
    public Map<String, Object> getFacture(@PathVariable Long id) {
        Facture f = factureService.getFactureById(id);
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", f.getId());
        map.put("numero", f.getNumeroFacture());
        map.put("numeroDovis", f.getNumeroDovis());
        map.put("client", f.getClient() != null ? Map.of(
            "id", f.getClient().getId(),
            "raisonSociale", f.getClient().getRaisonSociale(),
            "code", f.getClient().getCodeClient() != null ? f.getClient().getCodeClient() : "",
            "adresse", f.getClient().getAdresse() != null ? f.getClient().getAdresse() : "",
            "ville", f.getClient().getVille() != null ? f.getClient().getVille() : "",
            "telephone", f.getClient().getTelephone() != null ? f.getClient().getTelephone() : "",
            "email", f.getClient().getEmail() != null ? f.getClient().getEmail() : ""
        ) : null);
        map.put("date", f.getDateProposition());
        map.put("validite", f.getDateFinValidite());
        map.put("referanceDossier", f.getNumeroDovis());
        map.put("modeReglement", f.getModeReglement() != null ? f.getModeReglement().getLibelle() : "Non défini");
        map.put("modeReglementEnum", f.getModeReglement() != null ? f.getModeReglement().name() : null);

        // Line items
        List<Map<String, Object>> lignes = new ArrayList<>();
        if (f.getLignes() != null) {
            for (LigneFacture l : f.getLignes()) {
                Map<String, Object> lm = new LinkedHashMap<>();
                lm.put("id", l.getId());
                lm.put("designation", l.getDesignation());
                lm.put("quantite", l.getQuantite());
                lm.put("prixUnitaireHT", l.getPrixUnitaireHT());
                lm.put("tauxTVA", l.getTauxTVA());
                lm.put("totalHT", l.getTotalHT());
                lignes.add(lm);
            }
        }
        map.put("lignes", lignes);

        map.put("totalHT", f.getTotalHT());
        map.put("totalTVA", f.getTotalTVA());
        map.put("totalTTC", f.getTotalTTC());
        map.put("statut", f.getStatutFacture() != null ? f.getStatutFacture().name() : null);
        map.put("statutLabel", f.getStatutFacture() != null ? f.getStatutFacture().getLibelle() : null);
        map.put("livraisonStatut", f.getStatutLivraison() != null ? f.getStatutLivraison().name() : null);
        map.put("livraisonStatutLabel", f.getStatutLivraison() != null ? f.getStatutLivraison().getLibelle() : null);
        map.put("observations", f.getObservations());
        map.put("dateReglement", f.getDateReglement());

        // Interventions
        List<Map<String, Object>> interventions = new ArrayList<>();
        if (f.getPassages() != null) {
            for (Passage p : f.getPassages()) {
                Map<String, Object> pm = new LinkedHashMap<>();
                pm.put("id", p.getId());
                pm.put("numeroPassage", p.getNumeroPassage());
                pm.put("datePassage", p.getDatePassage());
                pm.put("heure", p.getHeurePrise() != null ? p.getHeurePrise().toString() : null);
                pm.put("technicien", p.getTechnicien());
                pm.put("statut", p.getStatutPassage() != null ? p.getStatutPassage().name() : null);
                pm.put("statutLabel", p.getStatutPassage() != null ? p.getStatutPassage().getLibelle() : null);
                pm.put("zonesTraitees", p.getZonesTraitees());
                pm.put("produitUtilise", p.getProduitUtilise());
                pm.put("notes", p.getNotesIntervention());
                interventions.add(pm);
            }
        }
        map.put("interventions", interventions);

        // BL info
        map.put("hasBonLivraison", f.getBonDeLivraison() != null);
        map.put("bonLivraisonId", f.getBonDeLivraison() != null ? f.getBonDeLivraison().getId() : null);

        return map;
    }

    @PostMapping
    public ResponseEntity<?> createFacture(@RequestBody Map<String, Object> body) {
        try {
            FactureDTO dto = mapBodyToDto(body);
            factureService.saveFacture(dto);
            return ResponseEntity.ok(Map.of("message", "Facture créée avec succès"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Erreur lors de la création : " + e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateFacture(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        try {
            FactureDTO dto = mapBodyToDto(body);
            dto.setId(id);
            factureService.saveFacture(dto);
            return ResponseEntity.ok(Map.of("message", "Facture modifiée avec succès"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Erreur lors de la modification : " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteFacture(@PathVariable Long id) {
        try {
            factureService.deleteFacture(id);
            return ResponseEntity.ok(Map.of("message", "Facture supprimée avec succès"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Impossible de supprimer la facture"));
        }
    }

    @PatchMapping("/{id}/statut")
    public ResponseEntity<?> updateStatut(@PathVariable Long id, @RequestBody Map<String, String> body) {
        Facture f = factureService.getFactureById(id);
        String statut = body.get("statut");
        if (statut != null) {
            f.setStatutFacture(StatutFacture.valueOf(statut));
            if (StatutFacture.valueOf(statut) == StatutFacture.PAYEE && f.getDateReglement() == null) {
                f.setDateReglement(LocalDate.now());
            }
        }
        factureService.saveFacture(f);
        return ResponseEntity.ok(Map.of("message", "Statut mis à jour"));
    }

    @PatchMapping("/{id}/livraison-statut")
    public ResponseEntity<?> updateLivraisonStatut(@PathVariable Long id, @RequestBody Map<String, String> body) {
        Facture f = factureService.getFactureById(id);
        String statut = body.get("statut");
        if (statut != null) {
            f.setStatutLivraison(StatutLivraison.valueOf(statut));
        }
        factureService.saveFacture(f);
        return ResponseEntity.ok(Map.of("message", "Statut livraison mis à jour"));
    }

    @PostMapping("/{id}/envoyer")
    public ResponseEntity<?> envoyerFacture(@PathVariable Long id) {
        // Placeholder - no email service
        return ResponseEntity.ok(Map.of("message", "Facture envoyée avec succès (simulation)"));
    }

    @GetMapping("/{id}/bon-livraison")
    public ResponseEntity<?> getBonLivraison(@PathVariable Long id) {
        Facture f = factureService.getFactureById(id);
        if (f.getBonDeLivraison() != null) {
            return ResponseEntity.ok(Map.of("bonLivraisonId", f.getBonDeLivraison().getId()));
        }
        // Create one
        try {
            var bl = bonDeLivraisonService.createFromFacture(f);
            return ResponseEntity.ok(Map.of("bonLivraisonId", bl.getId()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Erreur lors de la création du BL"));
        }
    }

    @PostMapping("/{factureId}/interventions")
    public ResponseEntity<?> createIntervention(@PathVariable Long factureId, @RequestBody Map<String, Object> body) {
        try {
            Facture f = factureService.getFactureById(factureId);
            Passage p = mapPassage(body, f);
            if (p.getNumeroPassage() == null) {
                p.setNumeroPassage((int) (passageService.countByFacture(f) + 1));
            }
            passageService.savePassage(p);
            return ResponseEntity.ok(Map.of("message", "Intervention enregistrée"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Erreur : " + e.getMessage()));
        }
    }

    // -- Helpers --

    private Map<String, Object> mapFactureSummary(Facture f) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", f.getId());
        map.put("numero", f.getNumeroFacture());
        map.put("client", f.getClient() != null ? f.getClient().getRaisonSociale() : "");
        map.put("clientId", f.getClient() != null ? f.getClient().getId() : null);
        map.put("date", f.getDateProposition());
        map.put("montantTTC", f.getTotalTTC());
        map.put("statut", f.getStatutFacture() != null ? f.getStatutFacture().name() : null);
        map.put("statutLabel", f.getStatutFacture() != null ? f.getStatutFacture().getLibelle() : null);
        map.put("livraisonStatut", f.getStatutLivraison() != null ? f.getStatutLivraison().name() : null);
        map.put("livraisonStatutLabel", f.getStatutLivraison() != null ? f.getStatutLivraison().getLibelle() : null);
        return map;
    }

    @SuppressWarnings("unchecked")
    private FactureDTO mapBodyToDto(Map<String, Object> body) {
        FactureDTO dto = new FactureDTO();
        if (body.get("clientId") != null) dto.setClientId(Long.valueOf(body.get("clientId").toString()));
        dto.setNumeroDovis(body.get("numeroDovis") != null ? body.get("numeroDovis").toString() : null);
        if (body.get("dateProposition") != null) dto.setDateProposition(LocalDate.parse(body.get("dateProposition").toString()));
        if (body.get("dateFinValidite") != null && !body.get("dateFinValidite").toString().isEmpty()) 
            dto.setDateFinValidite(LocalDate.parse(body.get("dateFinValidite").toString()));
        if (body.get("statutFacture") != null && !body.get("statutFacture").toString().isEmpty())
            dto.setStatutFacture(StatutFacture.valueOf(body.get("statutFacture").toString()));
        if (body.get("modeReglement") != null && !body.get("modeReglement").toString().isEmpty())
            dto.setModeReglement(ModeReglement.valueOf(body.get("modeReglement").toString()));
        if (body.get("statutLivraison") != null && !body.get("statutLivraison").toString().isEmpty())
            dto.setStatutLivraison(StatutLivraison.valueOf(body.get("statutLivraison").toString()));
        dto.setObservations(body.get("observations") != null ? body.get("observations").toString() : null);

        List<Map<String, Object>> lignes = (List<Map<String, Object>>) body.get("lignes");
        if (lignes != null) {
            List<LigneFactureDTO> ldtos = new ArrayList<>();
            for (Map<String, Object> l : lignes) {
                LigneFactureDTO ld = new LigneFactureDTO();
                ld.setDesignation(l.get("designation") != null ? l.get("designation").toString() : "");
                ld.setQuantite(l.get("quantite") != null ? Double.valueOf(l.get("quantite").toString()) : 0.0);
                ld.setPrixUnitaireHT(l.get("prixUnitaireHT") != null ? new BigDecimal(l.get("prixUnitaireHT").toString()) : BigDecimal.ZERO);
                ld.setTauxTVA(l.get("tauxTVA") != null ? Double.valueOf(l.get("tauxTVA").toString()) : 20.0);
                ldtos.add(ld);
            }
            dto.setLignes(ldtos);
        }
        return dto;
    }

    private Passage mapPassage(Map<String, Object> body, Facture f) {
        Passage p = new Passage();
        p.setFacture(f);
        if (body.get("numeroPassage") != null) p.setNumeroPassage(Integer.valueOf(body.get("numeroPassage").toString()));
        if (body.get("statut") != null) p.setStatutPassage(StatutPassage.valueOf(body.get("statut").toString()));
        if (body.get("datePassage") != null) p.setDatePassage(LocalDate.parse(body.get("datePassage").toString()));
        if (body.get("heure") != null && !body.get("heure").toString().isEmpty()) p.setHeurePrise(LocalTime.parse(body.get("heure").toString()));
        p.setTechnicien(body.get("technicien") != null ? body.get("technicien").toString() : null);
        p.setZonesTraitees(body.get("zonesTraitees") != null ? body.get("zonesTraitees").toString() : null);
        p.setProduitUtilise(body.get("produitUtilise") != null ? body.get("produitUtilise").toString() : null);
        p.setNotesIntervention(body.get("notes") != null ? body.get("notes").toString() : null);
        return p;
    }
}
