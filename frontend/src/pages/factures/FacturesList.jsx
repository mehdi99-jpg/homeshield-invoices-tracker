import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Plus, Eye, Pencil, Trash2, Search, Filter, ChevronDown } from 'lucide-react'
import { getFactures, deleteFacture } from '../../api/factures'
import { getClients } from '../../api/clients'
import StatusBadge, { PaymentModeBadge } from '../../components/ui/StatusBadge'
import ConfirmModal from '../../components/ui/ConfirmModal'
import { TableSkeleton } from '../../components/ui/Skeleton'
import { formatMAD, formatDate } from '../../utils/formatters'
import { STATUS_LABELS } from '../../utils/constants'
import toast from 'react-hot-toast'

export default function FacturesList() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [factures, setFactures] = useState([])
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const [filters, setFilters] = useState({
    search: '',
    statut: searchParams.get('statut') || '',
    clientId: '',
    dateDebut: '',
    dateFin: '',
  })

  const fetchFactures = () => {
    setLoading(true)
    const params = {}
    if (filters.statut) params.statut = filters.statut
    if (filters.clientId) params.clientId = filters.clientId
    if (filters.dateDebut) params.dateDebut = filters.dateDebut
    if (filters.dateFin) params.dateFin = filters.dateFin

    getFactures(params).then(res => setFactures(res.data || []))
      .catch(() => toast.error('Erreur lors du chargement'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { getClients().then(r => setClients(r.data || [])).catch(() => {}) }, [])
  useEffect(() => { fetchFactures() }, [filters.statut, filters.clientId, filters.dateDebut, filters.dateFin])

  const filtered = factures.filter(f =>
    !filters.search ||
    (f.numero || '').toLowerCase().includes(filters.search.toLowerCase()) ||
    (f.client || '').toLowerCase().includes(filters.search.toLowerCase())
  )

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await deleteFacture(deleteId)
      toast.success('Facture supprimée avec succès')
      setDeleteId(null)
      fetchFactures()
    } catch (err) { toast.error(err.response?.data?.error || 'Erreur lors de la suppression') }
    finally { setDeleting(false) }
  }

  if (loading) return (
    <div style={{ background: '#f8f9fa', padding: '28px 32px', minHeight: '100vh' }}>
      <TableSkeleton />
    </div>
  )

  return (
    <div style={{ background: '#f8f9fa', padding: '28px 32px', minHeight: '100vh' }}>
      <div className="animate-fade-in space-y-4">
        {/* Fix 1 — Page header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#111827', margin: 0 }}>
            Facturation / DV
          </h1>
          <button 
            onClick={() => navigate('/factures/nouvelle')} 
            style={{
              background: '#1a4d3a',
              color: 'white',
              borderRadius: '8px',
              padding: '9px 16px',
              fontSize: '14px',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              border: 'none',
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#163d2e'}
            onMouseLeave={e => e.currentTarget.style.background = '#1a4d3a'}
          >
            <Plus size={18} /> Nouvelle Facture
          </button>
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
          {/* Search */}
          <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
            <Search 
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} 
              size={16} 
            />
            <input
              type="text"
              value={filters.search}
              onChange={e => setFilters(p => ({ ...p, search: e.target.value }))}
              placeholder="Rechercher..."
              style={{
                height: '38px',
                width: '100%',
                padding: '0 12px 0 36px',
                fontSize: '14px',
                background: '#f9fafb',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                outline: 'none',
                transition: 'border-color 0.2s, box-shadow 0.2s',
                color: '#101828'
              }}
              onFocus={e => {
                e.target.style.borderColor = '#1a4d3a';
                e.target.style.boxShadow = '0 0 0 3px rgba(26, 77, 58, 0.08)';
              }}
              onBlur={e => {
                e.target.style.borderColor = '#e5e7eb';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          {/* Statut Dropdown */}
          <div style={{ position: 'relative', minWidth: '160px' }}>
            <select
              value={filters.statut}
              onChange={e => setFilters(p => ({ ...p, statut: e.target.value }))}
              style={{
                height: '38px',
                width: '100%',
                padding: '0 32px 0 12px',
                fontSize: '14px',
                background: '#f9fafb',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                outline: 'none',
                appearance: 'none',
                cursor: 'pointer',
                color: '#374151'
              }}
            >
              <option value="">Tous les statuts</option>
              {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <Filter 
              size={14} 
              style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }} 
            />
          </div>

          {/* Date inputs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ position: 'relative' }}>
              <input
                type="date"
                value={filters.dateDebut}
                onChange={e => setFilters(p => ({ ...p, dateDebut: e.target.value }))}
                style={{
                  height: '38px',
                  padding: '0 10px',
                  fontSize: '13px',
                  background: '#f9fafb',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  color: '#374151',
                  outline: 'none'
                }}
              />
            </div>
            <span style={{ color: '#9ca3af', fontSize: '12px' }}>au</span>
            <div style={{ position: 'relative' }}>
              <input
                type="date"
                value={filters.dateFin}
                onChange={e => setFilters(p => ({ ...p, dateFin: e.target.value }))}
                style={{
                  height: '38px',
                  padding: '0 10px',
                  fontSize: '13px',
                  background: '#f9fafb',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  color: '#374151',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          {/* Clients Dropdown */}
          <div style={{ position: 'relative', minWidth: '180px' }}>
            <select
              value={filters.clientId}
              onChange={e => setFilters(p => ({ ...p, clientId: e.target.value }))}
              style={{
                height: '38px',
                width: '100%',
                padding: '0 32px 0 12px',
                fontSize: '14px',
                background: '#f9fafb',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                outline: 'none',
                appearance: 'none',
                cursor: 'pointer',
                color: '#374151'
              }}
            >
              <option value="">Tous les clients</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.raisonSociale}</option>)}
            </select>
            <ChevronDown 
              size={16} 
              style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }} 
            />
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
                {['N° Facture', 'Client', 'Date', 'Montant TTC', 'Mode', 'Statut', 'Livraison', 'Actions'].map((h, i) => (
                  <th
                    key={h}
                    style={{
                      padding: '10px 16px',
                      textAlign: i === 3 ? 'right' : i >= 4 && i <= 7 ? 'center' : 'left',
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
              {filtered.map(f => (
                <tr
                  key={f.id}
                  style={{
                    borderBottom: '1px solid #f3f4f6',
                    cursor: 'pointer',
                    transition: 'background 0.1s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f0fdf4'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  onClick={() => navigate(`/factures/${f.id}`)}
                >
                  <td style={{ padding: '11px 16px', fontSize: '12px', color: '#6b7280', fontWeight: 500, fontFamily: 'monospace' }}>
                    {f.numero}
                  </td>
                  <td style={{ padding: '11px 16px', fontSize: '14px', fontWeight: 500, color: '#111827' }}>
                    {f.client}
                  </td>
                  <td style={{ padding: '11px 16px', fontSize: '13px', color: '#6b7280' }}>
                    {formatDate(f.date)}
                  </td>
                  <td style={{ padding: '11px 16px', fontSize: '14px', fontWeight: 600, color: '#111827', textAlign: 'right' }}>
                    {formatMAD(f.montantTTC)}
                  </td>
                  <td style={{ padding: '11px 16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <PaymentModeBadge mode={f.modeReglement} size="sm" />
                    </div>
                  </td>
                  <td style={{ padding: '11px 16px', textAlign: 'center' }}>
                    <StatusBadge statut={f.statut} />
                  </td>
                  <td style={{ padding: '11px 16px', textAlign: 'center' }}>
                    <StatusBadge statut={f.livraisonStatut} />
                  </td>
                  <td style={{ padding: '11px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                      <button
                        onClick={e => { e.stopPropagation(); navigate(`/factures/${f.id}`); }}
                        title="Voir"
                        style={{ padding: '5px', borderRadius: '6px', border: 'none', background: 'transparent', cursor: 'pointer', color: '#98A2B3', transition: 'all 0.1s' }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#eff6ff'; e.currentTarget.style.color = '#2563eb'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#98A2B3'; }}
                      >
                        <Eye size={15} />
                      </button>
                      <button
                        onClick={e => { e.stopPropagation(); navigate(`/factures/${f.id}/modifier`); }}
                        title="Modifier"
                        style={{ padding: '5px', borderRadius: '6px', border: 'none', background: 'transparent', cursor: 'pointer', color: '#98A2B3', transition: 'all 0.1s' }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#fefce8'; e.currentTarget.style.color = '#eab308'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#98A2B3'; }}
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={e => { e.stopPropagation(); setDeleteId(f.id); }}
                        title="Supprimer"
                        style={{ padding: '5px', borderRadius: '6px', border: 'none', background: 'transparent', cursor: 'pointer', color: '#98A2B3', transition: 'all 0.1s' }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.color = '#ef4444'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#98A2B3'; }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ padding: '48px', textAlign: 'center', fontSize: '13px', color: '#9ca3af' }}>
                    Aucune facture trouvée
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmModal isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete}
        title="Supprimer la facture" message="Êtes-vous sûr de vouloir supprimer cette facture ?" loading={deleting} />
    </div>
  )
}
