import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { ChevronDown } from 'lucide-react'
import { getClient, createClient, updateClient } from '../../api/clients'
import { TYPES_CLIENT } from '../../utils/constants'
import toast from 'react-hot-toast'

export default function ClientForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = !!id
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(isEdit)

  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  useEffect(() => {
    if (isEdit) {
      getClient(id).then(res => {
        const c = res.data
        reset({
          raisonSociale: c.raisonSociale,
          codeClient: c.code,
          typeClient: c.typeEnum || '',
          telephone: c.telephone,
          email: c.email || '',
          adresse: c.adresse || '',
          ville: c.ville || '',
          notes: c.notes || '',
        })
      }).catch(() => toast.error('Erreur lors du chargement'))
        .finally(() => setFetching(false))
    }
  }, [id, isEdit, reset])

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      if (isEdit) {
        await updateClient(id, data)
        toast.success('Client modifié avec succès')
        navigate(`/clients/${id}`)
      } else {
        await createClient(data)
        toast.success('Client créé avec succès')
        navigate('/clients')
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erreur lors de la sauvegarde')
    } finally { setLoading(false) }
  }

  if (fetching) return <div className="flex items-center justify-center h-64"><div className="text-gray-400">Chargement...</div></div>

  const inputStyle = {
    width: '100%',
    height: '40px',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '0 12px',
    fontSize: '14px',
    color: '#111827',
    background: '#fafafa',
    outline: 'none',
    transition: 'all 0.2s',
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
    e.target.style.boxShadow = '0 0 0 3px rgba(26, 77, 58, 0.1)';
    e.target.style.background = '#ffffff';
  };

  const handleBlur = (e) => {
    e.target.style.borderColor = '#e5e7eb';
    e.target.style.boxShadow = 'none';
    e.target.style.background = '#fafafa';
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '40px' }}>
      <div style={{ width: '100%', margin: '0 auto' }}>
        <form onSubmit={handleSubmit(onSubmit)} 
          style={{ 
            background: 'white', 
            borderRadius: '16px', 
            border: '1px solid #e5e7eb', 
            boxShadow: '0 2px 8px rgba(0,0,0,0.07)', 
            padding: '32px' 
          }}>
          
          {/* Form Header */}
          <div style={{ borderBottom: '1px solid #f3f4f6', paddingBottom: '20px', marginBottom: '24px' }}>
            <h1 style={{ fontSize: '20px', fontWeight: 600, color: '#111827', margin: 0 }}>
              {isEdit ? 'Modifier le Client' : 'Nouveau Client'}
            </h1>
            <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px', margin: 0 }}>
              {isEdit ? 'Modifiez les informations ci-dessous' : 'Remplissez les informations du nouveau client'}
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {/* Row 1: Raison Sociale */}
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>
                Raison Sociale <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input 
                type="text" 
                {...register('raisonSociale', { required: 'Ce champ est requis' })}
                style={inputStyle}
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
              {errors.raisonSociale && <p className="text-xs text-red-500 mt-1">{errors.raisonSociale.message}</p>}
            </div>

            {/* Row 2: Code Client | Type */}
            <div>
              <label style={labelStyle}>
                Code Client <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input 
                type="text" 
                {...register('codeClient', { required: 'Ce champ est requis' })} 
                placeholder="Ex: CL-001"
                style={inputStyle}
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
              {errors.codeClient && <p className="text-xs text-red-500 mt-1">{errors.codeClient.message}</p>}
            </div>

            <div>
              <label style={labelStyle}>
                Type de Client <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div className="relative">
                <select 
                  {...register('typeClient', { required: 'Ce champ est requis' })}
                  style={{ ...inputStyle, appearance: 'none', paddingRight: '36px' }}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                >
                  <option value="">Sélectionner...</option>
                  {TYPES_CLIENT.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
              </div>
              {errors.typeClient && <p className="text-xs text-red-500 mt-1">{errors.typeClient.message}</p>}
            </div>

            {/* Row 3: Téléphone | Email */}
            <div>
              <label style={labelStyle}>
                Téléphone <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input 
                type="text" 
                {...register('telephone', { required: 'Ce champ est requis' })}
                style={inputStyle}
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
              {errors.telephone && <p className="text-xs text-red-500 mt-1">{errors.telephone.message}</p>}
            </div>

            <div>
              <label style={labelStyle}>Email</label>
              <input 
                type="email" 
                {...register('email')}
                style={inputStyle}
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
            </div>

            {/* Row 4: Adresse | Ville */}
            <div>
              <label style={labelStyle}>Adresse</label>
              <input 
                type="text" 
                {...register('adresse')}
                style={inputStyle}
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
            </div>

            <div>
              <label style={labelStyle}>Ville</label>
              <input 
                type="text" 
                {...register('ville')}
                style={inputStyle}
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
            </div>

            {/* Row 5: Notes */}
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Notes / Commentaires</label>
              <textarea 
                {...register('notes')} 
                rows={4}
                style={{ ...inputStyle, height: 'auto', padding: '12px', minHeight: '100px', resize: 'none' }}
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'flex-end', 
            gap: '12px', 
            marginTop: '28px', 
            paddingTop: '20px', 
            borderTop: '1px solid #f3f4f6' 
          }}>
            <button 
              type="button" 
              onClick={() => navigate(isEdit ? `/clients/${id}` : '/clients')}
              style={{
                background: 'white',
                border: '1px solid #e5e7eb',
                color: '#374151',
                borderRadius: '8px',
                padding: '9px 20px',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s'
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
                transition: 'all 0.2s',
                opacity: loading ? 0.7 : 1
              }}
              onMouseEnter={e => !loading && (e.currentTarget.style.background = '#163d2e')}
              onMouseLeave={e => !loading && (e.currentTarget.style.background = '#1a4d3a')}
            >
              {loading ? 'Enregistrement...' : (isEdit ? 'Enregistrer les modifications' : 'Enregistrer le Client')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
