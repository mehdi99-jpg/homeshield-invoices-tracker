package com.example.trackinvoices.model.entity;

import com.example.trackinvoices.model.enums.StatutLivraison;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BonDeLivraison {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String numeroBL;

    @OneToOne
    @JoinColumn(name = "facture_id")
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Facture facture;

    private LocalDate dateEmission;
    private LocalDate dateLivraison;
    private String adresseLivraison;
    
    @Column(columnDefinition = "TEXT")
    private String commentaires;

    @Enumerated(EnumType.STRING)
    private StatutLivraison statutLivraison;

    @PrePersist
    public void prePersist() {
        if (this.dateEmission == null) {
            this.dateEmission = LocalDate.now();
        }
    }
}