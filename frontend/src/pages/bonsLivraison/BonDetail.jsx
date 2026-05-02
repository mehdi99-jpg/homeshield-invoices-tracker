import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { Printer, ArrowLeft } from 'lucide-react'
import { getBonLivraison } from '../../api/bonsLivraison'
import StatusBadge from '../../components/ui/StatusBadge'
import { formatDate } from '../../utils/formatters'
import toast from 'react-hot-toast'

export default function BonDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [bl, setBl] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getBonLivraison(id).then(res => setBl(res.data))
      .catch(() => toast.error('Erreur lors du chargement'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div style={{ background: '#f8f9fa', padding: '28px 32px', minHeight: '100vh' }}>
      <div className="flex items-center justify-center h-64 text-gray-400">Chargement...</div>
    </div>
  )
  if (!bl) return <p className="text-center text-gray-500 py-12">Bon de livraison non trouvé</p>

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

  const infoRowStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '9px 0',
    borderBottom: '1px solid #f9fafb',
    alignItems: 'center'
  };

  const labelStyle = {
    fontSize: '13px',
    color: '#9ca3af',
    fontWeight: 500,
    minWidth: '100px'
  };

  const valueStyle = {
    fontSize: '13px',
    color: '#111827',
    fontWeight: 500,
    textAlign: 'right',
    flex: 1
  };

  return (
    <div style={{ background: '#f8f9fa', padding: '24px 28px', minHeight: 'calc(100vh - 64px)' }}>
      <div className="animate-fade-in" style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>

        {/* Fix 1 & 4 — Page header (full width) */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', width: '100%' }}>
          <div>
            <p style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '6px' }}>
              <Link to="/bons-de-livraison" className="hover:text-[#1a4d3a] transition-colors">Bons de Livraison</Link> › {bl.numeroBL}
            </p>
            <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#111827', margin: 0 }}>
              Bon de Livraison : {bl.numeroBL}
            </h1>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => navigate(`/bons-de-livraison/${id}/imprimer`)} style={ghostButtonStyle} onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'} onMouseLeave={e => e.currentTarget.style.background = 'white'}>
              <Printer size={14} /> Imprimer
            </button>
            <button onClick={() => navigate('/bons-de-livraison')} style={ghostButtonStyle} onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'} onMouseLeave={e => e.currentTarget.style.background = 'white'}>
              <ArrowLeft size={14} /> Retour
            </button>
          </div>
        </div>

        {/* Fix 1 & 2 — Proportional grid with stretch */}
        <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '20px', alignItems: 'stretch', width: '100%' }}>

          {/* BL Details card (left - wider) */}
          <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', padding: '24px', height: '100%', boxSizing: 'border-box' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#111827', borderBottom: '1px solid #f3f4f6', paddingBottom: '14px', marginBottom: '16px', marginTop: 0 }}>
              Détails du BL
            </h3>

            <div style={infoRowStyle}>
              <span style={labelStyle}>N° BL</span>
              <span style={{ ...valueStyle, fontFamily: 'monospace' }}>{bl.numeroBL}</span>
            </div>
            <div style={infoRowStyle}>
              <span style={labelStyle}>Statut</span>
              <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
                <StatusBadge statut={bl.statut} size="sm" />
              </div>
            </div>
            <div style={infoRowStyle}>
              <span style={labelStyle}>Date Émission</span>
              <span style={valueStyle}>{formatDate(bl.dateEmission)}</span>
            </div>
            <div style={infoRowStyle}>
              <span style={labelStyle}>Date Livraison</span>
              <span style={{ ...valueStyle, color: bl.dateLivraison ? '#111827' : '#d1d5db' }}>
                {bl.dateLivraison ? formatDate(bl.dateLivraison) : '—'}
              </span>
            </div>
            <div style={infoRowStyle}>
              <span style={labelStyle}>Lieu</span>
              <span style={valueStyle}>{bl.lieuLivraison || '-'}</span>
            </div>
            <div style={{ ...infoRowStyle, borderBottom: 'none' }}>
              <span style={labelStyle}>Facture</span>
              <Link to={`/factures/${bl.factureId}`} style={{ ...valueStyle, color: '#2563eb', fontWeight: 500, textDecoration: 'none' }} className="hover:underline">
                {bl.factureNumero}
              </Link>
            </div>

            {/* Products table */}
            <div style={{ borderTop: '1px solid #f3f4f6', marginTop: '16px', paddingBottom: '2px', paddingTop: '16px' }}>
              <h4 style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', color: '#9ca3af', letterSpacing: '0.06em', marginBottom: '10px', marginTop: 0 }}>
                PRODUITS
              </h4>
              <table className="w-full border-collapse">
                <thead>
                  <tr style={{ background: '#f8f9fa' }}>
                    <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', color: '#9ca3af', borderRadius: '6px 0 0 8px' }}>Désignation</th>
                    <th style={{ padding: '8px 12px', textAlign: 'right', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', color: '#9ca3af', borderRadius: '0 6px 6px 0' }}>Quantité</th>
                  </tr>
                </thead>
                <tbody>
                  {(bl.lignes || []).map((l, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #f3f4f6', transition: 'background 0.1s' }} className="hover:bg-[#f0fdf4]">
                      <td style={{ padding: '10px 12px', fontSize: '14px', color: '#111827' }}>{l.designation}</td>
                      <td style={{ padding: '10px 12px', fontSize: '14px', fontWeight: 600, color: '#1a4d3a', textAlign: 'right' }}>{l.quantite}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Client info card (right - narrower) */}
          <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', padding: '24px', height: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#111827', marginBottom: '16px', marginTop: 0 }}>
              Client
            </h3>

            {/* Fix 3 — Client Header Polish */}
            <div style={{ paddingBottom: '16px', borderBottom: '1px solid #f3f4f6', marginBottom: '16px', flexShrink: 0 }}>
              <div style={{ 
                width: '56px', height: '56px', borderRadius: '50%', 
                background: '#f0fdf4', color: '#1a4d3a', 
                border: '2px solid #bbf7d0',
                fontSize: '20px', fontWeight: 700, 
                display: 'flex', alignItems: 'center', 
                justifyContent: 'center',
                margin: '0 auto 12px auto' 
              }}>
                {bl.client?.raisonSociale?.charAt(0).toUpperCase() || 'C'}
              </div>

              <p style={{ fontSize: '16px', fontWeight: 700, color: '#111827', textAlign: 'center', margin: 0 }}>
                {bl.client?.raisonSociale}
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {[
                ['Code', bl.client?.code],
                ['Téléphone', bl.client?.telephone],
                ['Email', bl.client?.email],
                ['Adresse', bl.client?.adresse],
                ['Ville', bl.client?.ville],
              ].map(([label, value]) => (
                <div key={label} style={infoRowStyle}>
                  <span style={{ ...labelStyle, minWidth: '90px' }}>{label}</span>
                  <span style={valueStyle}>{value || '-'}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
