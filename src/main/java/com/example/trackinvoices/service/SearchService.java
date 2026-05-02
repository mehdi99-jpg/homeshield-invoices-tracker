package com.example.trackinvoices.service;

import com.example.trackinvoices.model.entity.Client;
import com.example.trackinvoices.model.entity.Facture;
import com.example.trackinvoices.repository.ClientRepository;
import com.example.trackinvoices.repository.FactureRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class SearchService {

    private final ClientRepository clientRepository;
    private final FactureRepository factureRepository;

    public SearchService(ClientRepository clientRepository, FactureRepository factureRepository) {
        this.clientRepository = clientRepository;
        this.factureRepository = factureRepository;
    }

    public List<Map<String, Object>> globalSearch(String query) {
        List<Map<String, Object>> results = new ArrayList<>();
        
        // Search Clients
        List<Client> clients = clientRepository.findByRaisonSocialeContainingIgnoreCaseOrCodeClientContainingIgnoreCase(query, query);
        for (Client c : clients) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", c.getId());
            map.put("type", "CLIENT");
            map.put("title", c.getRaisonSociale());
            map.put("subtitle", "Client - " + c.getVille());
            results.add(map);
        }

        // Search Invoices
        List<Facture> factures = factureRepository.findByNumeroFactureContainingIgnoreCaseOrNumeroDovisContainingIgnoreCase(query, query);
        for (Facture f : factures) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", f.getId());
            map.put("type", "FACTURE");
            map.put("title", f.getNumeroFacture());
            map.put("subtitle", "Facture - " + f.getClient().getRaisonSociale());
            results.add(map);
        }

        return results;
    }
}