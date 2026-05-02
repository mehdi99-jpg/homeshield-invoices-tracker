import { useState, useEffect } from 'react'
import { FileSpreadsheet, Users, Truck, Filter, Download, Search, ChevronDown } from 'lucide-react'
import { exportFacturesExcel, exportFacturesFiltrees, exportClientsExcel, exportBLsExcel, exportClientRapport, getClientsRapport } from '../api/exports'
import { STATUS_LABELS } from '../utils/constants'
import { formatMAD } from '../utils/formatters'
import { TableSkeleton } from '../components/ui/Skeleton'
import toast from 'react-hot-toast'

export default function Exports() {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [clientSearch, setClientSearch] = useState('')
  const [filteredStatut, setFilteredStatut] = useState('')
  const [downloading, setDownloading] = useState('')

  useEffect(() => {
    getClientsRapport().then(res => setClients(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleDownload = async (key, fn) => {
    setDownloading(key)
    try {
      await fn()
      toast.success('Fichier téléchargé')
    } catch { toast.error('Erreur lors du téléchargement') }
    finally { setDownloading('') }
  }

  const filteredClients = clients.filter(c =>
    (c.raisonSociale || '').toLowerCase().includes(clientSearch.toLowerCase()) ||
    (c.code || '').toLowerCase().includes(clientSearch.toLowerCase())
  )

  const sectionLabelStyle = {
    fontSize: '13px',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: '#9ca3af',
    marginBottom: '14px',
    display: 'block'
  };

  const exportCardStyle = {
    background: 'white',
    borderRadius: '12px',
    border: '1px solid #e5e7eb',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    padding: '24px 20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: '12px'
  };

  const iconWrapperStyle = {
    background: '#f0fdf4',
    borderRadius: '12px',
    width: '48px',
    height: '48px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  const primaryButtonStyle = {
    width: '100%',
    background: '#1a4d3a',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '9px',
    fontSize: '14px',
    fontWeight: 500,
    marginTop: 'auto',
    cursor: 'pointer',
    transition: 'background 0.2s'
  };

  const filterInputStyle = {
    width: '100%',
    height: '38px',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '0 12px',
    fontSize: '14px',
    background: '#f9fafb',
    outline: 'none',
    transition: 'border-color 0.2s',
    appearance: 'none',
    color: '#101828'
  };

  return (
    <div style={{ background: '#f8f9fa', minHeight: 'calc(100vh - 64px)' }}>
      <div className="animate-fade-in w-full">
        
        {/* Fix 1 — Page header */}
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#111827', margin: 0 }}>Exports et Rapports</h1>
          <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px', margin: 0 }}>Téléchargez vos données au format Excel</p>
        </div>

        {/* Fix 2 — Exports de données section */}
        <div style={{ marginBottom: '28px' }}>
          <span style={sectionLabelStyle}>Exports de données</span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
            
            {/* Toutes les factures */}
            <div style={exportCardStyle}>
              <div style={iconWrapperStyle}>
                <FileSpreadsheet size={22} color="#1a4d3a" />
              </div>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#111827', margin: 0 }}>Toutes les factures</h3>
                <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px', margin: 0 }}>Export complet au format Excel</p>
              </div>
              <button 
                onClick={() => handleDownload('all-invoices', exportFacturesExcel)}
                disabled={downloading === 'all-invoices'}
                style={primaryButtonStyle}
                onMouseEnter={e => e.currentTarget.style.background = '#163d2e'}
                onMouseLeave={e => e.currentTarget.style.background = '#1a4d3a'}
              >
                {downloading === 'all-invoices' ? 'Téléchargement...' : 'Télécharger'}
              </button>
            </div>

            {/* Factures filtrées */}
            <div style={exportCardStyle}>
              <div style={iconWrapperStyle}>
                <Filter size={22} color="#1a4d3a" />
              </div>
              <div style={{ width: '100%' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#111827', margin: 0 }}>Factures filtrées</h3>
                <div style={{ position: 'relative', marginTop: '8px' }}>
                  <select 
                    value={filteredStatut} 
                    onChange={e => setFilteredStatut(e.target.value)}
                    style={{ ...filterInputStyle, paddingRight: '32px' }}
                    onFocus={e => e.target.style.borderColor = '#1a4d3a'}
                    onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                  >
                    <option value="">Tous les statuts</option>
                    {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                  <ChevronDown size={14} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }} />
                </div>
              </div>
              <button 
                onClick={() => handleDownload('filtered', () => exportFacturesFiltrees(filteredStatut))}
                disabled={downloading === 'filtered'}
                style={primaryButtonStyle}
                onMouseEnter={e => e.currentTarget.style.background = '#163d2e'}
                onMouseLeave={e => e.currentTarget.style.background = '#1a4d3a'}
              >
                {downloading === 'filtered' ? 'Téléchargement...' : 'Exporter'}
              </button>
            </div>

            {/* Tous les clients */}
            <div style={exportCardStyle}>
              <div style={iconWrapperStyle}>
                <Users size={22} color="#1a4d3a" />
              </div>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#111827', margin: 0 }}>Tous les clients</h3>
                <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px', margin: 0 }}>Export complet au format Excel</p>
              </div>
              <button 
                onClick={() => handleDownload('clients', exportClientsExcel)}
                disabled={downloading === 'clients'}
                style={primaryButtonStyle}
                onMouseEnter={e => e.currentTarget.style.background = '#163d2e'}
                onMouseLeave={e => e.currentTarget.style.background = '#1a4d3a'}
              >
                {downloading === 'clients' ? 'Téléchargement...' : 'Télécharger'}
              </button>
            </div>

            {/* Bons de Livraison */}
            <div style={exportCardStyle}>
              <div style={iconWrapperStyle}>
                <Truck size={22} color="#1a4d3a" />
              </div>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#111827', margin: 0 }}>Bons de Livraison</h3>
                <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px', margin: 0 }}>Export complet au format Excel</p>
              </div>
              <button 
                onClick={() => handleDownload('bls', exportBLsExcel)}
                disabled={downloading === 'bls'}
                style={primaryButtonStyle}
                onMouseEnter={e => e.currentTarget.style.background = '#163d2e'}
                onMouseLeave={e => e.currentTarget.style.background = '#1a4d3a'}
              >
                {downloading === 'bls' ? 'Téléchargement...' : 'Télécharger'}
              </button>
            </div>

          </div>
        </div>

        {/* Fix 3 — Rapports par client section */}
        <div>
          <span style={sectionLabelStyle}>Rapports par client</span>
          <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
            
            {/* Search Bar inside card */}
            <div style={{ padding: '16px', borderBottom: '1px solid #f3f4f6' }}>
              <div style={{ position: 'relative' }}>
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca3af]" size={16} />
                <input 
                  type="text" 
                  value={clientSearch} 
                  onChange={e => setClientSearch(e.target.value)}
                  placeholder="Rechercher un client..."
                  style={{
                    width: '100%',
                    height: '38px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '0 12px 0 36px',
                    fontSize: '14px',
                    background: '#f9fafb',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                    color: '#101828'
                  }}
                  onFocus={e => e.target.style.borderColor = '#1a4d3a'}
                  onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>
            </div>

            {loading ? <div style={{ padding: '40px' }}><TableSkeleton /></div> : (
              <table className="w-full border-collapse">
                <thead>
                  <tr style={{ background: '#f8f9fa' }}>
                    {['Client', 'Factures', 'Total Facturé', 'Action'].map((h, i) => (
                      <th key={h} style={{ padding: '10px 20px', textAlign: i === 1 ? 'center' : i === 2 ? 'right' : 'left', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#9ca3af', borderBottom: '1px solid #f3f4f6' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredClients.map(c => (
                    <tr key={c.id} style={{ borderBottom: '1px solid #f3f4f6', transition: 'background 0.1s' }} onMouseEnter={e => e.currentTarget.style.background = '#f0fdf4'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '12px 20px' }}>
                        <p style={{ fontSize: '14px', fontWeight: 500, color: '#111827', margin: 0 }}>{c.raisonSociale}</p>
                        <p style={{ fontSize: '12px', color: '#9ca3af', margin: '2px 0 0 0', fontFamily: 'monospace' }}>{c.code}</p>
                      </td>
                      <td style={{ padding: '12px 20px', fontSize: '14px', color: '#374151', textAlign: 'center' }}>{c.nombreFactures}</td>
                      <td style={{ padding: '12px 20px', fontSize: '14px', fontWeight: 600, color: '#111827', textAlign: 'right' }}>{formatMAD(c.totalFacture)}</td>
                      <td style={{ padding: '12px 20px' }}>
                        <button 
                          onClick={() => handleDownload(`client-${c.id}`, () => exportClientRapport(c.id))}
                          disabled={downloading === `client-${c.id}`}
                          style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#1a4d3a', background: 'none', border: 'none', fontSize: '13px', fontWeight: 500, cursor: 'pointer', padding: 0 }}
                          className="hover:underline disabled:opacity-50"
                        >
                          <Download size={16} /> {downloading === `client-${c.id}` ? 'En cours...' : 'Télécharger'}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredClients.length === 0 && <tr><td colSpan={4} style={{ padding: '48px', textAlign: 'center', fontSize: '14px', color: '#9ca3af' }}>Aucun client trouvé</td></tr>}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
