import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { Printer, ArrowLeft } from 'lucide-react'
import { getBonLivraison } from '../../api/bonsLivraison'
import { formatDate } from '../../utils/formatters'
import toast from 'react-hot-toast'

export default function BonPrint() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [bl, setBl] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getBonLivraison(id).then(res => setBl(res.data))
      .catch(() => toast.error('Erreur lors du chargement'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading || !bl) return (
    <div style={{ background: '#f8f9fa', padding: '28px 32px', minHeight: '100vh' }}>
      <div className="flex items-center justify-center h-64 text-gray-400">Chargement du document...</div>
    </div>
  )

  return (
    <div className="page-wrapper" style={{ background: '#f8f9fa', padding: '24px 28px', minHeight: '100vh' }}>
      
      {/* Top Action Bar — Hidden on Print */}
      <div className="no-print" style={{ 
        display: 'flex', gap: '12px', marginBottom: '24px', paddingBottom: '16px', 
        borderBottom: '1px solid #e5e7eb', width: '100%', margin: '0 auto 24px auto' 
      }}>
        <button onClick={() => window.print()} 
          style={{ background: '#1a4d3a', color: 'white', borderRadius: '8px', padding: '9px 18px', fontSize: '14px', fontWeight: 500, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Printer size={16} /> Imprimer maintenant
        </button>
        <button onClick={() => navigate(-1)} 
          style={{ background: 'white', border: '1px solid #e5e7eb', color: '#374151', borderRadius: '8px', padding: '9px 18px', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ArrowLeft size={16} /> Retour
        </button>
      </div>

      {/* Main Document Area */}
      <div className="invoice-print-area" style={{ 
        width: '100%', margin: '0 auto', background: 'white', 
        borderRadius: '12px', border: '1px solid #e5e7eb', 
        boxShadow: '0 4px 24px rgba(0,0,0,0.08)', padding: '48px', boxSizing: 'border-box' 
      }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', paddingBottom: '24px', borderBottom: '2px solid #1a4d3a' }}>
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#1a4d3a', margin: 0 }}>HomeShield</h2>
            <div style={{ fontSize: '12px', color: '#6b7280', lineHeight: 1.6, marginTop: '6px' }}>
              <p style={{ margin: 0 }}>Solutions Anti-Nuisibles Professionnelles</p>
              <p style={{ margin: 0 }}>Casablanca, Maroc</p>
              <p style={{ margin: 0 }}>Tél: +212 5XX-XXXXXX</p>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#9ca3af' }}>BON DE LIVRAISON</span>
            <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#111827', margin: '4px 0' }}>N° {bl.numeroBL}</h3>
            <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>Émission : {formatDate(bl.dateEmission)}</p>
            {bl.dateLivraison && <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>Livraison : {formatDate(bl.dateLivraison)}</p>}
          </div>
        </div>

        {/* Client Box */}
        <div style={{ background: '#f8f9fa', borderRadius: '10px', border: '1px solid #e5e7eb', padding: '16px 20px', marginBottom: '28px' }}>
          <h4 style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9ca3af', marginBottom: '8px', margin: 0 }}>ADRESSE DE LIVRAISON</h4>
          <p style={{ fontSize: '15px', fontWeight: 700, color: '#111827', margin: 0 }}>{bl.client?.raisonSociale}</p>
          <div style={{ fontSize: '13px', color: '#6b7280', lineHeight: 1.7, marginTop: '4px' }}>
            <p style={{ margin: 0 }}>{bl.lieuLivraison || bl.client?.adresse}</p>
            <p style={{ margin: 0 }}>{bl.client?.ville}, Maroc</p>
          </div>
        </div>

        {/* Table */}
        <table style={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'collapse', marginBottom: '32px' }}>
          <thead>
            <tr style={{ background: '#1a4d3a', color: 'white' }}>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.03em', width: '65%', whiteSpace: 'nowrap' }}>Désignation</th>
              <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.03em', width: '20%', whiteSpace: 'nowrap' }}>Quantité</th>
              <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.03em', width: '15%', whiteSpace: 'nowrap' }}>Contrôlé</th>
            </tr>
          </thead>
          <tbody>
            {(bl.lignes || []).map((l, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #f3f4f6', background: i % 2 !== 0 ? '#fafafa' : 'white' }}>
                <td style={{ padding: '12px 16px', fontSize: '12px', color: '#111827', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis' }}>{l.designation}</td>
                <td style={{ padding: '12px 16px', fontSize: '12px', textAlign: 'center', fontWeight: 600, color: '#1a4d3a' }}>{l.quantite}</td>
                <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                  <input type="checkbox" style={{ width: '16px', height: '16px', accentColor: '#1a4d3a', cursor: 'pointer' }} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Signatures */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginTop: '64px', paddingTop: '24px', borderTop: '1px solid #e5e7eb' }}>
          <div>
            <p style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', color: '#9ca3af', letterSpacing: '0.06em', margin: 0, marginBottom: '48px' }}>
              SIGNATURE DU LIVREUR
            </p>
            <div style={{ borderBottom: '1px solid #374151', marginTop: '48px' }} />
          </div>
          <div>
            <p style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', color: '#9ca3af', letterSpacing: '0.06em', margin: 0, marginBottom: '48px' }}>
              SIGNATURE DU CLIENT
            </p>
            <div style={{ borderBottom: '1px solid #374151', marginTop: '48px' }} />
          </div>
        </div>
      </div>

      <style>
        {`
          @media print {
            /* Force visibility of the specific print area */
            body * { visibility: hidden !important; }
            .invoice-print-area, .invoice-print-area * { visibility: visible !important; }
            
            .invoice-print-area {
              position: absolute !important;
              left: 0 !important;
              top: 0 !important;
              width: 100% !important;
              max-width: 100% !important;
              margin: 0 !important;
              padding: 10mm 15mm !important;
              border: none !important;
              box-shadow: none !important;
            }

            .page-wrapper {
              background: white !important;
              padding: 0 !important;
              margin: 0 !important;
            }

            .no-print { display: none !important; }

            @page {
              size: A4 portrait;
              margin: 0;
            }

            table thead tr {
              background-color: #1a4d3a !important;
              color: white !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }

            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
          }
        `}
      </style>
    </div>
  )
}
