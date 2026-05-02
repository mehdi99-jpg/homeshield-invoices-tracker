export const STATUS_COLORS = {
  PAYEE: '#16a34a',
  LIVREE: '#0891b2',
  EN_ATTENTE: '#d97706',
  BROUILLON: '#6b7280',
  EN_RETARD: '#dc2626',
  ANNULEE: '#6b7280',
}

export const STATUS_LABELS = {
  PAYEE: 'Payée',
  LIVREE: 'Livrée',
  EN_ATTENTE: 'En attente',
  BROUILLON: 'Brouillon',
  EN_RETARD: 'En retard',
  ANNULEE: 'Annulée',
}

export const LIVRAISON_STATUS_LABELS = {
  EN_ATTENTE: 'En attente',
  EN_COURS: 'En cours',
  LIVREE: 'Livrée',
  ECHEC: 'Échec',
}

export const PASSAGE_STATUS_LABELS = {
  PLANIFIE: 'Planifié',
  EN_COURS: 'En cours',
  EFFECTUE: 'Effectué',
  REPORTE: 'Reporté',
  ANNULE: 'Annulé',
}

export const TYPES_CLIENT = [
  { value: 'RESIDENCE', label: 'Résidence' },
  { value: 'MAGASIN', label: 'Magasin' },
  { value: 'ATELIER', label: 'Atelier' },
  { value: 'CAFE', label: 'Café' },
  { value: 'HOTEL', label: 'Hôtel' },
  { value: 'ENTREPRISE', label: 'Entreprise' },
  { value: 'AUTRE', label: 'Autre' },
]

export const MODES_REGLEMENT = [
  { value: 'CHEQUE', label: 'Chèque' },
  { value: 'VIREMENT', label: 'Virement' },
  { value: 'ESPECES', label: 'Espèces' },
  { value: 'CARTE_BANCAIRE', label: 'Carte Bancaire' },
]

export const PAYMENT_MODE_COLORS = {
  'Chèque': '#3b82f6',
  'CHEQUE': '#3b82f6',
  'Virement': '#1a4d3a',
  'VIREMENT': '#1a4d3a',
  'Espèces': '#f59e0b',
  'ESPECES': '#f59e0b',
  'Carte Bancaire': '#8b5cf6',
  'CARTE_BANCAIRE': '#8b5cf6',
  'Non défini': '#d1d5db',
  'NON_DEFINI': '#d1d5db',
};

export const PERIODES = [
  { value: 'CE_MOIS', label: 'Ce mois' },
  { value: 'CE_TRIMESTRE', label: 'Ce trimestre' },
  { value: 'CETTE_ANNEE', label: 'Cette année' },
  { value: 'PERSONNALISE', label: 'Personnalisé' },
]
