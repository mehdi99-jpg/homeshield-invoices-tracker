package com.example.trackinvoices.service;

import com.example.trackinvoices.model.dto.FactureDTO;
import com.example.trackinvoices.model.dto.LigneFactureDTO;
import com.example.trackinvoices.model.entity.Client;
import com.example.trackinvoices.model.entity.Facture;
import com.example.trackinvoices.model.entity.LigneFacture;
import com.example.trackinvoices.model.enums.ModeReglement;
import com.example.trackinvoices.model.enums.StatutFacture;
import com.example.trackinvoices.repository.ClientRepository;
import com.example.trackinvoices.repository.FactureRepository;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class FactureService {

    private final FactureRepository factureRepository;
    private final ClientRepository clientRepository;

    public FactureService(FactureRepository factureRepository, ClientRepository clientRepository) {
        this.factureRepository = factureRepository;
        this.clientRepository = clientRepository;
    }

    public Page<Facture> getFactures(Long clientId, String clientName, StatutFacture statut, 
                                     Integer month, Integer year,
                                     BigDecimal minAmount, BigDecimal maxAmount, 
                                     Pageable pageable) {
        return factureRepository.findAll(getSpecification(clientId, clientName, statut, month, year, minAmount, maxAmount), pageable);
    }

    public List<Facture> getFacturesList(Long clientId, String clientName, StatutFacture statut, 
                                         Integer month, Integer year,
                                         BigDecimal minAmount, BigDecimal maxAmount) {
        return factureRepository.findAll(getSpecification(clientId, clientName, statut, month, year, minAmount, maxAmount));
    }

    private Specification<Facture> getSpecification(Long clientId, String clientName, StatutFacture statut, 
                                                     Integer month, Integer year,
                                                     BigDecimal minAmount, BigDecimal maxAmount) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (clientId != null) {
                predicates.add(cb.equal(root.get("client").get("id"), clientId));
            }
            if (clientName != null && !clientName.isEmpty()) {
                predicates.add(cb.like(cb.lower(root.get("client").get("raisonSociale")), "%" + clientName.toLowerCase() + "%"));
            }
            if (statut != null) {
                predicates.add(cb.equal(root.get("statutFacture"), statut));
            }
            if (year != null) {
                predicates.add(cb.equal(cb.function("YEAR", Integer.class, root.get("dateProposition")), year));
            }
            if (month != null) {
                predicates.add(cb.equal(cb.function("MONTH", Integer.class, root.get("dateProposition")), month));
            }
            if (minAmount != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("totalTTC"), minAmount));
            }
            if (maxAmount != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("totalTTC"), maxAmount));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    public Facture getFactureById(Long id) {
        return factureRepository.findById(id).orElseThrow(() -> new RuntimeException("Facture non trouvée"));
    }

    public FactureDTO getFactureDtoById(Long id) {
        Facture f = getFactureById(id);
        FactureDTO dto = new FactureDTO();
        dto.setId(f.getId());
        dto.setNumeroDovis(f.getNumeroDovis());
        dto.setClientId(f.getClient().getId());
        dto.setDateProposition(f.getDateProposition());
        dto.setDateFinValidite(f.getDateFinValidite());
        dto.setStatutFacture(f.getStatutFacture());
        dto.setModeReglement(f.getModeReglement());
        dto.setStatutLivraison(f.getStatutLivraison());
        dto.setDateReglement(f.getDateReglement());
        dto.setObservations(f.getObservations());
        
        dto.setLignes(f.getLignes().stream().map(l -> {
            LigneFactureDTO lDto = new LigneFactureDTO();
            lDto.setId(l.getId());
            lDto.setDesignation(l.getDesignation());
            lDto.setQuantite(l.getQuantite());
            lDto.setPrixUnitaireHT(l.getPrixUnitaireHT());
            lDto.setTauxTVA(l.getTauxTVA());
            lDto.setTotalHT(l.getTotalHT());
            return lDto;
        }).collect(Collectors.toList()));
        
        return dto;
    }

    @Transactional
    public void saveFacture(FactureDTO dto) {
        Facture f = (dto.getId() != null) ? getFactureById(dto.getId()) : new Facture();
        Client client = clientRepository.findById(dto.getClientId()).orElseThrow(() -> new RuntimeException("Client non trouvé"));

        f.setClient(client);
        f.setNumeroDovis(dto.getNumeroDovis());
        f.setDateProposition(dto.getDateProposition());
        f.setDateFinValidite(dto.getDateFinValidite());
        f.setStatutFacture(dto.getStatutFacture());
        f.setModeReglement(dto.getModeReglement());
        f.setStatutLivraison(dto.getStatutLivraison());
        f.setDateReglement(dto.getDateReglement());
        f.setObservations(dto.getObservations());

        f.getLignes().clear();
        for (LigneFactureDTO lDto : dto.getLignes()) {
            LigneFacture line = new LigneFacture();
            line.setFacture(f);
            line.setDesignation(lDto.getDesignation());
            line.setQuantite(lDto.getQuantite());
            line.setPrixUnitaireHT(lDto.getPrixUnitaireHT());
            line.setTauxTVA(lDto.getTauxTVA());
            f.getLignes().add(line);
        }
        factureRepository.save(f);
    }

    public void deleteFacture(Long id) {
        factureRepository.deleteById(id);
    }

    @Transactional
    public void saveFacture(Facture f) {
        factureRepository.save(f);
    }

    public List<Facture> rechercherParNumeroOuClient(String q) {
        return factureRepository.findByNumeroFactureContainingIgnoreCaseOrClientRaisonSocialeContainingIgnoreCase(q, q);
    }
}
