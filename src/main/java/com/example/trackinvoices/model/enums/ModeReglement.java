package com.example.trackinvoices.model.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum ModeReglement {
    NON_DEFINI("Non défini"),
    CHEQUE("Chèque"),
    VIREMENT("Virement"),
    ESPECES("Espèces"),
    CARTE_BANCAIRE("Carte Bancaire");

    private final String libelle;
}
