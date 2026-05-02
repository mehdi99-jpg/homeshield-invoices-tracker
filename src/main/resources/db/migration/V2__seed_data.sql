INSERT INTO client (id, code_client, raison_sociale, type_client, adresse, code_postal, ville, telephone, email, notes) VALUES
(1, 'CL-001', 'Palais Namaskar', 'HOTEL', 'Route de Bab Atlas', '40000', 'Marrakech', '05242-99800', 'resa@palaisnamaskar.ma', 'Client prestige - Palmeraie'),
(2, 'CL-002', 'Boulangerie Paul Casablanca', 'MAGASIN', 'Angle Boulevard Anfa', '20000', 'Casablanca', '05223-45678', 'contact@paul.ma', 'Interventions de nuit préférées'),
(3, 'CL-003', 'M. Benjelloun Omar', 'RESIDENCE', 'Quartier Souissi', '10170', 'Rabat', '0661122334', 'o.benjelloun@gmail.ma', 'Villa privée');

INSERT INTO facture (id, numero_facture, numero_dovis, date_proposition, date_fin_validite, statut_facture, mode_reglement, statut_livraison, totalht, totaltva, totalttc, client_id, observations) VALUES
(1, 'DV-2026-001', 'Dovis-2024-001', '2026-04-11', '2026-05-11', 'PAYEE', 'VIREMENT', 'LIVREE', 2400.00, 480.00, 2880.00, 1, 'Dératisation complète Palmeraie'),
(2, 'DV-2026-002', 'Dovis-2024-002', '2026-04-12', '2026-05-12', 'EN_ATTENTE', 'CHEQUE', 'LIVREE', 1500.00, 300.00, 1800.00, 2, 'Désinsectisation périodique'),
(3, 'DV-2026-003', 'Dovis-2024-003', '2026-04-13', '2026-05-13', 'BROUILLON', NULL, 'LIVREE', 950.00, 190.00, 1140.00, 3, 'Traitement cafards appartements'),
(4, 'DV-2026-004', 'Dovis-2024-004', '2026-04-14', '2026-05-14', 'EN_RETARD', 'VIREMENT', 'LIVREE', 3200.00, 640.00, 3840.00, 1, 'Maintenance annuelle préventive'),
(5, 'DV-2026-005', 'Dovis-2024-005', '2026-04-15', '2026-05-15', 'LIVREE', 'CARTE_BANCAIRE', 'LIVREE', 1250.00, 250.00, 1500.00, 2, 'Urgence destruction nid de frelons');

INSERT INTO ligne_facture (designation, quantite, prix_unitaireht, taux_tva, totalht, facture_id) VALUES
('Intervention d''expertise anti-nuisibles', 1.0, 1800.00, 20.0, 1800.00, 1),
('Fourniture postes d''appatage sécurisés', 10.0, 60.00, 20.0, 600.00, 1),
('Désinsectisation par pulvérisation', 1.0, 1500.00, 20.0, 1500.00, 2),
('Traitement gel application précision', 1.0, 950.00, 20.0, 950.00, 3),
('Audit et maintenance annuelle', 1.0, 3200.00, 20.0, 3200.00, 4),
('Intervention urgence destruction nid', 1.0, 1250.00, 20.0, 1250.00, 5);
