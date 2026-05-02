import { useForm } from 'react-hook-form'
import { X, ChevronDown } from 'lucide-react'
import { PASSAGE_STATUS_LABELS } from '../../utils/constants'

export default function InterventionModal({ isOpen, onClose, onSave, intervention, loading }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: intervention || { statut: 'PLANIFIE', datePassage: '', heure: '', technicien: '', zonesTraitees: '', produitUtilise: '', notes: '' }
  })

  if (!isOpen) return null;

  const onSubmit = (data) => onSave(data)

  const inputStyle = {
    height: '40px',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '0 12px',
    fontSize: '14px',
    background: '#fafafa',
    width: '100%',
    outline: 'none',
    transition: 'all 0.2s',
    color: '#111827'
  };

  const labelStyle = {
    fontSize: '13px',
    fontWeight: 500,
    color: '#374151',
    marginBottom: '6px',
    display: 'block',
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
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.45)',
      backdropFilter: 'blur(2px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 50,
      padding: '20px'
    }}>
      {/* Modal Container */}
      <div className="animate-fade-in" style={{
        background: 'white',
        borderRadius: '16px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
        padding: '28px 32px',
        width: '100%',
        maxWidth: '540px',
        position: 'relative'
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
            transition: 'background 0.2s'
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#e5e7eb'}
          onMouseLeave={e => e.currentTarget.style.background = '#f3f4f6'}
        >
          <X size={16} />
        </button>

        {/* Modal Header */}
        <div style={{ borderBottom: '1px solid #f3f4f6', paddingBottom: '16px', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', margin: 0 }}>
            {intervention?.id ? `Modifier le passage ${intervention.numeroPassage || ''}` : 'Nouveau Passage'}
          </h2>
          <p style={{ fontSize: '13px', color: '#6b7280', margin: '4px 0 0 0' }}>
            Enregistrer un nouveau passage d'intervention
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            
            {/* Row 1: N° Passage | Statut */}
            <div>
              <label style={labelStyle}>N° Passage</label>
              <div style={{ position: 'relative' }}>
                <select 
                  {...register('numeroPassage')} 
                  style={{ ...inputStyle, appearance: 'none', paddingRight: '32px' }}
                  onFocus={handleFocus} onBlur={handleBlur}
                >
                  {[1,2,3,4,5].map(n => <option key={n} value={n}>Passage {n}</option>)}
                </select>
                <ChevronDown style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }} size={14} />
              </div>
            </div>
            <div>
              <label style={labelStyle}>Statut</label>
              <div style={{ position: 'relative' }}>
                <select 
                  {...register('statut')} 
                  style={{ ...inputStyle, appearance: 'none', paddingRight: '32px' }}
                  onFocus={handleFocus} onBlur={handleBlur}
                >
                  {Object.entries(PASSAGE_STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
                <ChevronDown style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }} size={14} />
              </div>
            </div>

            {/* Row 2: Date de passage | Heure */}
            <div>
              <label style={labelStyle}>Date de passage <span style={{ color: '#ef4444' }}>*</span></label>
              <input 
                type="date" 
                {...register('datePassage', { required: 'Date requise' })}
                style={inputStyle}
                onFocus={handleFocus} onBlur={handleBlur}
              />
              {errors.datePassage && <p className="text-xs text-red-500 mt-1">{errors.datePassage.message}</p>}
            </div>
            <div>
              <label style={labelStyle}>Heure</label>
              <input 
                type="time" 
                {...register('heure')}
                style={inputStyle}
                onFocus={handleFocus} onBlur={handleBlur}
              />
            </div>

            {/* Row 3: Technicien */}
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Technicien <span style={{ color: '#ef4444' }}>*</span></label>
              <input 
                type="text" 
                {...register('technicien', { required: 'Technicien requis' })}
                style={inputStyle}
                onFocus={handleFocus} onBlur={handleBlur}
              />
              {errors.technicien && <p className="text-xs text-red-500 mt-1">{errors.technicien.message}</p>}
            </div>

            {/* Row 4: Zones traitées | Produit utilisé */}
            <div>
              <label style={labelStyle}>Zones traitées</label>
              <input 
                type="text" 
                {...register('zonesTraitees')}
                style={inputStyle}
                onFocus={handleFocus} onBlur={handleBlur}
              />
            </div>
            <div>
              <label style={labelStyle}>Produit utilisé</label>
              <input 
                type="text" 
                {...register('produitUtilise')}
                style={inputStyle}
                onFocus={handleFocus} onBlur={handleBlur}
              />
            </div>

            {/* Row 5: Notes */}
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Notes d'intervention</label>
              <textarea 
                {...register('notes')} 
                style={{ ...inputStyle, height: 'auto', minHeight: '80px', padding: '12px', resize: 'none' }}
                onFocus={handleFocus} onBlur={handleBlur}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'flex-end', 
            gap: '12px', 
            marginTop: '24px', 
            paddingTop: '16px', 
            borderTop: '1px solid #f3f4f6' 
          }}>
            <button 
              type="button" 
              onClick={onClose}
              style={{
                background: 'white',
                border: '1px solid #e5e7eb',
                color: '#374151',
                borderRadius: '8px',
                padding: '9px 20px',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'background 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
              onMouseLeave={e => e.currentTarget.style.background = 'white'}
            >
              Annuler
            </button>
            <button 
              type="submit" 
              disabled={loading}
              style={{
                background: '#1a4d3a',
                color: 'white',
                borderRadius: '8px',
                padding: '9px 20px',
                fontSize: '14px',
                fontWeight: 500,
                border: 'none',
                cursor: 'pointer',
                transition: 'background 0.2s',
                opacity: loading ? 0.7 : 1
              }}
              onMouseEnter={e => !loading && (e.currentTarget.style.background = '#163d2e')}
              onMouseLeave={e => !loading && (e.currentTarget.style.background = '#1a4d3a')}
            >
              {loading ? 'Enregistrement...' : 'Enregistrer le passage'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
