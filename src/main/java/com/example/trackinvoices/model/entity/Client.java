package com.example.trackinvoices.model.entity;

import com.example.trackinvoices.model.enums.TypeClient;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Client {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "La raison sociale est obligatoire")
    private String raisonSociale;
    
    @NotBlank(message = "Le code client est obligatoire")
    @Column(unique = true)
    private String codeClient;
    
    private String adresse;
    private String ville;
    
    @NotBlank(message = "Le téléphone est obligatoire")
    private String telephone;
    
    @Email(message = "Email invalide")
    private String email;

    @NotNull(message = "Le type de client est obligatoire")
    @Enumerated(EnumType.STRING)
    private TypeClient typeClient;

    private LocalDate dateCreation;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @OneToMany(mappedBy = "client") // Removed CascadeType.ALL to prevent accidental deletion of invoices
    @JsonIgnore
    private List<Facture> factures = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        if (dateCreation == null) {
            dateCreation = LocalDate.now();
        }
    }
}
