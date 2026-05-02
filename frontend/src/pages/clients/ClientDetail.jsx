import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { Eye, ArrowLeft, Pencil, Download } from 'lucide-react'
import { getClient, getClientFactures, exportClientExcel } from '../../api/clients'
import StatusBadge, { PaymentModeBadge } from '../../components/ui/StatusBadge'
import { KpiSkeleton, TableSkeleton } from '../../components/ui/Skeleton'
import { formatMAD, formatDate } from '../../utils/formatters'
import toast from 'react-hot-toast'

export default function ClientDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [client, setClient] = useState(null)
  const [factures, setFactures] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getClient(id), getClientFactures(id)])
      .then(([c, f]) => { setClient(c.data); setFactures(f.data || []) })
      .catch(() => toast.error('Erreur lors du chargement'))
      .finally(() => setLoading(false))
  }, [id])

  const handleExport = async () => {
    try {
      const res = await exportClientExcel(id)
      const href = URL.createObjectURL(res.data)
      const link = document.createElement('a')
      link.href = href
      link.download = `historique_${client?.code || 'client'}.xlsx`
      link.click()
      URL.revokeObjectURL(href)
      toast.success('Export téléchargé')
    } catch { toast.error("Erreur lors de l'export") }
  }

  if (loading) return (
    <div style={{ background: '#f8f9fa', padding: '28px 32px', minHeight: '100vh' }}>
      <div className="space-y-6">
        <KpiSkeleton count={4} />
        <TableSkeleton />
      </div>
    </div>
  )

  const cardStyle = {
    background: 'white',
    borderRadius: '12px',
    border: '1px solid #e5e7eb',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    padding: '20px 24px'
  };

  const ghostButtonStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    border: '1px solid #e5e7eb',
    background: 'white',
    color: '#374151',
    borderRadius: '8px',
    padding: '8px 14px',
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s'
  };

  return (
    <div style={{ background: '#f8f9fa', minHeight: 'calc(100vh - 64px)' }}>
      <div className="animate-fade-in space-y-6 w-full">
        
        {/* Fix 1: Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <p style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '6px' }}>
              <Link to="/clients" className="hover:text-[#1a4d3a] transition-colors">Clients</Link> › {client?.raisonSociale}
            </p>
            <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#111827', margin: 0 }}>
              Détail Client : {client?.raisonSociale}
            </h1>
          </div>
          <div className="flex gap-2">
            <button onClick={handleExport} style={ghostButtonStyle} onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'} onMouseLeave={e => e.currentTarget.style.background = 'white'}>
              <Download size={14} /> Exporter Excel
            </button>
            <button onClick={() => navigate(`/clients/${id}/modifier`)} style={ghostButtonStyle} onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'} onMouseLeave={e => e.currentTarget.style.background = 'white'}>
              <Pencil size={14} /> Modifier
            </button>
            <button onClick={() => navigate('/clients')} style={ghostButtonStyle} onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'} onMouseLeave={e => e.currentTarget.style.background = 'white'}>
              <ArrowLeft size={14} /> Retour
            </button>
          </div>
        </div>

        {/* Fix 2: Stat cards row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
          <div style={{ ...cardStyle, borderLeft: '4px solid #1a4d3a' }}>
            <p style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#9ca3af', marginBottom: '8px', margin: 0 }}>Total Facturé</p>
            <p style={{ fontSize: '26px', fontWeight: 700, color: '#111827', margin: 0 }}>{formatMAD(client?.totalFacture)}</p>
          </div>
          <div style={{ ...cardStyle, borderLeft: '4px solid #16a34a' }}>
            <p style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#9ca3af', marginBottom: '8px', margin: 0 }}>Total Payé</p>
            <p style={{ fontSize: '26px', fontWeight: 700, color: '#111827', margin: 0 }}>{formatMAD(client?.totalPaye)}</p>
          </div>
          <div style={{ ...cardStyle, borderLeft: '4px solid #f59e0b' }}>
            <p style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#9ca3af', marginBottom: '8px', margin: 0 }}>En Attente</p>
            <p style={{ fontSize: '26px', fontWeight: 700, color: '#111827', margin: 0 }}>{formatMAD(client?.enAttente)}</p>
          </div>
          <div style={{ ...cardStyle, borderLeft: '4px solid #3b82f6' }}>
            <p style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#9ca3af', marginBottom: '8px', margin: 0 }}>Nb. Factures</p>
            <p style={{ fontSize: '26px', fontWeight: 700, color: '#111827', margin: 0 }}>{client?.nombreFactures || 0}</p>
          </div>
        </div>

        {/* Fix 3: Bottom section layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px', alignItems: 'start' }}>
          
          {/* Fix 4: Client info card (left) */}
          <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', padding: '24px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#111827', borderBottom: '1px solid #f3f4f6', paddingBottom: '14px', marginBottom: '16px', marginTop: 0 }}>
              Informations Client
            </h3>
            <div className="space-y-0">
              {[
                ['Code', client?.code],
                ['Type', <StatusBadge statut={client?.type} size="sm" />],
                ['Adresse', client?.adresse],
                ['Ville', client?.ville],
                ['Téléphone', client?.telephone],
                ['Email', client?.email],
                ['Notes', client?.notes],
              ].map(([label, value]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f9fafb' }}>
                  <span style={{ fontSize: '13px', color: '#9ca3af', fontWeight: 500 }}>{label}</span>
                  <span style={{ fontSize: '13px', color: '#111827', fontWeight: 500, textAlign: 'right' }}>{value || '-'}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Fix 5: Invoice history card (right) */}
          <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
            <div style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f3f4f6' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#111827', margin: 0 }}>
                Historique des Factures
              </h3>
              <span style={{ background: '#f2f4f7', color: '#667085', fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '12px' }}>
                {factures.length}
              </span>
            </div>
            <table className="w-full">
              <thead>
                <tr style={{ background: '#f8f9fa' }}>
                  {['N°', 'Date', 'Montant', 'Mode', 'Statut', ''].map((h, i) => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: i === 2 ? 'right' : i === 3 || i === 4 ? 'center' : 'left', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', color: '#9ca3af' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {factures.map(f => (
                  <tr
                    key={f.id}
                    style={{ borderBottom: '1px solid #f3f4f6', cursor: 'pointer', transition: 'background 0.1s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f0fdf4'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    onClick={() => navigate(`/factures/${f.id}`)}
                  >
                    <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 500, color: '#111827' }}>{f.numero}</td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: '#6b7280' }}>{formatDate(f.date)}</td>
                    <td style={{ padding: '12px 16px', fontSize: '13.5px', fontWeight: 600, color: '#111827', textAlign: 'right' }}>{formatMAD(f.montantTTC)}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <PaymentModeBadge mode={f.modeReglement} size="sm" />
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <StatusBadge statut={f.statut} size="sm" />
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <button
                        onClick={e => { e.stopPropagation(); navigate(`/factures/${f.id}`); }}
                        style={{ padding: '5px', borderRadius: '6px', border: 'none', background: 'transparent', cursor: 'pointer', color: '#98A2B3', transition: 'all 0.1s' }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#eff6ff'; e.currentTarget.style.color = '#2563eb'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#98A2B3'; }}
                      >
                        <Eye size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
                {factures.length === 0 && <tr><td colSpan={5} style={{ padding: '48px', textAlign: 'center', fontSize: '13px', color: '#9ca3af' }}>Aucune facture</td></tr>}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </div>
  )
}
