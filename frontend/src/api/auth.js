import api from './axios'

export const getIntervention = (id) => api.get(`/interventions/${id}`)
export const updateIntervention = (id, data) => api.put(`/interventions/${id}`, data)
export const globalSearch = (q) => api.get('/search', { params: { q } })
export const getOverdueNotifications = () => api.get('/notifications/overdue')
export const markAllRead = () => api.post('/notifications/mark-all-read')
