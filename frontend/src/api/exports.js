import api from './axios'

export const downloadFile = async (url, filename) => {
  const response = await api.get(url, { responseType: 'blob' })
  const href = URL.createObjectURL(response.data)
  const link = document.createElement('a')
  link.href = href
  link.download = filename
  link.click()
  URL.revokeObjectURL(href)
}

export const exportFacturesExcel = () => downloadFile('/exports/factures-excel', `factures_${new Date().toISOString().slice(0,10)}.xlsx`)
export const exportFacturesFiltrees = (statut) => downloadFile(`/exports/factures-filtrees?statut=${statut || ''}`, `factures_filtrees.xlsx`)
export const exportClientsExcel = () => downloadFile('/exports/clients-excel', `clients_${new Date().toISOString().slice(0,10)}.xlsx`)
export const exportBLsExcel = () => downloadFile('/exports/bons-de-livraison-excel', `bons_livraison_${new Date().toISOString().slice(0,10)}.xlsx`)
export const exportClientRapport = (id) => downloadFile(`/clients/${id}/export-excel`, `rapport_client.xlsx`)
export const getClientsRapport = () => api.get('/exports/clients-rapport')
