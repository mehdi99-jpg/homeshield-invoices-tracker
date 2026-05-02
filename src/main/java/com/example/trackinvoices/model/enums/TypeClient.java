package com.example.trackinvoices.model.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum TypeClient {
    RESIDENCE("Résidence"),
    MAGASIN("Magasin"),
    ATELIER("Atelier"),
    CAFE("Café"),
    HOTEL("Hôtel"),
    ENTREPRISE("Entreprise"),
    AUTRE("Autre");

    private final String libelle;
}
