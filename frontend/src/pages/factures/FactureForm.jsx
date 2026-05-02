import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useForm, useFieldArray, Controller } from 'react-hook-form'
import { Plus, Trash2, ChevronDown } from 'lucide-react'
import { getFacture, createFacture, updateFacture } from '../../api/factures'
import { getClients } from '../../api/clients'
import { STATUS_LABELS, MODES_REGLEMENT, LIVRAISON_STATUS_LABELS, PAYMENT_MODE_COLORS } from '../../utils/constants'
import toast from 'react-hot-toast'

const PaymentModeDropdown = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedMode = MODES_REGLEMENT.find(m => m.value === value) || { label: 'Non défini', value: '' };
  const color = PAYMENT_MODE_COLORS[selectedMode.label] || PAYMENT_MODE_COLORS['Non défini'];

  return (
    <div ref={dropdownRef} style={{ position: 'relative', width: '100%' }}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          height: '40px',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          padding: '0 12px',
          fontSize: '14px',
          background: '#fafafa',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          transition: 'all 0.2s'
        }}
        onMouseEnter={e => e.currentTarget.style.borderColor = '#d1d5db'}
        onMouseLeave={e => e.currentTarget.style.borderColor = isOpen ? '#1a4d3a' : '#e5e7eb'}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: color, flexShrink: 0 }} />
          <span style={{ color: '#111827' }}>{selectedMode.label}</span>
        </div>
        <ChevronDown size={16} color="#9ca3af" style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
      </div>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          marginTop: '4px',
          background: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          zIndex: 100,
          padding: '4px',
          maxHeight: '240px',
          overflowY: 'auto'
        }}>
          {[{ label: 'Non défini', value: '' }, ...MODES_REGLEMENT].map(m => {
            const mColor = PAYMENT_MODE_COLORS[m.label] || PAYMENT_MODE_COLORS['Non défini'];
            const isSelected = value === m.value;
            return (
              <div 
                key={m.value}
                onClick={() => { onChange(m.value); setIsOpen(false); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 12px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  borderRadius: '6px',
                  background: isSelected ? '#f0fdf4' : 'transparent',
                  color: isSelected ? '#1a4d3a' : '#111827',
                  fontWeight: isSelected ? 600 : 400,
                  transition: 'all 0.1s'
                }}
                onMouseEnter={e => { if(!isSelected) e.currentTarget.style.background = '#f8f9fa' }}
                onMouseLeave={e => { if(!isSelected) e.currentTarget.style.background = 'transparent' }}
              >
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: mColor, flexShrink: 0 }} />
                <span>{m.label}</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  );
};

export default function FactureForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = !!id
  const [loading, setLoading] = useState(false)
  const [clients, setClients] = useState([])
  const [fetching, setFetching] = useState(true)

  const { register, handleSubmit, control, reset, watch, formState: { errors } } = useForm({
    defaultValues: {
      clientId: '',
      numeroDovis: '',
      dateProposition: new Date().toISOString().slice(0, 10),
      dateFinValidite: '',
      statutFacture: 'BROUILLON',
      modeReglement: '',
      statutLivraison: 'EN_ATTENTE',
      observations: '',
      lignes: [{ designation: '', quantite: 1, prixUnitaireHT: 0, tauxTVA: 20 }],
    }
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'lignes' })
  const watchedLignes = watch('lignes')

  useEffect(() => {
    getClients().then(r => setClients(r.data || [])).catch(() => {})
    if (isEdit) {
      getFacture(id).then(res => {
        const f = res.data
        reset({
          clientId: f.client?.id || '',
          numeroDovis: f.numeroDovis || '',
          dateProposition: f.date || '',
          dateFinValidite: f.validite || '',
          statutFacture: f.statut || 'BROUILLON',
          modeReglement: f.modeReglementEnum || '',
          statutLivraison: f.livraisonStatut || 'EN_ATTENTE',
          observations: f.observations || '',
          lignes: (f.lignes || []).map(l => ({
            designation: l.designation || '',
            quantite: l.quantite || 1,
            prixUnitaireHT: l.prixUnitaireHT || 0,
            tauxTVA: l.tauxTVA || 20,
          })),
        })
      }).catch(() => toast.error('Erreur lors du chargement'))
        .finally(() => setFetching(false))
    } else {
      setFetching(false)
    }
  }, [id, isEdit, reset])

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      if (isEdit) {
        await updateFacture(id, data)
        toast.success('Facture modifiée avec succès')
        navigate(`/factures/${id}`)
      } else {
        await createFacture(data)
        toast.success('Facture créée avec succès')
        navigate('/factures')
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erreur lors de la sauvegarde')
    } finally { setLoading(false) }
  }

  // Calculate totals
  const totalHT = (watchedLignes || []).reduce((sum, l) => sum + (parseFloat(l.prixUnitaireHT) || 0) * (parseFloat(l.quantite) || 0), 0)
  const totalTVA = (watchedLignes || []).reduce((sum, l) => {
    const ht = (parseFloat(l.prixUnitaireHT) || 0) * (parseFloat(l.quantite) || 0)
    return sum + ht * ((parseFloat(l.tauxTVA) || 20) / 100)
  }, 0)
  const totalTTC = totalHT + totalTVA

  if (fetching) return <div className="flex items-center justify-center h-64"><div className="text-gray-400">Chargement...</div></div>

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
  };

  const labelStyle = {
    fontSize: '13px',
    fontWeight: 500,
    color: '#374151',
    marginBottom: '4px',
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
      background: '#f8f9fa', 
      padding: '24px 32px', 
      height: 'calc(100vh - 64px)', 
      display: 'flex', 
      flexDirection: 'column',
      overflow: 'hidden',
      boxSizing: 'border-box'
    }}>
      <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
        
        {/* Fix 1: Page layout & Breadcrumb */}
        <div style={{ marginBottom: '16px', flexShrink: 0 }}>
          <p style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '4px' }}>
            <Link to="/factures" className="hover:text-[#1a4d3a] transition-colors">Facturation</Link> › {isEdit ? 'Modifier la Facture' : 'Nouvelle Facture'}
          </p>
          <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#111827', margin: 0 }}>
            {isEdit ? 'Modifier la Facture' : 'Nouvelle Facture'}
          </h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', width: '100%' }}>
          
          {/* Fix 2: "Informations générales" card */}
          <div style={{ 
            background: 'white', 
            borderRadius: '12px', 
            border: '1px solid #e5e7eb', 
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)', 
            padding: '20px 24px', 
            marginBottom: '16px',
            flexShrink: 0 
          }}>
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#111827', borderBottom: '1px solid #f3f4f6', paddingBottom: '10px', marginBottom: '16px', marginTop: 0 }}>
              Informations générales
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '16px', marginBottom: '12px' }}>
              <div>
                <label style={labelStyle}>Client <span style={{ color: '#ef4444' }}>*</span></label>
                <div style={{ position: 'relative' }}>
                  <select {...register('clientId', { required: 'Client requis' })}
                    style={{ ...inputStyle, appearance: 'none', paddingRight: '32px' }}
                    onFocus={handleFocus} onBlur={handleBlur}
                  >
                    <option value="">Sélectionner un client...</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.raisonSociale}</option>)}
                  </select>
                  <ChevronDown style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }} size={16} />
                </div>
              </div>
              <div>
                <label style={labelStyle}>N° Dossier / Devis <span style={{ color: '#ef4444' }}>*</span></label>
                <input type="text" {...register('numeroDovis', { required: 'Numéro requis' })}
                  style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} />
              </div>
              <div>
                <label style={labelStyle}>Mode Règlement</label>
                <Controller
                  name="modeReglement"
                  control={control}
                  render={({ field }) => (
                    <PaymentModeDropdown value={field.value} onChange={field.onChange} />
                  )}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '16px', marginBottom: '12px' }}>
              <div>
                <label style={labelStyle}>Date de proposition <span style={{ color: '#ef4444' }}>*</span></label>
                <input type="date" {...register('dateProposition', { required: 'Date requise' })}
                  style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} />
              </div>
              <div>
                <label style={labelStyle}>Date fin validité</label>
                <input type="date" {...register('dateFinValidite')}
                  style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} />
              </div>
              <div>
                <label style={labelStyle}>Statut</label>
                <div style={{ position: 'relative' }}>
                  <select {...register('statutFacture')}
                    style={{ ...inputStyle, appearance: 'none', paddingRight: '32px' }}
                    onFocus={handleFocus} onBlur={handleBlur}
                  >
                    {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                  <ChevronDown style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }} size={16} />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Livraison</label>
                <div style={{ position: 'relative' }}>
                  <select {...register('statutLivraison')}
                    style={{ ...inputStyle, appearance: 'none', paddingRight: '32px' }}
                    onFocus={handleFocus} onBlur={handleBlur}
                  >
                    {Object.entries(LIVRAISON_STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                  <ChevronDown style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }} size={16} />
                </div>
              </div>
            </div>

            <div>
              <label style={labelStyle}>Observations</label>
              <textarea {...register('observations')} 
                style={{ ...inputStyle, height: 'auto', minHeight: '60px', padding: '10px 12px', resize: 'none' }} 
                onFocus={handleFocus} onBlur={handleBlur} />
            </div>
          </div>

          {/* Fix 3: "Lignes de facturation" card — Flex growth and internal scroll */}
          <div style={{ 
            background: 'white', 
            borderRadius: '12px', 
            border: '1px solid #e5e7eb', 
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)', 
            padding: '20px 24px', 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column', 
            overflow: 'hidden',
            marginBottom: '16px' 
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexShrink: 0 }}>
              <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#111827', margin: 0 }}>Lignes de facturation</h3>
              <button type="button" onClick={() => append({ designation: '', quantite: 1, prixUnitaireHT: 0, tauxTVA: 20 })}
                style={{ background: '#f0fdf4', color: '#1a4d3a', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '6px 12px', fontSize: '12.5px', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.background = '#dcfce7'} onMouseLeave={e => e.currentTarget.style.background = '#f0fdf4'}
              >
                <Plus size={14} /> Ajouter une ligne
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '3fr 80px 100px 80px 110px 40px', gap: '8px', padding: '8px 12px', background: '#f8f9fa', borderRadius: '8px', marginBottom: '8px', flexShrink: 0 }}>
              {['Désignation', 'Qté', 'P.U. HT', 'TVA %', 'Total HT', ''].map(h => (
                <span key={h} style={{ fontSize: '10.5px', fontWeight: 600, textTransform: 'uppercase', color: '#9ca3af', letterSpacing: '0.05em' }}>{h}</span>
              ))}
            </div>

            {/* Scrollable area for lines */}
            <div style={{ flex: 1, overflowY: 'auto', paddingRight: '4px' }}>
              <div className="space-y-2">
                {fields.map((field, index) => {
                  const qty = parseFloat(watchedLignes?.[index]?.quantite) || 0
                  const pu = parseFloat(watchedLignes?.[index]?.prixUnitaireHT) || 0
                  const lineTotal = qty * pu
                  return (
                    <div key={field.id} style={{ display: 'grid', gridTemplateColumns: '3fr 80px 100px 80px 110px 40px', gap: '8px', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid #f3f4f6' }}>
                      <div>
                        <input type="text" {...register(`lignes.${index}.designation`, { required: true })}
                          style={{ ...inputStyle, height: '36px', background: 'white', padding: '0 10px' }} 
                          onFocus={handleFocus} onBlur={handleBlur} />
                      </div>
                      <div>
                        <input type="number" step="0.01" min="0" {...register(`lignes.${index}.quantite`, { required: true, min: 0 })}
                          style={{ ...inputStyle, height: '36px', background: 'white', padding: '0 8px', textAlign: 'center' }} 
                          onFocus={handleFocus} onBlur={handleBlur} />
                      </div>
                      <div>
                        <input type="number" step="0.01" min="0" {...register(`lignes.${index}.prixUnitaireHT`, { required: true, min: 0 })}
                          style={{ ...inputStyle, height: '36px', background: 'white', padding: '0 8px', textAlign: 'center' }} 
                          onFocus={handleFocus} onBlur={handleBlur} />
                      </div>
                      <div>
                        <input type="number" step="0.01" {...register(`lignes.${index}.tauxTVA`)}
                          style={{ ...inputStyle, height: '36px', background: 'white', padding: '0 8px', textAlign: 'center' }} 
                          onFocus={handleFocus} onBlur={handleBlur} />
                      </div>
                      <div style={{ fontWeight: 600, color: '#111827', fontSize: '13px', textAlign: 'right', paddingRight: '8px' }}>
                        {lineTotal.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        {fields.length > 1 && (
                          <button type="button" onClick={() => remove(index)} 
                            style={{ background: 'transparent', border: 'none', color: '#9ca3af', borderRadius: '6px', padding: '4px', cursor: 'pointer', transition: 'all 0.2s' }}
                            onMouseEnter={e => { e.currentTarget.style.background = '#fee2e2'; e.currentTarget.style.color = '#ef4444'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#9ca3af'; }}
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Fix 4: Totals row pinned at bottom of card */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', paddingTop: '12px', borderTop: '1px solid #f3f4f6', flexShrink: 0, marginTop: '8px' }}>
              <div style={{ display: 'flex', gap: '32px', fontSize: '13px' }}>
                <span style={{ color: '#6b7280' }}>Total HT</span>
                <span style={{ color: '#111827', fontWeight: 500, width: '90px', textAlign: 'right' }}>{totalHT.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} MAD</span>
              </div>
              <div style={{ display: 'flex', gap: '32px', fontSize: '13px' }}>
                <span style={{ color: '#6b7280' }}>Total TVA</span>
                <span style={{ color: '#111827', fontWeight: 500, width: '90px', textAlign: 'right' }}>{totalTVA.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} MAD</span>
              </div>
              <div style={{ display: 'flex', gap: '32px', borderTop: '2px solid #e5e7eb', paddingTop: '8px', marginTop: '2px' }}>
                <span style={{ fontSize: '15px', fontWeight: 700, color: '#111827' }}>Total TTC</span>
                <span style={{ fontSize: '16px', fontWeight: 700, color: '#1a4d3a', width: '90px', textAlign: 'right' }}>{totalTTC.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} MAD</span>
              </div>
            </div>
          </div>

          {/* Fix 5: Action buttons pinned at bottom of screen */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', flexShrink: 0 }}>
            <button type="button" onClick={() => navigate('/factures')}
              style={{ background: 'white', border: '1px solid #e5e7eb', color: '#374151', borderRadius: '8px', padding: '9px 18px', fontSize: '14px', fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'} onMouseLeave={e => e.currentTarget.style.background = 'white'}
            >
              Annuler
            </button>
            <button type="submit" disabled={loading}
              style={{ background: '#1a4d3a', color: 'white', borderRadius: '8px', padding: '9px 18px', fontSize: '14px', fontWeight: 500, border: 'none', cursor: 'pointer', transition: 'all 0.2s', opacity: loading ? 0.7 : 1 }}
              onMouseEnter={e => !loading && (e.currentTarget.style.background = '#163d2e')} onMouseLeave={e => !loading && (e.currentTarget.style.background = '#1a4d3a')}
            >
              {loading ? 'Enregistrement...' : isEdit ? 'Enregistrer les modifications' : 'Créer la Facture'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
