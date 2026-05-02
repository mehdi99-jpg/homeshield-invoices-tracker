import { Check } from 'lucide-react'

const STEPS = ['Brouillon', 'En attente', 'Livrée', 'Payée']
const STEP_MAP = { BROUILLON: 0, EN_ATTENTE: 1, LIVREE: 2, PAYEE: 3, EN_RETARD: 1 }

export default function StatusStepper({ currentStatus }) {
  const currentIdx = STEP_MAP[currentStatus] ?? 0

  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', width: '100%', maxWidth: '800px', margin: '0 auto' }}>
      {STEPS.map((step, i) => (
        <div key={step} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 'none' }}>
          {/* Step Group: Circle + Label */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '13px',
              fontWeight: 600,
              transition: 'all 0.2s',
              flexShrink: 0,
              ...(i < currentIdx ? {
                background: '#1a4d3a',
                color: 'white',
              } : i === currentIdx ? {
                background: 'white',
                border: '2px solid #1a4d3a',
                color: '#1a4d3a',
              } : {
                background: '#f3f4f6',
                border: '2px solid #e5e7eb',
                color: '#9ca3af',
              })
            }}>
              {i < currentIdx ? <Check size={16} strokeWidth={3} /> : i + 1}
            </div>
            <span style={{
              fontSize: '12px',
              fontWeight: 500,
              whiteSpace: 'nowrap',
              color: i <= currentIdx ? '#1a4d3a' : '#9ca3af'
            }}>
              {step}
            </span>
          </div>

          {/* Connector Line (aligned with circles) */}
          {i < STEPS.length - 1 && (
            <div style={{
              height: '2px',
              flex: 1,
              margin: '0 8px',
              marginTop: '-20px', /* Shift line up to align with circle center */
              background: i < currentIdx ? '#1a4d3a' : '#e5e7eb'
            }} />
          )}
        </div>
      ))}
    </div>
  )
}
