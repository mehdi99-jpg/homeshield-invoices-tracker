package com.example.trackinvoices.service;

import com.example.trackinvoices.model.entity.Facture;
import com.example.trackinvoices.model.entity.Passage;
import com.example.trackinvoices.model.enums.StatutPassage;
import com.example.trackinvoices.repository.PassageRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class PassageService {

    private final PassageRepository passageRepository;

    public PassageService(PassageRepository passageRepository) {
        this.passageRepository = passageRepository;
    }

    public List<Passage> getPassagesByFacture(Long factureId) {
        return passageRepository.findByFactureIdOrderByNumeroPassageAsc(factureId);
    }

    @Transactional
    public Passage savePassage(Passage passage) {
        return passageRepository.save(passage);
    }

    public long countByFacture(Facture facture) {
        return passageRepository.countByFacture(facture);
    }

    public long countEffectuesByFacture(Facture facture) {
        return passageRepository.countByFactureAndStatutPassage(facture, StatutPassage.EFFECTUE);
    }
}