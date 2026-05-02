package com.example.trackinvoices.model.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum StatutLivraison {
    EN_ATTENTE("En attente"),
    EN_COURS("En cours"),
    LIVREE("Livrée"),
    ECHEC("Échec");

    private final String libelle;
}
