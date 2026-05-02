CREATE TABLE passage (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    facture_id BIGINT NOT NULL,
    numero_passage INT NOT NULL,
    date_passage DATE,
    heure_prise TIME,
    technicien VARCHAR(100),
    notes_intervention TEXT,
    statut_passage VARCHAR(50),
    produit_utilise VARCHAR(255),
    zones_traitees VARCHAR(255),
    CONSTRAINT fk_passage_facture FOREIGN KEY (facture_id) REFERENCES facture(id)
);
