package com.example.trackinvoices.model.dto;

import com.example.trackinvoices.model.enums.ModeReglement;
import com.example.trackinvoices.model.enums.StatutFacture;
import com.example.trackinvoices.model.enums.StatutLivraison;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Data
public class FactureDTO {
    private Long id;

    @NotBlank(message = "Le numero de devis est obligatoire")
    private String numeroDovis;

    @NotNull(message = "Le client est obligatoire")
    private Long clientId;

    @NotNull(message = "La date de proposition est obligatoire")
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate dateProposition;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate dateFinValidite;

    private StatutFacture statutFacture = StatutFacture.BROUILLON;
    private ModeReglement modeReglement;
    private StatutLivraison statutLivraison = StatutLivraison.EN_ATTENTE;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate dateReglement;

    private String observations;

    @Valid
    private List<LigneFactureDTO> lignes = new ArrayList<>();
}
