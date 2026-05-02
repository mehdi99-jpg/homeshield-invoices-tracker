package com.example.trackinvoices.service;

import com.example.trackinvoices.model.entity.Client;
import com.example.trackinvoices.model.enums.TypeClient;
import com.example.trackinvoices.repository.ClientRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ClientService {

    private final ClientRepository clientRepository;

    public ClientService(ClientRepository clientRepository) {
        this.clientRepository = clientRepository;
    }

    public List<Client> getAllClients() {
        return clientRepository.findAll();
    }

    public List<Client> filterClients(String raisonSociale, TypeClient typeClient) {
        return clientRepository.findAll().stream()
                .filter(c -> raisonSociale == null || raisonSociale.isEmpty() || c.getRaisonSociale().toLowerCase().contains(raisonSociale.toLowerCase()))
                .filter(c -> typeClient == null || c.getTypeClient() == typeClient)
                .collect(Collectors.toList());
    }

    public Client getClientById(Long id) {
        return clientRepository.findById(id).orElseThrow(() -> new RuntimeException("Client non trouvé"));
    }

    public java.util.Optional<Client> findByCodeClient(String codeClient) {
        return clientRepository.findByCodeClient(codeClient);
    }

    public List<Client> rechercherParNom(String q) {
        return clientRepository.findByRaisonSocialeContainingIgnoreCase(q);
    }

    @Transactional
    public void saveClient(Client client) {
        clientRepository.save(client);
    }

    public boolean hasInvoices(Long id) {
        Client client = getClientById(id);
        return !client.getFactures().isEmpty();
    }

    @Transactional
    public void deleteClient(Long id) {
        clientRepository.deleteById(id);
    }
}
