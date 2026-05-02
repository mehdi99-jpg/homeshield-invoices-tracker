import api from './axios'

export const getDashboardStats = () => api.get('/dashboard/stats')
export const getChartData = (year) => api.get('/dashboard/chart-data', { params: { year } })
export const getPaymentModes = () => api.get('/dashboard/payment-modes')
