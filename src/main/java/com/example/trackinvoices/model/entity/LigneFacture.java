package com.example.trackinvoices.model.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LigneFacture {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "facture_id")
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Facture facture;

    private String designation;
    private Double quantite;
    private BigDecimal prixUnitaireHT;
    
    private Double tauxTVA = 20.0;
    
    private BigDecimal totalHT;

    @PrePersist
    @PreUpdate
    public void calculateTotal() {
        if (quantite != null && prixUnitaireHT != null) {
            this.totalHT = prixUnitaireHT.multiply(BigDecimal.valueOf(quantite));
        } else {
            this.totalHT = BigDecimal.ZERO;
        }
    }
}
