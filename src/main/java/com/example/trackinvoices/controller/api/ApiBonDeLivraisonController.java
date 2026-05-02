package com.example.trackinvoices.controller.api;

import com.example.trackinvoices.model.entity.BonDeLivraison;
import com.example.trackinvoices.model.entity.LigneFacture;
import com.example.trackinvoices.model.enums.StatutLivraison;
import com.example.trackinvoices.repository.BonDeLivraisonRepository;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api/bons-de-livraison")
public class ApiBonDeLivraisonController {

    private final BonDeLivraisonRepository blRepository;

    public ApiBonDeLivraisonController(BonDeLivraisonRepository blRepository) {
        this.blRepository = blRepository;
    }

    @GetMapping
    public List<Map<String, Object>> getAll(
            @RequestParam(required = false) String dateDebut,
            @RequestParam(required = false) String dateFin,
            @RequestParam(required = false) String statut) {
        
        List<BonDeLivraison> bls;
        if (dateDebut != null && dateFin != null && !dateDebut.isEmpty() && !dateFin.isEmpty()) {
            bls = blRepository.findByDateEmissionBetween(LocalDate.parse(dateDebut), LocalDate.parse(dateFin));
        } else {
            bls = blRepository.findAll();
        }
        
        if (statut != null && !statut.isEmpty()) {
            try {
                StatutLivraison sl = StatutLivraison.valueOf(statut);
                bls = bls.stream().filter(b -> b.getStatutLivraison() == sl).toList();
            } catch (Exception ignored) {}
        }

        return bls.stream().map(this::mapBLSummary).toList();
    }

    @GetMapping("/{id}")
    public Map<String, Object> getDetail(@PathVariable Long id) {
        BonDeLivraison bl = blRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("BL non trouvé"));
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", bl.getId());
        map.put("numeroBL", bl.getNumeroBL());
        map.put("statut", bl.getStatutLivraison() != null ? bl.getStatutLivraison().name() : null);
        map.put("statutLabel", bl.getStatutLivraison() != null ? bl.getStatutLivraison().getLibelle() : null);
        map.put("dateEmission", bl.getDateEmission());
        map.put("dateLivraison", bl.getDateLivraison());
        map.put("lieuLivraison", bl.getAdresseLivraison());
        map.put("commentaires", bl.getCommentaires());

        if (bl.getFacture() != null) {
            map.put("factureNumero", bl.getFacture().getNumeroFacture());
            map.put("factureId", bl.getFacture().getId());
            
            // Client info
            if (bl.getFacture().getClient() != null) {
                var c = bl.getFacture().getClient();
                map.put("client", Map.of(
                    "raisonSociale", c.getRaisonSociale() != null ? c.getRaisonSociale() : "",
                    "code", c.getCodeClient() != null ? c.getCodeClient() : "",
                    "telephone", c.getTelephone() != null ? c.getTelephone() : "",
                    "email", c.getEmail() != null ? c.getEmail() : "",
                    "adresse", c.getAdresse() != null ? c.getAdresse() : "",
                    "ville", c.getVille() != null ? c.getVille() : ""
                ));
            }

            // Line items from facture
            List<Map<String, Object>> lignes = new ArrayList<>();
            if (bl.getFacture().getLignes() != null) {
                for (LigneFacture l : bl.getFacture().getLignes()) {
                    Map<String, Object> lm = new LinkedHashMap<>();
                    lm.put("designation", l.getDesignation());
                    lm.put("quantite", l.getQuantite());
                    lignes.add(lm);
                }
            }
            map.put("lignes", lignes);
        }

        return map;
    }

    private Map<String, Object> mapBLSummary(BonDeLivraison bl) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", bl.getId());
        map.put("numeroBL", bl.getNumeroBL());
        map.put("factureNumero", bl.getFacture() != null ? bl.getFacture().getNumeroFacture() : "");
        map.put("factureId", bl.getFacture() != null ? bl.getFacture().getId() : null);
        map.put("client", bl.getFacture() != null && bl.getFacture().getClient() != null 
            ? bl.getFacture().getClient().getRaisonSociale() : "");
        map.put("dateEmission", bl.getDateEmission());
        map.put("dateLivraison", bl.getDateLivraison());
        map.put("statut", bl.getStatutLivraison() != null ? bl.getStatutLivraison().name() : null);
        map.put("statutLabel", bl.getStatutLivraison() != null ? bl.getStatutLivraison().getLibelle() : null);
        return map;
    }
}
