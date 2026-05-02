CREATE TABLE client (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code_client VARCHAR(20) NOT NULL,
    raison_sociale VARCHAR(255) NOT NULL,
    type_client VARCHAR(50) NOT NULL,
    adresse VARCHAR(255),
    code_postal VARCHAR(10),
    ville VARCHAR(100),
    telephone VARCHAR(20),
    email VARCHAR(100),
    notes TEXT
);

CREATE TABLE facture (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    numero_facture VARCHAR(50) NOT NULL,
    numero_dovis VARCHAR(50),
    date_proposition DATE NOT NULL,
    date_fin_validite DATE,
    statut_facture VARCHAR(50) NOT NULL,
    mode_reglement VARCHAR(50),
    statut_livraison VARCHAR(50),
    date_reglement DATE,
    observations TEXT,
    totalht DECIMAL(19, 2),
    totaltva DECIMAL(19, 2),
    totalttc DECIMAL(19, 2),
    client_id BIGINT,
    CONSTRAINT fk_facture_client FOREIGN KEY (client_id) REFERENCES client(id)
);

CREATE TABLE ligne_facture (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    designation TEXT NOT NULL,
    quantite DOUBLE NOT NULL,
    prix_unitaireht DECIMAL(19, 2) NOT NULL,
    taux_tva DOUBLE NOT NULL,
    totalht DECIMAL(19, 2),
    facture_id BIGINT,
    CONSTRAINT fk_ligne_facture FOREIGN KEY (facture_id) REFERENCES facture(id)
);
