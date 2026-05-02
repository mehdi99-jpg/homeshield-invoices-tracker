import api from './axios'

export const getStatistiques = (params) => api.get('/statistiques', { params })
export const getStatistiquesCharts = (params) => api.get('/statistiques/charts', { params })
