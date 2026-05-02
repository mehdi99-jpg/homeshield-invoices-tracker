package com.example.trackinvoices.controller.api;

import com.example.trackinvoices.model.entity.Passage;
import com.example.trackinvoices.model.enums.StatutPassage;
import com.example.trackinvoices.repository.PassageRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/interventions")
public class ApiInterventionController {

    private final PassageRepository passageRepository;

    public ApiInterventionController(PassageRepository passageRepository) {
        this.passageRepository = passageRepository;
    }

    @GetMapping("/{id}")
    public Map<String, Object> getIntervention(@PathVariable Long id) {
        Passage p = passageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Intervention non trouvée"));
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", p.getId());
        map.put("numeroPassage", p.getNumeroPassage());
        map.put("datePassage", p.getDatePassage());
        map.put("heure", p.getHeurePrise() != null ? p.getHeurePrise().toString() : null);
        map.put("technicien", p.getTechnicien());
        map.put("statut", p.getStatutPassage() != null ? p.getStatutPassage().name() : null);
        map.put("statutLabel", p.getStatutPassage() != null ? p.getStatutPassage().getLibelle() : null);
        map.put("zonesTraitees", p.getZonesTraitees());
        map.put("produitUtilise", p.getProduitUtilise());
        map.put("notes", p.getNotesIntervention());
        return map;
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateIntervention(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        Passage p = passageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Intervention non trouvée"));
        if (body.get("numeroPassage") != null) p.setNumeroPassage(Integer.valueOf(body.get("numeroPassage").toString()));
        if (body.get("statut") != null) p.setStatutPassage(StatutPassage.valueOf(body.get("statut").toString()));
        if (body.get("datePassage") != null) p.setDatePassage(LocalDate.parse(body.get("datePassage").toString()));
        if (body.get("heure") != null && !body.get("heure").toString().isEmpty()) p.setHeurePrise(LocalTime.parse(body.get("heure").toString()));
        if (body.containsKey("technicien")) p.setTechnicien(body.get("technicien") != null ? body.get("technicien").toString() : null);
        if (body.containsKey("zonesTraitees")) p.setZonesTraitees(body.get("zonesTraitees") != null ? body.get("zonesTraitees").toString() : null);
        if (body.containsKey("produitUtilise")) p.setProduitUtilise(body.get("produitUtilise") != null ? body.get("produitUtilise").toString() : null);
        if (body.containsKey("notes")) p.setNotesIntervention(body.get("notes") != null ? body.get("notes").toString() : null);
        passageRepository.save(p);
        return ResponseEntity.ok(Map.of("message", "Intervention mise à jour"));
    }
}
