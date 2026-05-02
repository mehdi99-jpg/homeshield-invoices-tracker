package com.example.trackinvoices.model.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum StatutFacture {
    BROUILLON("Brouillon"),
    EN_ATTENTE("En attente"),
    LIVREE("Livrée"),
    PAYEE("Payée"),
    ANNULEE("Annulée"),
    EN_RETARD("En retard");

    private final String libelle;
}
