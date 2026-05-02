import { AlertTriangle, X } from 'lucide-react'

export default function ConfirmModal({ isOpen, onClose, onConfirm, title, message, loading }) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 50,
      background: 'rgba(0, 0, 0, 0.45)',
      backdropFilter: 'blur(2px)'
    }}>
      {/* Modal Container */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
        padding: '32px',
        width: '100%',
        maxWidth: '420px',
        position: 'relative',
        animation: 'fadeIn 0.2s ease-out'
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: '#f3f4f6',
            border: 'none',
            borderRadius: '6px',
            width: '28px',
            height: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#6b7280',
            transition: 'background 0.15s'
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#e5e7eb'}
          onMouseLeave={e => e.currentTarget.style.background = '#f3f4f6'}
        >
          <X size={16} />
        </button>

        {/* Content */}
        <div style={{
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px'
        }}>
          {/* Warning Icon Wrapper */}
          <div style={{
            background: '#fef2f2',
            borderRadius: '50%',
            width: '56px',
            height: '56px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '4px'
          }}>
            <AlertTriangle color="#ef4444" size={24} />
          </div>

          <h2 style={{
            fontSize: '18px',
            fontWeight: 700,
            color: '#111827',
            margin: 0
          }}>
            {title || 'Supprimer le client'}
          </h2>

          <div style={{ maxWidth: '300px' }}>
            <p style={{
              fontSize: '14px',
              color: '#6b7280',
              lineHeight: 1.6,
              margin: 0
            }}>
              {message || 'Êtes-vous sûr de vouloir supprimer ce client ?'}
            </p>
            <p style={{
              fontSize: '13px',
              color: '#ef4444',
              margin: '4px 0 0 0',
              fontWeight: 500
            }}>
              Cette action est irréversible.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: '12px',
          marginTop: '24px',
          width: '100%'
        }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              height: '42px',
              background: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 500,
              color: '#374151',
              cursor: 'pointer',
              transition: 'background 0.15s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
            onMouseLeave={e => e.currentTarget.style.background = 'white'}
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            style={{
              flex: 1,
              height: '42px',
              background: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'background 0.15s',
              opacity: loading ? 0.7 : 1
            }}
            onMouseEnter={e => !loading && (e.currentTarget.style.background = '#dc2626')}
            onMouseLeave={e => !loading && (e.currentTarget.style.background = '#ef4444')}
          >
            {loading ? 'Traitement...' : 'Confirmer'}
          </button>
        </div>
      </div>
    </div>
  )
}
