CREATE TABLE bon_de_livraison (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    numero_bl VARCHAR(20) NOT NULL UNIQUE,
    facture_id BIGINT UNIQUE,
    date_emission DATE NOT NULL,
    date_livraison DATE,
    adresse_livraison VARCHAR(255),
    commentaires TEXT,
    statut_livraison VARCHAR(50),
    CONSTRAINT fk_bl_facture FOREIGN KEY (facture_id) REFERENCES facture(id)
);

-- Seed some BLs for existing factures (Moroccan addresses)
INSERT INTO bon_de_livraison (numero_bl, facture_id, date_emission, date_livraison, adresse_livraison, statut_livraison) VALUES
('BL-26-001', 1, '2026-04-11', '2026-04-12', 'Route de Bab Atlas, Marrakech', 'LIVREE'),
('BL-26-002', 2, '2026-04-11', NULL, 'Angle Boulevard Anfa, Casablanca', 'EN_COURS');
