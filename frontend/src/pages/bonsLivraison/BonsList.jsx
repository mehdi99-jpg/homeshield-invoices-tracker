import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, Printer, ChevronDown } from 'lucide-react'
import { getBonsLivraison } from '../../api/bonsLivraison'
import StatusBadge from '../../components/ui/StatusBadge'
import { TableSkeleton } from '../../components/ui/Skeleton'
import { formatDate } from '../../utils/formatters'
import { LIVRAISON_STATUS_LABELS } from '../../utils/constants'
import toast from 'react-hot-toast'

export default function BonsList() {
  const navigate = useNavigate()
  const [bls, setBls] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ dateDebut: '', dateFin: '', statut: '' })

  const fetchBLs = () => {
    setLoading(true)
    const params = {}
    if (filters.dateDebut) params.dateDebut = filters.dateDebut
    if (filters.dateFin) params.dateFin = filters.dateFin
    if (filters.statut) params.statut = filters.statut
    getBonsLivraison(params).then(res => setBls(res.data || []))
      .catch(() => toast.error('Erreur lors du chargement'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchBLs() }, [filters.statut, filters.dateDebut, filters.dateFin])

  if (loading) return (
    <div style={{ background: '#f8f9fa', padding: '28px 32px', minHeight: '100vh' }}>
      <TableSkeleton />
    </div>
  )

  const filterInputStyle = {
    height: '38px',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '0 10px',
    fontSize: '14px',
    background: '#f9fafb',
    color: '#374151',
    outline: 'none',
    transition: 'all 0.2s'
  };

  const labelStyle = {
    fontSize: '13px',
    fontWeight: 500,
    color: '#374151',
    marginRight: '6px'
  };

  const handleFocus = (e) => {
    e.target.style.borderColor = '#1a4d3a';
    e.target.style.boxShadow = '0 0 0 3px rgba(26, 77, 58, 0.08)';
  };

  const handleBlur = (e) => {
    e.target.style.borderColor = '#e5e7eb';
    e.target.style.boxShadow = 'none';
  };

  return (
    <div style={{ background: '#f8f9fa', padding: '28px 32px', minHeight: '100vh' }}>
      <div className="animate-fade-in space-y-4">
        
        {/* Fix 1 — Page header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#111827', margin: 0 }}>
            Bons de Livraison
          </h1>
        </div>

        {/* Fix 2 — Filter toolbar */}
        <div style={{
          background: 'white',
          borderRadius: '10px',
          border: '1px solid #e5e7eb',
          padding: '14px 16px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={labelStyle}>Date début</label>
            <input 
              type="date" 
              value={filters.dateDebut} 
              onChange={e => setFilters(p => ({ ...p, dateDebut: e.target.value }))}
              style={filterInputStyle}
              onFocus={handleFocus}
              onBlur={handleBlur}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={labelStyle}>Date fin</label>
            <input 
              type="date" 
              value={filters.dateFin} 
              onChange={e => setFilters(p => ({ ...p, dateFin: e.target.value }))}
              style={filterInputStyle}
              onFocus={handleFocus}
              onBlur={handleBlur}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={labelStyle}>Statut</label>
            <div style={{ position: 'relative', minWidth: '130px' }}>
              <select 
                value={filters.statut} 
                onChange={e => setFilters(p => ({ ...p, statut: e.target.value }))}
                style={{ ...filterInputStyle, width: '100%', appearance: 'none', paddingRight: '32px' }}
                onFocus={handleFocus}
                onBlur={handleBlur}
              >
                <option value="">Tous</option>
                {Object.entries(LIVRAISON_STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
              <ChevronDown 
                size={14} 
                style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }} 
              />
            </div>
          </div>
        </div>

        {/* Fix 3 — Table card wrapper */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          overflow: 'hidden'
        }}>
          <table className="w-full border-collapse">
            <thead>
              <tr style={{ background: '#f8f9fa' }}>
                {['N° BL', 'Facture', 'Client', 'Date Émission', 'Date Livraison', 'Statut', 'Actions'].map((h, i) => (
                  <th
                    key={h}
                    style={{
                      padding: '10px 16px',
                      textAlign: i === 5 || i === 6 ? 'center' : 'left',
                      fontSize: '11px',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      color: '#9ca3af',
                      borderBottom: '1px solid #f3f4f6'
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bls.map(bl => (
                <tr
                  key={bl.id}
                  style={{
                    borderBottom: '1px solid #f3f4f6',
                    cursor: 'pointer',
                    transition: 'background 0.1s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f0fdf4'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  onClick={() => navigate(`/bons-de-livraison/${bl.id}`)}
                >
                  <td style={{ padding: '11px 16px', fontSize: '12px', color: '#6b7280', fontWeight: 500, fontFamily: 'monospace' }}>
                    {bl.numeroBL}
                  </td>
                  <td style={{ padding: '11px 16px' }}>
                    <button
                      onClick={e => { e.stopPropagation(); navigate(`/factures/${bl.factureId}`); }}
                      style={{ color: '#2563eb', fontSize: '13px', fontWeight: 500, border: 'none', background: 'transparent', cursor: 'pointer', padding: 0, textDecoration: 'none' }}
                      onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                      onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
                    >
                      {bl.factureNumero}
                    </button>
                  </td>
                  <td style={{ padding: '11px 16px', fontSize: '14px', fontWeight: 500, color: '#111827' }}>
                    {bl.client}
                  </td>
                  <td style={{ padding: '11px 16px', fontSize: '13px', color: '#6b7280' }}>
                    {formatDate(bl.dateEmission)}
                  </td>
                  <td style={{ padding: '11px 16px', fontSize: '13px', color: bl.dateLivraison ? '#6b7280' : '#d1d5db', textAlign: bl.dateLivraison ? 'left' : 'center' }}>
                    {bl.dateLivraison ? formatDate(bl.dateLivraison) : '—'}
                  </td>
                  <td style={{ padding: '11px 16px', textAlign: 'center' }}>
                    <StatusBadge statut={bl.statut} />
                  </td>
                  <td style={{ padding: '11px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                      <button
                        onClick={e => { e.stopPropagation(); navigate(`/bons-de-livraison/${bl.id}`); }}
                        title="Voir"
                        style={{ padding: '5px', borderRadius: '6px', border: 'none', background: 'transparent', cursor: 'pointer', color: '#98A2B3', transition: 'all 0.1s' }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#eff6ff'; e.currentTarget.style.color = '#2563eb'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#98A2B3'; }}
                      >
                        <Eye size={15} />
                      </button>
                      <button
                        onClick={e => { e.stopPropagation(); navigate(`/bons-de-livraison/${bl.id}/imprimer`); }}
                        title="Imprimer"
                        style={{ padding: '5px', borderRadius: '6px', border: 'none', background: 'transparent', cursor: 'pointer', color: '#98A2B3', transition: 'all 0.1s' }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#f0fdf4'; e.currentTarget.style.color = '#1a4d3a'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#98A2B3'; }}
                      >
                        <Printer size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {bls.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ padding: '48px', textAlign: 'center', fontSize: '13px', color: '#9ca3af' }}>
                    Aucun bon de livraison trouvé
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
