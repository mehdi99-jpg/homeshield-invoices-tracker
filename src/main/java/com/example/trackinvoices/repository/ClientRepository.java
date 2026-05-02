package com.example.trackinvoices.repository;

import com.example.trackinvoices.model.entity.Client;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClientRepository extends JpaRepository<Client, Long> {
    List<Client> findByRaisonSocialeContainingIgnoreCaseOrCodeClientContainingIgnoreCase(String raisonSociale, String codeClient);
    List<Client> findByRaisonSocialeContainingIgnoreCase(String raisonSociale);
    List<Client> findAllByOrderByRaisonSocialeAsc();
    java.util.Optional<Client> findByCodeClient(String codeClient);
}
