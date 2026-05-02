import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'

export function formatMAD(amount) {
  if (amount == null) return '0,00 MAD'
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  return num.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' MAD'
}

export function formatDate(date) {
  if (!date) return '-'
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'dd/MM/yyyy', { locale: fr })
}

export function formatDateFr(date) {
  if (!date) return ''
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'EEEE d MMMM yyyy', { locale: fr })
    .replace(/^\w/, c => c.toUpperCase())
}

export function formatNumber(num) {
  if (num == null) return '0'
  return Number(num).toLocaleString('fr-FR')
}
