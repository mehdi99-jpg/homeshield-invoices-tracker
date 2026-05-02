import api from './axios'

export const getFactures = (params) => api.get('/factures', { params })
export const getRecentFactures = (limit = 5) => api.get('/factures/recent', { params: { limit } })
export const getFacture = (id) => api.get(`/factures/${id}`)
export const createFacture = (data) => api.post('/factures', data)
export const updateFacture = (id, data) => api.put(`/factures/${id}`, data)
export const deleteFacture = (id) => api.delete(`/factures/${id}`)
export const updateStatut = (id, statut) => api.patch(`/factures/${id}/statut`, { statut })
export const updateLivraisonStatut = (id, statut) => api.patch(`/factures/${id}/livraison-statut`, { statut })
export const envoyerFacture = (id) => api.post(`/factures/${id}/envoyer`)
export const getBonLivraison = (id) => api.get(`/factures/${id}/bon-livraison`)
export const createIntervention = (factureId, data) => api.post(`/factures/${factureId}/interventions`, data)
