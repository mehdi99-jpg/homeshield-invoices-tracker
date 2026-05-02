package com.example.trackinvoices.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class LigneFactureDTO {
    private Long id;

    @NotBlank(message = "La designation est obligatoire")
    private String designation;

    @NotNull(message = "La quantite est obligatoire")
    @Positive(message = "La quantite doit etre positive")
    private Double quantite;

    @NotNull(message = "Le prix unitaire est obligatoire")
    @Positive(message = "Le prix doit etre positif")
    private BigDecimal prixUnitaireHT;

    private Double tauxTVA = 20.0;
    private BigDecimal totalHT = BigDecimal.ZERO;
}
