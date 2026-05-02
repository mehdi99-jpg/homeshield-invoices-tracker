package com.example.trackinvoices.config;

import com.example.trackinvoices.model.entity.Client;
import com.example.trackinvoices.model.entity.Facture;
import com.example.trackinvoices.model.entity.LigneFacture;
import com.example.trackinvoices.model.entity.Passage;
import com.example.trackinvoices.model.enums.*;
import com.example.trackinvoices.repository.ClientRepository;
import com.example.trackinvoices.repository.FactureRepository;
import com.example.trackinvoices.repository.PassageRepository;
import com.example.trackinvoices.service.BonDeLivraisonService;
import com.example.trackinvoices.service.NotificationService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Random;

@Component
@Profile("dev")
public class DataSeeder implements CommandLineRunner {

    private final ClientRepository clientRepository;
    private final FactureRepository factureRepository;
    private final BonDeLivraisonService bonDeLivraisonService;
    private final PassageRepository passageRepository;
    private final NotificationService notificationService;
    private final Random random = new Random();

    public DataSeeder(ClientRepository clientRepository, FactureRepository factureRepository, 
                      BonDeLivraisonService bonDeLivraisonService, PassageRepository passageRepository,
                      NotificationService notificationService) {
        this.clientRepository = clientRepository;
        this.factureRepository = factureRepository;
        this.bonDeLivraisonService = bonDeLivraisonService;
        this.passageRepository = passageRepository;
        this.notificationService = notificationService;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        if (clientRepository.count() > 0) {
            notificationService.refreshAlerts();
            return;
        }

        System.out.println("Début de l'injection des données de test...");

        // 1. Create 10 diverse clients
        Client c1 = createClient("Résidence Les Jardins de Bouznika", "CL-BOU-001", "Bouznika", TypeClient.RESIDENCE, "contact@jardins-bouznika.ma", "0522-001001");
        Client c2 = createClient("Hôtel Mamounia", "CL-MAR-002", "Marrakech", TypeClient.HOTEL, "contact@mamounia.ma", "0524-388600");
        Client c3 = createClient("Café de France", "CL-CAS-003", "Casablanca", TypeClient.CAFE, "info@cafedefrance.ma", "0522-201020");
        Client c4 = createClient("Clinique Yasmine", "CL-CAS-004", "Casablanca", TypeClient.ENTREPRISE, "logistique@yasmine.ma", "0522-889900");
        Client c5 = createClient("Boulangerie Paul", "CL-CAS-005", "Casablanca", TypeClient.MAGASIN, "paul@boulangerie.ma", "0522-334455");
        Client c6 = createClient("Restaurant Le Phare", "CL-CAS-006", "Casablanca", TypeClient.CAFE, "contact@lephare.ma", "0522-556677");
        Client c7 = createClient("Résidence Al Yasmine", "CL-RAB-007", "Rabat", TypeClient.RESIDENCE, "syndic@alyasmine.ma", "0537-112233");
        Client c8 = createClient("Hôtel Kenzi Tower", "CL-CAS-008", "Casablanca", TypeClient.HOTEL, "reservations@kenzi.ma", "0522-978800");
        Client c9 = createClient("Supermarché Marjane Casa", "CL-CAS-009", "Casablanca", TypeClient.MAGASIN, "direction@marjane-casa.ma", "0522-445566");
        Client c10 = createClient("M. Amrani Youssef", "CL-RAB-010", "Rabat", TypeClient.RESIDENCE, "y.amrani@email.ma", "0661-234567");
        
        // Client 11: Edge case 0 invoices
        createClient("Client Sans Facture", "CL-EMPTY-011", "Tanger", TypeClient.ENTREPRISE, "empty@test.ma", "0539-000000");

        List<Client> clients = Arrays.asList(c1, c2, c3, c4, c5, c6, c7, c8, c9, c10);
        int invCount = 0;

        // 2. January 2026: 2 invoices
        createFacture(c1, "DV-2601-0001", LocalDate.of(2026, 1, 10), StatutFacture.PAYEE, ModeReglement.VIREMENT);
        createFacture(c2, "DV-2601-0002", LocalDate.of(2026, 1, 20), StatutFacture.EN_ATTENTE, ModeReglement.CHEQUE);
        invCount += 2;

        // 3. February 2026: 2 invoices
        createFacture(c3, "DV-2602-0003", LocalDate.of(2026, 2, 5), StatutFacture.PAYEE, ModeReglement.ESPECES);
        createFacture(c4, "DV-2602-0004", LocalDate.of(2026, 2, 18), StatutFacture.LIVREE, ModeReglement.VIREMENT);
        invCount += 2;

        // 4. March 2026: 3 invoices
        createFacture(c5, "DV-2603-0005", LocalDate.of(2026, 3, 2), StatutFacture.PAYEE, ModeReglement.CARTE_BANCAIRE);
        createFacture(c6, "DV-2603-0006", LocalDate.of(2026, 3, 12), StatutFacture.EN_ATTENTE, ModeReglement.CHEQUE);
        createFacture(c7, "DV-2603-0007", LocalDate.of(2026, 3, 25), StatutFacture.BROUILLON, ModeReglement.NON_DEFINI);
        invCount += 3;

        // 5. April 2026: 4 invoices
        createFacture(c8, "DV-2604-0008", LocalDate.of(2026, 4, 1), StatutFacture.PAYEE, ModeReglement.VIREMENT);
        createFacture(c9, "DV-2604-0009", LocalDate.of(2026, 4, 5), StatutFacture.EN_RETARD, ModeReglement.CHEQUE);
        createFacture(c10, "DV-2604-0010", LocalDate.of(2026, 4, 10), StatutFacture.EN_ATTENTE, ModeReglement.ESPECES);
        createFacture(c1, "DV-2604-0011", LocalDate.of(2026, 4, 15), StatutFacture.LIVREE, ModeReglement.CARTE_BANCAIRE);
        invCount += 4;

        // 6. May 2026: 3 invoices
        createFacture(c2, "DV-2605-0012", LocalDate.of(2026, 5, 2), StatutFacture.PAYEE, ModeReglement.VIREMENT);
        createFacture(c3, "DV-2605-0013", LocalDate.of(2026, 5, 12), StatutFacture.LIVREE, ModeReglement.CHEQUE);
        createFacture(c4, "DV-2605-0014", LocalDate.of(2026, 5, 20), StatutFacture.EN_ATTENTE, ModeReglement.NON_DEFINI);
        invCount += 3;

        // 7. June 2026: 2 invoices
        createFacture(c5, "DV-2606-0015", LocalDate.of(2026, 6, 8), StatutFacture.PAYEE, ModeReglement.ESPECES);
        createFacture(c6, "DV-2606-0016", LocalDate.of(2026, 6, 22), StatutFacture.LIVREE, ModeReglement.VIREMENT);
        invCount += 2;

        // 8. July 2026: 2 invoices
        createFacture(c7, "DV-2607-0017", LocalDate.of(2026, 7, 10), StatutFacture.PAYEE, ModeReglement.CARTE_BANCAIRE);
        createFacture(c8, "DV-2607-0018", LocalDate.of(2026, 7, 25), StatutFacture.EN_ATTENTE, ModeReglement.NON_DEFINI);
        invCount += 2;

        // 9. August 2026: 2 invoices
        createFacture(c9, "DV-2608-0019", LocalDate.of(2026, 8, 5), StatutFacture.LIVREE, ModeReglement.VIREMENT);
        createFacture(c10, "DV-2608-0020", LocalDate.of(2026, 8, 15), StatutFacture.BROUILLON, ModeReglement.NON_DEFINI);
        invCount += 2;

        // 10. Sept-Dec 2025: 5 invoices PAYEE
        createFacture(c1, "DV-2509-0101", LocalDate.of(2025, 9, 15), StatutFacture.PAYEE, ModeReglement.VIREMENT);
        createFacture(c2, "DV-2510-0102", LocalDate.of(2025, 10, 10), StatutFacture.PAYEE, ModeReglement.CHEQUE);
        createFacture(c3, "DV-2511-0103", LocalDate.of(2025, 11, 5), StatutFacture.PAYEE, ModeReglement.ESPECES);
        createFacture(c4, "DV-2512-0104", LocalDate.of(2025, 12, 12), StatutFacture.PAYEE, ModeReglement.VIREMENT);
        createFacture(c5, "DV-2512-0105", LocalDate.of(2025, 12, 28), StatutFacture.PAYEE, ModeReglement.CARTE_BANCAIRE);
        invCount += 5;

        // 11. EDGE CASES
        // Today is 2026-04-18 based on system context
        LocalDate today = LocalDate.of(2026, 4, 18);
        
        // Edge Case 1: Expiration within 2 days
        createFactureCustom(c6, "DV-EDGE-001", today.minusDays(28), today.plusDays(2), StatutFacture.EN_ATTENTE, ModeReglement.CHEQUE, 3);
        
        // Edge Case 2: Expired yesterday (should flip to EN_RETARD)
        createFactureCustom(c7, "DV-EDGE-002", today.minusDays(31), today.minusDays(1), StatutFacture.EN_ATTENTE, ModeReglement.VIREMENT, 2);
        
        // Edge Case 3: Large amount (15000+)
        createFactureLarge(c8, "DV-EDGE-003", today.minusDays(10), StatutFacture.PAYEE, 18500.0);

        // Edge Case 4: 1 service line
        createFactureCustom(c9, "DV-EDGE-004", today.minusDays(5), today.plusDays(25), StatutFacture.LIVREE, ModeReglement.ESPECES, 1);

        // Edge Case 5: 4 service lines
        createFactureCustom(c10, "DV-EDGE-005", today.minusDays(15), today.plusDays(15), StatutFacture.PAYEE, ModeReglement.VIREMENT, 4);
        
        invCount += 5;

        notificationService.refreshAlerts();

        System.out.println("Injection terminée avec succès !");
        System.out.println("Résumé : ");
        System.out.println("- Clients : " + clientRepository.count());
        System.out.println("- Invoices : " + factureRepository.count());
        System.out.println("- Passages : " + passageRepository.count());
        System.out.println("- BLs : " + invCount); // Approximate since some are draft, but we create BL for all non-draft
    }

    private Client createClient(String nom, String code, String ville, TypeClient type, String email, String tel) {
        Client c = new Client();
        c.setRaisonSociale(nom);
        c.setCodeClient(code);
        c.setAdresse("Zone Industrielle, " + ville);
        c.setVille(ville);
        c.setTelephone(tel);
        c.setEmail(email);
        c.setTypeClient(type);
        c.setNotes("Client stratégique " + type.getLibelle());
        return clientRepository.save(c);
    }

    private void createFacture(Client client, String dvis, LocalDate date, StatutFacture statut, ModeReglement mode) {
        createFactureCustom(client, dvis, date, date.plusDays(30), statut, mode, 2 + random.nextInt(2));
    }

    private void createFactureLarge(Client client, String dvis, LocalDate date, StatutFacture statut, double amount) {
        Facture f = new Facture();
        f.setClient(client);
        f.setNumeroDovis(dvis);
        f.setDateProposition(date);
        f.setDateFinValidite(date.plusDays(30));
        f.setStatutFacture(statut);
        f.setModeReglement(ModeReglement.VIREMENT);
        
        LigneFacture l = new LigneFacture();
        l.setFacture(f);
        l.setDesignation("Contrat Annuel Global Multisites — Prestation Expert");
        l.setQuantite(1.0);
        l.setPrixUnitaireHT(BigDecimal.valueOf(amount));
        l.setTauxTVA(20.0);
        
        f.setLignes(new ArrayList<>(List.of(l)));
        finalizeAndSave(f);
    }

    private void createFactureCustom(Client client, String dvis, LocalDate date, LocalDate expiry, StatutFacture statut, ModeReglement mode, int linesCount) {
        Facture f = new Facture();
        f.setClient(client);
        f.setNumeroDovis(dvis);
        f.setDateProposition(date);
        f.setDateFinValidite(expiry);
        f.setStatutFacture(statut);
        f.setModeReglement(mode);

        List<String> services = Arrays.asList(
            "Dératisation — Installation de 12 postes",
            "Désinsectisation par pulvérisation",
            "Fumigation parties communes",
            "Traitement anti-cafards cuisine professionnelle",
            "Désinfection sanitaire générale",
            "Traitement préventif trimestriel"
        );

        List<LigneFacture> lines = new ArrayList<>();
        for (int i = 0; i < linesCount; i++) {
            LigneFacture l = new LigneFacture();
            l.setFacture(f);
            l.setDesignation(services.get(random.nextInt(services.size())));
            l.setQuantite((double) (1 + random.nextInt(3)));
            l.setPrixUnitaireHT(BigDecimal.valueOf(800 + random.nextInt(3201)));
            l.setTauxTVA(20.0);
            lines.add(l);
        }
        f.setLignes(lines);
        finalizeAndSave(f);
    }

    private void finalizeAndSave(Facture f) {
        // Set livraison status based on prompt
        if (f.getStatutFacture() == StatutFacture.PAYEE || f.getStatutFacture() == StatutFacture.LIVREE) {
            f.setStatutLivraison(StatutLivraison.LIVREE);
        } else {
            f.setStatutLivraison(StatutLivraison.EN_ATTENTE);
        }

        Facture saved = factureRepository.save(f);
        
        // Create BL
        if (saved.getStatutFacture() != StatutFacture.BROUILLON) {
            bonDeLivraisonService.createFromFacture(saved);
        }

        // Create Passages (3-passage protocol)
        createPassages(saved);
    }

    private void createPassages(Facture f) {
        if (f.getStatutFacture() == StatutFacture.BROUILLON) return;

        List<String> techs = Arrays.asList("Yassine", "Mehdi", "Karim", "Hassan");
        List<String> zones = Arrays.asList("Cuisines et offices", "Caves et sous-sols", "Parties communes hall et couloirs", "Toiture terrasse", "Local poubelles", "Réseau d'égouts", "Appartements signalés");
        List<String> prods = Arrays.asList("Goliath Gel 35g", "Detia Rat", "Alpha-C 10SC", "Ficam D", "K-Othrine SC 25", "Solfac EW 50");

        if (f.getStatutFacture() == StatutFacture.PAYEE || f.getStatutFacture() == StatutFacture.LIVREE) {
            // 3 Passages EFFECTUE
            for (int i = 1; i <= 3; i++) {
                savePassage(f, i, f.getDateProposition().plusDays((i-1)*7), StatutPassage.EFFECTUE, techs.get(i%4), zones.get(i%7), prods.get(i%6), null);
            }
        } else if (f.getStatutFacture() == StatutFacture.EN_ATTENTE) {
            // 1 EFFECTUE, 1 PLANIFIE
            savePassage(f, 1, f.getDateProposition(), StatutPassage.EFFECTUE, techs.get(0), zones.get(0), prods.get(0), null);
            savePassage(f, 2, f.getDateProposition().plusDays(7), StatutPassage.PLANIFIE, techs.get(1), zones.get(1), prods.get(1), null);
        } else if (f.getStatutFacture() == StatutFacture.EN_RETARD) {
            // 2 EFFECTUE, 1 REPORTE
            savePassage(f, 1, f.getDateProposition(), StatutPassage.EFFECTUE, techs.get(2), zones.get(2), prods.get(2), null);
            savePassage(f, 2, f.getDateProposition().plusDays(7), StatutPassage.EFFECTUE, techs.get(3), zones.get(3), prods.get(3), null);
            savePassage(f, 3, f.getDateProposition().plusDays(14), StatutPassage.REPORTE, techs.get(0), zones.get(4), prods.get(4), "Client absent lors du rendez-vous, reporté à la semaine prochaine.");
        }
    }

    private void savePassage(Facture f, int num, LocalDate date, StatutPassage statut, String tech, String zone, String prod, String note) {
        Passage p = Passage.builder()
            .facture(f)
            .numeroPassage(num)
            .datePassage(date)
            .heurePrise(LocalTime.of(9 + random.nextInt(8), 0))
            .technicien(tech)
            .zonesTraitees(zone)
            .produitUtilise(prod)
            .statutPassage(statut)
            .notesIntervention(note)
            .build();
        passageRepository.save(p);
    }
}
