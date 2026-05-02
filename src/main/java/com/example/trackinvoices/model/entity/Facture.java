package com.example.trackinvoices.model.entity;

import com.example.trackinvoices.model.enums.ModeReglement;
import com.example.trackinvoices.model.enums.StatutFacture;
import com.example.trackinvoices.model.enums.StatutLivraison;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Facture {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String numeroFacture;

    private String numeroDovis;
    private LocalDate dateProposition;
    private LocalDate dateFinValidite;

    @ManyToOne
    @JoinColumn(name = "client_id")
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Client client;

    @OneToMany(mappedBy = "facture", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<LigneFacture> lignes = new ArrayList<>();

    @OneToOne(mappedBy = "facture", cascade = CascadeType.ALL)
    private BonDeLivraison bonDeLivraison;

    @OneToMany(mappedBy = "facture", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("numeroPassage ASC")
    private List<Passage> passages = new ArrayList<>();

    @Enumerated(EnumType.STRING)
    private StatutFacture statutFacture;

    @Enumerated(EnumType.STRING)
    private StatutLivraison statutLivraison;

    @Enumerated(EnumType.STRING)
    private ModeReglement modeReglement;

    private LocalDate dateReglement;

    @Column(columnDefinition = "TEXT")
    private String observations;

    private BigDecimal totalHT = BigDecimal.ZERO;
    private BigDecimal totalTVA = BigDecimal.ZERO;
    private BigDecimal totalTTC = BigDecimal.ZERO;

    @PrePersist
    public void onPrePersist() {
        if (this.numeroFacture == null) {
            this.numeroFacture = generateNumeroFacture();
        }
        calculateTotals();
    }

    @PreUpdate
    public void onPreUpdate() {
        calculateTotals();
    }

    private String generateNumeroFacture() {
        String datePart = LocalDate.now().format(DateTimeFormatter.ofPattern("yyMM"));
        int randomPart = new Random().nextInt(9000) + 1000;
        return "DV-" + datePart + "-" + randomPart;
    }

    public void calculateTotals() {
        BigDecimal sumHT = BigDecimal.ZERO;
        BigDecimal sumTVA = BigDecimal.ZERO;

        if (lignes != null) {
            for (LigneFacture ligne : lignes) {
                ligne.calculateTotal();
                
                BigDecimal ligneHT = ligne.getTotalHT();
                sumHT = sumHT.add(ligneHT);
                
                BigDecimal ligneTVA = ligneHT.multiply(BigDecimal.valueOf(ligne.getTauxTVA() / 100.0));
                sumTVA = sumTVA.add(ligneTVA);
            }
        }

        this.totalHT = sumHT;
        this.totalTVA = sumTVA;
        this.totalTTC = this.totalHT.add(this.totalTVA);
    }
}