import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Eye, Pencil, Trash2, Search } from 'lucide-react'
import { getClients, deleteClient } from '../../api/clients'
import StatusBadge from '../../components/ui/StatusBadge'
import ConfirmModal from '../../components/ui/ConfirmModal'
import { TableSkeleton } from '../../components/ui/Skeleton'
import toast from 'react-hot-toast'

export default function ClientsList() {
  const navigate = useNavigate()
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [deleteId, setDeleteId] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const fetchClients = () => {
    setLoading(true)
    getClients().then(res => setClients(res.data || []))
      .catch(() => toast.error('Erreur lors du chargement des clients'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchClients() }, [])

  const filtered = clients.filter(c =>
    (c.raisonSociale || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.code || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.ville || '').toLowerCase().includes(search.toLowerCase())
  )

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await deleteClient(deleteId)
      toast.success('Client supprimé avec succès')
      setDeleteId(null)
      fetchClients()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erreur lors de la suppression')
    } finally { setDeleting(false) }
  }

  if (loading) return <TableSkeleton />

  return (
    <div className="animate-fade-in">
      {/* Page Header */}
      <h1 className="text-2xl font-bold text-[#101828] mb-6">Gestion des Clients</h1>
      
      {/* Toolbar Row */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '16px' 
      }}>
        {/* Page-scoped Search */}
        <div className="relative">
          <Search 
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca3af]" 
            size={14} 
          />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher client..."
            style={{
              height: '38px',
              width: '260px',
              padding: '0 12px 0 36px',
              fontSize: '14px',
              background: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              outline: 'none',
              transition: 'border-color 0.2s, box-shadow 0.2s',
              color: '#101828'
            }}
            onFocus={e => {
              e.target.style.borderColor = '#1a4d3a';
              e.target.style.boxShadow = '0 0 0 3px rgba(26, 77, 58, 0.1)';
            }}
            onBlur={e => {
              e.target.style.borderColor = '#e5e7eb';
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>

        <button 
          onClick={() => navigate('/clients/nouveau')} 
          style={{
            background: '#1a4d3a',
            color: 'white',
            borderRadius: '8px',
            padding: '8px 16px',
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
          <Plus size={18} /> Nouveau Client
        </button>
      </div>

      {/* Table Container - White Card */}
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
              {['Code', 'Raison Sociale', 'Type', 'Ville', 'Email', 'Factures', 'Actions'].map((h, i) => (
                <th
                  key={h}
                  style={{
                    padding: '10px 16px',
                    textAlign: i === 2 || i === 5 || i === 6 ? 'center' : 'left',
                    fontSize: '11px',
                    fontWeight: 600,
                    letterSpacing: '0.06em',
                    color: '#9ca3af',
                    textTransform: 'uppercase',
                    borderBottom: '1px solid #f3f4f6'
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((c, idx) => (
              <tr
                key={c.id}
                style={{
                  background: idx % 2 === 0 ? '#ffffff' : '#fafafa',
                  borderBottom: '1px solid #f3f4f6',
                  cursor: 'pointer',
                  transition: 'background 0.1s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#f0fdf4'}
                onMouseLeave={e => e.currentTarget.style.background = idx % 2 === 0 ? '#ffffff' : '#fafafa'}
                onClick={() => navigate(`/clients/${c.id}`)}
              >
                <td style={{ padding: '10px 16px', fontSize: '12px', color: '#6b7280', fontFamily: 'monospace' }}>
                  {c.code}
                </td>
                <td style={{ padding: '10px 16px' }}>
                  <div style={{ lineHeight: 1.3 }}>
                    <p style={{ fontSize: '14px', fontWeight: 600, color: '#101828', margin: 0 }}>
                      {c.raisonSociale}
                    </p>
                    <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
                      {c.ville}
                    </p>
                  </div>
                </td>
                <td style={{ padding: '10px 16px', textAlign: 'center' }}>
                  <StatusBadge statut={c.type} />
                </td>
                <td style={{ padding: '10px 16px', fontSize: '14px', color: '#374151' }}>
                  {c.ville}
                </td>
                <td style={{ padding: '10px 16px', fontSize: '14px', color: '#6b7280' }}>
                  {c.email || '-'}
                </td>
                <td style={{ padding: '10px 16px', fontSize: '14px', color: '#374151', textAlign: 'center' }}>
                  {c.nombreFactures}
                </td>
                <td style={{ padding: '10px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    <button
                      onClick={e => { e.stopPropagation(); navigate(`/clients/${c.id}`); }}
                      title="Voir"
                      style={{ padding: '5px', borderRadius: '6px', border: 'none', background: 'transparent', cursor: 'pointer', color: '#98A2B3', transition: 'all 0.1s' }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#eff6ff'; e.currentTarget.style.color = '#3b82f6'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#98A2B3'; }}
                    >
                      <Eye size={15} />
                    </button>
                    <button
                      onClick={e => { e.stopPropagation(); navigate(`/clients/${c.id}/modifier`); }}
                      title="Modifier"
                      style={{ padding: '5px', borderRadius: '6px', border: 'none', background: 'transparent', cursor: 'pointer', color: '#98A2B3', transition: 'all 0.1s' }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#fefce8'; e.currentTarget.style.color = '#eab308'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#98A2B3'; }}
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={e => { e.stopPropagation(); setDeleteId(c.id); }}
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
                <td colSpan={7} style={{ padding: '48px', textAlign: 'center', fontSize: '14px', color: '#9ca3af' }}>
                  Aucun client trouvé
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ConfirmModal isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete}
        title="Supprimer le client" message="Êtes-vous sûr de vouloir supprimer ce client ?" loading={deleting} />
    </div>
  )
}
