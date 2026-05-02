import { formatMAD, formatDate } from '../../utils/formatters'
import { PaymentModeBadge } from '../ui/StatusBadge'

export default function InvoiceDocument({ facture }) {
  if (!facture) return null
  const f = facture

  return (
    <div 
      id="invoice-print"
      className="invoice-print-area invoice-card"
      style={{
        background: 'white',
        borderRadius: '12px',
        border: '1px solid #e5e7eb',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        padding: '24px',
        width: '100%',
        boxSizing: 'border-box',
        marginBottom: '4px'
      }}
    >
      {/* Document Header (Fix 1: Reduced margin) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '12px' }}>
        <div>
          <h2 className="company-name" style={{ fontSize: '20px', fontWeight: 700, color: '#111827', margin: 0 }}>HomeShield</h2>
          <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px', lineHeight: 1.6, margin: 0 }}>Solutions Anti-Nuisibles Professionnelles</p>
          <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>Casablanca, Maroc</p>
          <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>Tél: +212 5XX-XXXXXX</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#9ca3af' }}>PROPOSITION DV</span>
          <h3 className="invoice-number" style={{ fontSize: '18px', fontWeight: 700, color: '#111827', margin: '4px 0' }}>N° {f.numero}</h3>
          <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>Date : {formatDate(f.date)}</p>
          {f.validite && <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>Validité : {formatDate(f.validite)}</p>}
        </div>
      </div>

      {/* Client + Reference section (Fix 1: Reduced padding/margin) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '12px', padding: '12px 16px', background: '#f8f9fa', borderRadius: '10px' }}>
        <div>
          <h4 style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', color: '#9ca3af', letterSpacing: '0.06em', marginBottom: '6px', margin: 0 }}>CLIENT</h4>
          <p style={{ fontSize: '15px', fontWeight: 600, color: '#111827', margin: 0 }}>{f.client?.raisonSociale}</p>
          <div style={{ fontSize: '13px', color: '#6b7280', lineHeight: 1.5, marginTop: '2px' }}>
            {f.client?.adresse && <p style={{ margin: 0 }}>{f.client.adresse}</p>}
            {f.client?.ville && <p style={{ margin: 0 }}>{f.client.ville}</p>}
            {f.client?.telephone && <p style={{ margin: 0 }}>Tél: {f.client.telephone}</p>}
            {f.client?.email && <p style={{ margin: 0 }}>{f.client.email}</p>}
          </div>
        </div>
        <div>
          <h4 style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', color: '#9ca3af', letterSpacing: '0.06em', marginBottom: '6px', margin: 0 }}>RÉFÉRENCE</h4>
          <div style={{ fontSize: '13px', color: '#6b7280', lineHeight: 1.5 }}>
            <p style={{ margin: '0 0 8px 0' }}>Dossier : <span style={{ color: '#111827', fontWeight: 500 }}>{f.referanceDossier || '-'}</span></p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>Mode de règlement :</span>
              <PaymentModeBadge mode={f.modeReglement} size="sm" />
            </div>
          </div>
        </div>
      </div>

      {/* Lines table */}
      <div style={{ overflow: 'hidden' }}>
        <table className="w-full border-collapse">
          <thead>
            <tr style={{ background: '#f8f9fa' }}>
              <th style={{ padding: '8px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', color: '#9ca3af', borderRadius: '8px 0 0 8px' }}>Désignation</th>
              <th style={{ padding: '8px 16px', textAlign: 'center', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', color: '#9ca3af' }}>Qté</th>
              <th style={{ padding: '8px 16px', textAlign: 'right', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', color: '#9ca3af' }}>P.U. HT</th>
              <th style={{ padding: '8px 16px', textAlign: 'center', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', color: '#9ca3af' }}>TVA %</th>
              <th style={{ padding: '8px 16px', textAlign: 'right', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', color: '#9ca3af', borderRadius: '0 8px 8px 0' }}>Total HT</th>
            </tr>
          </thead>
          <tbody>
            {(f.lignes || []).map((l, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #f3f4f6' }}>
                <td style={{ padding: '10px 16px', fontSize: '13px', color: '#374151' }}>{l.designation}</td>
                <td style={{ padding: '10px 16px', fontSize: '13px', color: '#374151', textAlign: 'center' }}>{l.quantite}</td>
                <td style={{ padding: '10px 16px', fontSize: '13px', color: '#374151', textAlign: 'right' }}>{formatMAD(l.prixUnitaireHT)}</td>
                <td style={{ padding: '10px 16px', fontSize: '13px', color: '#374151', textAlign: 'center' }}>{l.tauxTVA}%</td>
                <td style={{ padding: '10px 16px', fontSize: '13px', fontWeight: 600, color: '#111827', textAlign: 'right' }}>{formatMAD(l.totalHT)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals block (Fix 2 & 4) */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
        <div className="totals-block" style={{ display: 'grid', gridTemplateColumns: 'auto auto', columnGap: '48px', rowGap: '4px' }}>
          <span style={{ color: '#6b7280', fontSize: '14px', textAlign: 'left' }}>Total HT</span>
          <span style={{ color: '#111827', fontWeight: 500, fontSize: '14px', textAlign: 'right', minWidth: '120px' }}>{formatMAD(f.totalHT)}</span>
          
          <span style={{ color: '#6b7280', fontSize: '14px', textAlign: 'left' }}>Total TVA</span>
          <span style={{ color: '#111827', fontWeight: 500, fontSize: '14px', textAlign: 'right', minWidth: '120px' }}>{formatMAD(f.totalTVA)}</span>
          
          <span className="total-ttc-row" style={{ fontSize: '15px', fontWeight: 700, color: '#111827', textAlign: 'left', borderTop: '2px solid #e5e7eb', borderLeft: '3px solid #1a4d3a', paddingLeft: '8px', paddingTop: '10px', marginTop: '6px' }}>TOTAL TTC</span>
          <span className="total-ttc-row" style={{ fontSize: '18px', fontWeight: 700, color: '#1a4d3a', textAlign: 'right', minWidth: '120px', borderTop: '2px solid #e5e7eb', paddingTop: '10px', marginTop: '6px' }}>{formatMAD(f.totalTTC)}</span>
        </div>
      </div>

      {/* Footer (Fix 4: Final Polish) */}
      <div className="invoice-footer" style={{ borderTop: '1px solid #f3f4f6', marginTop: '12px', paddingTop: '12px', textAlign: 'center', fontSize: '11px', color: '#c0c0c0' }}>
        <p style={{ margin: 0 }}>HomeShield SARL — ICE: XXXXXXXXXXXXXXX — RC: XXXXXX — IF: XXXXXXXX</p>
        <p style={{ margin: '4px 0 0 0' }}>Conditions de paiement : selon accord contractuel</p>
      </div>
    </div>
  )
}
