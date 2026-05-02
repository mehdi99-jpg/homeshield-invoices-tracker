package com.example.trackinvoices.model.entity;

import com.example.trackinvoices.model.enums.StatutPassage;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Passage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "facture_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Facture facture;

    private Integer numeroPassage;

    @org.springframework.format.annotation.DateTimeFormat(pattern = "yyyy-MM-dd")
    private LocalDate datePassage;

    @org.springframework.format.annotation.DateTimeFormat(pattern = "HH:mm")
    private LocalTime heurePrise;
    
    private String technicien;

    @Column(columnDefinition = "TEXT")
    private String notesIntervention;

    @Enumerated(EnumType.STRING)
    private StatutPassage statutPassage;

    private String produitUtilise;
    private String zonesTraitees;
}