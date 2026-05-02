package com.example.trackinvoices.repository;

import com.example.trackinvoices.model.entity.Facture;
import com.example.trackinvoices.model.entity.Passage;
import com.example.trackinvoices.model.enums.StatutPassage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PassageRepository extends JpaRepository<Passage, Long> {
    List<Passage> findByFactureIdOrderByNumeroPassageAsc(Long factureId);
    List<Passage> findByDatePassageBetween(java.time.LocalDate start, java.time.LocalDate end);
    long countByFacture(Facture facture);
    long countByFactureAndStatutPassage(Facture facture, StatutPassage statut);
}