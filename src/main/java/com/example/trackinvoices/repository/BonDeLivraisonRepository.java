package com.example.trackinvoices.repository;

import com.example.trackinvoices.model.entity.BonDeLivraison;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BonDeLivraisonRepository extends JpaRepository<BonDeLivraison, Long> {
    Optional<BonDeLivraison> findByNumeroBL(String numeroBL);
    List<BonDeLivraison> findByDateEmissionBetween(java.time.LocalDate start, java.time.LocalDate end);
    
    @Query("SELECT COUNT(b) FROM BonDeLivraison b WHERE YEAR(b.dateEmission) = :year")
    long countByYear(int year);
}