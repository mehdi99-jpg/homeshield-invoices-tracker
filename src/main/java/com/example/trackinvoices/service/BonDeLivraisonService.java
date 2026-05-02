package com.example.trackinvoices.service;

import com.example.trackinvoices.model.entity.BonDeLivraison;
import com.example.trackinvoices.model.entity.Facture;
import com.example.trackinvoices.repository.BonDeLivraisonRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Service
public class BonDeLivraisonService {

    private final BonDeLivraisonRepository bonDeLivraisonRepository;

    public BonDeLivraisonService(BonDeLivraisonRepository bonDeLivraisonRepository) {
        this.bonDeLivraisonRepository = bonDeLivraisonRepository;
    }

    @Transactional
    public BonDeLivraison createFromFacture(Facture facture) {
        if (facture.getBonDeLivraison() != null) {
            return facture.getBonDeLivraison();
        }

        BonDeLivraison bl = new BonDeLivraison();
        bl.setFacture(facture);
        bl.setNumeroBL(generateNumeroBL());
        bl.setDateEmission(LocalDate.now());
        bl.setStatutLivraison(facture.getStatutLivraison());
        bl.setAdresseLivraison(facture.getClient().getAdresse() + ", " + facture.getClient().getVille());
        
        return bonDeLivraisonRepository.save(bl);
    }

    private String generateNumeroBL() {
        LocalDate now = LocalDate.now();
        String yearPart = now.format(DateTimeFormatter.ofPattern("yy"));
        long count = bonDeLivraisonRepository.countByYear(now.getYear()) + 1;
        return String.format("BL-%s-%03d", yearPart, count);
    }
}