import api from './axios'

export const getBonsLivraison = (params) => api.get('/bons-de-livraison', { params })
export const getBonLivraison = (id) => api.get(`/bons-de-livraison/${id}`)
