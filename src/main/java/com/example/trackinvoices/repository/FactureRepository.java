package com.example.trackinvoices.repository;

import com.example.trackinvoices.model.entity.Client;
import com.example.trackinvoices.model.entity.Facture;
import com.example.trackinvoices.model.enums.ModeReglement;
import com.example.trackinvoices.model.enums.StatutFacture;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface FactureRepository extends JpaRepository<Facture, Long>, JpaSpecificationExecutor<Facture> {
    List<Facture> findByClient(Client client);
    List<Facture> findByStatutFacture(StatutFacture statut);
    List<Facture> findByDatePropositionBetween(LocalDate start, LocalDate end);
    List<Facture> findByModeReglement(ModeReglement mode);

    @Query("SELECT COALESCE(SUM(f.totalTTC), 0) FROM Facture f WHERE f.statutFacture = 'PAYEE' AND f.dateProposition >= :start AND f.dateProposition <= :end")
    BigDecimal sumTotalTTCPayeeBetween(@Param("start") LocalDate start, @Param("end") LocalDate end);

    @Query("SELECT COUNT(f) FROM Facture f WHERE f.dateProposition >= :start AND f.dateProposition <= :end")
    long countBetween(@Param("start") LocalDate start, @Param("end") LocalDate end);

    @Query("SELECT COUNT(f) FROM Facture f WHERE f.statutFacture IN ('EN_ATTENTE', 'BROUILLON') AND f.dateProposition >= :start AND f.dateProposition <= :end")
    long countUnpaidBetween(@Param("start") LocalDate start, @Param("end") LocalDate end);

    @Query("SELECT COUNT(f) FROM Facture f WHERE f.statutFacture = 'EN_RETARD' AND f.dateProposition >= :start AND f.dateProposition <= :end")
    long countOverdueBetween(@Param("start") LocalDate start, @Param("end") LocalDate end);

    @Query("SELECT COUNT(f) FROM Facture f WHERE f.statutFacture = 'PAYEE' AND f.dateProposition >= :start AND f.dateProposition <= :end")
    long countPayeeBetween(@Param("start") LocalDate start, @Param("end") LocalDate end);
    
    @Query("SELECT COALESCE(AVG(f.totalTTC), 0) FROM Facture f WHERE f.statutFacture != 'ANNULEE' AND f.dateProposition >= :start AND f.dateProposition <= :end")
    BigDecimal averageTotalTTCBetween(@Param("start") LocalDate start, @Param("end") LocalDate end);

    @Query("SELECT f.client FROM Facture f WHERE f.dateProposition >= :start AND f.dateProposition <= :end GROUP BY f.client ORDER BY SUM(f.totalTTC) DESC LIMIT 1")
    Client findTopClientBetween(@Param("start") LocalDate start, @Param("end") LocalDate end);

    @Query("SELECT MONTH(f.dateProposition) as month, COALESCE(SUM(f.totalTTC), 0) as revenue FROM Facture f WHERE f.statutFacture != 'ANNULEE' AND YEAR(f.dateProposition) = :year GROUP BY MONTH(f.dateProposition)")
    List<Object[]> getMonthlyRevenue(@Param("year") int year);

    @Query("SELECT f.modeReglement, COALESCE(SUM(f.totalTTC), 0) FROM Facture f WHERE f.statutFacture != 'ANNULEE' AND f.dateProposition >= :start AND f.dateProposition <= :end GROUP BY f.modeReglement")
    List<Object[]> getRevenueByPaymentModeBetween(@Param("start") LocalDate start, @Param("end") LocalDate end);

    @Query("SELECT f.client.raisonSociale, COALESCE(SUM(f.totalTTC), 0) FROM Facture f WHERE f.statutFacture != 'ANNULEE' AND f.dateProposition >= :start AND f.dateProposition <= :end GROUP BY f.client ORDER BY SUM(f.totalTTC) DESC LIMIT 5")
    List<Object[]> getTopClients(@Param("start") LocalDate start, @Param("end") LocalDate end);

    @Query("SELECT MONTH(f.dateProposition), f.statutFacture, COUNT(f) FROM Facture f WHERE YEAR(f.dateProposition) = :year GROUP BY MONTH(f.dateProposition), f.statutFacture")
    List<Object[]> getStatusBreakdownByMonth(@Param("year") int year);

    @Query("SELECT MONTH(f.dateProposition), COALESCE(AVG(f.totalTTC), 0) FROM Facture f WHERE f.statutFacture != 'ANNULEE' AND YEAR(f.dateProposition) = :year GROUP BY MONTH(f.dateProposition)")
    List<Object[]> getAverageInvoiceValueByMonth(@Param("year") int year);

    List<Facture> findTop5ByOrderByDatePropositionDesc();

    List<Facture> findByNumeroFactureContainingIgnoreCaseOrNumeroDovisContainingIgnoreCase(String numeroFacture, String numeroDovis);
    List<Facture> findByNumeroFactureContainingIgnoreCaseOrClientRaisonSocialeContainingIgnoreCase(String numeroFacture, String clientName);
}