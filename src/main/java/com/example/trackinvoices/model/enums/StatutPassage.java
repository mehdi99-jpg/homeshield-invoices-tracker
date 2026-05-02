package com.example.trackinvoices.model.enums;

import lombok.Getter;

@Getter
public enum StatutPassage {
    PLANIFIE("Planifié"),
    EN_COURS("En cours"),
    EFFECTUE("Effectué"),
    REPORTE("Reporté"),
    ANNULE("Annulé");

    private final String libelle;

    StatutPassage(String libelle) {
        this.libelle = libelle;
    }
}