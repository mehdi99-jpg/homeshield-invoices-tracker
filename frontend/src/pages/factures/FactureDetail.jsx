import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { Pencil, Printer, Trash2, Send, Truck, ArrowLeft, Check, Plus, Eye } from 'lucide-react'
import { getFacture, updateStatut, updateLivraisonStatut, envoyerFacture, deleteFacture, getBonLivraison, createIntervention } from '../../api/factures'
import { getIntervention, updateIntervention } from '../../api/auth'
import StatusStepper from '../../components/shared/StatusStepper'
import InvoiceDocument from '../../components/shared/InvoiceDocument'
import InterventionModal from '../../components/shared/InterventionModal'
import StatusBadge from '../../components/ui/StatusBadge'
import ConfirmModal from '../../components/ui/ConfirmModal'
import { KpiSkeleton } from '../../components/ui/Skeleton'
import { STATUS_LABELS, LIVRAISON_STATUS_LABELS } from '../../utils/constants'
import { formatDate } from '../../utils/formatters'
import toast from 'react-hot-toast'

export default function FactureDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [facture, setFacture] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showDelete, setShowDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showIntervention, setShowIntervention] = useState(false)
  const [editingIntervention, setEditingIntervention] = useState(null)
  const [savingIntervention, setSavingIntervention] = useState(false)

  const fetchFacture = () => {
    setLoading(true)
    getFacture(id).then(res => setFacture(res.data))
      .catch(() => toast.error('Erreur lors du chargement'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchFacture() }, [id])

  const handleStatutChange = async (e) => {
    try {
      await updateStatut(id, e.target.value)
      toast.success('Statut mis à jour')
      fetchFacture()
    } catch { toast.error('Erreur lors de la mise à jour') }
  }

  const handleLivraisonChange = async (e) => {
    try {
      await updateLivraisonStatut(id, e.target.value)
      toast.success('Statut livraison mis à jour')
      fetchFacture()
    } catch { toast.error('Erreur lors de la mise à jour') }
  }

  const handleEnvoyer = async () => {
    try {
      await envoyerFacture(id)
      toast.success('Facture envoyée avec succès')
    } catch { toast.error("Erreur lors de l'envoi") }
  }

  const handleVoirBL = async () => {
    try {
      const res = await getBonLivraison(id)
      navigate(`/bons-de-livraison/${res.data.bonLivraisonId}`)
    } catch { toast.error('Erreur lors de la récupération du BL') }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await deleteFacture(id)
      toast.success('Facture supprimée')
      navigate('/factures')
    } catch { toast.error('Erreur lors de la suppression') }
    finally { setDeleting(false) }
  }

  const handlePrint = () => window.print()

  const handleEditIntervention = async (intervention) => {
    try {
      const res = await getIntervention(intervention.id)
      setEditingIntervention(res.data)
      setShowIntervention(true)
    } catch { toast.error('Erreur lors du chargement') }
  }

  const handleSaveIntervention = async (data) => {
    setSavingIntervention(true)
    try {
      if (editingIntervention?.id) {
        await updateIntervention(editingIntervention.id, data)
      } else {
        await createIntervention(id, data)
      }
      toast.success('Intervention enregistrée')
      setShowIntervention(false)
      setEditingIntervention(null)
      fetchFacture()
    } catch { toast.error("Erreur lors de l'enregistrement") }
    finally { setSavingIntervention(false) }
  }

  if (loading) return (
    <div style={{ background: '#f8f9fa', padding: '20px 24px', minHeight: '100vh' }}>
      <KpiSkeleton count={4} />
    </div>
  )

  if (!facture) return <p className="text-center text-gray-500 py-12">Facture non trouvée</p>

  const ghostButtonStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    border: '1px solid #e5e7eb',
    background: 'white',
    color: '#374151',
    borderRadius: '8px',
    padding: '7px 12px',
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s'
  };

  const selectPillStyle = {
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '6px 12px',
    fontSize: '13px',
    background: 'white',
    outline: 'none',
    cursor: 'pointer'
  };

  return (
    <div style={{ background: '#f8f9fa', padding: '20px 24px', minHeight: '100vh' }}>
      <div className="animate-fade-in" style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        
        {/* Page header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} className="no-print">
          <div>
            <p style={{ fontSize: '12.5px', color: '#9ca3af', marginBottom: '2px' }}>
              <Link to="/factures" className="hover:text-[#1a4d3a] transition-colors">Facturation</Link> › {facture.numero}
            </p>
            <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#111827', margin: 0 }}>
              Facture {facture.numero}
            </h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <select value={facture.statut || ''} onChange={handleStatutChange} style={selectPillStyle}>
              {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <select value={facture.livraisonStatut || ''} onChange={handleLivraisonChange} style={selectPillStyle}>
              {Object.entries(LIVRAISON_STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <button onClick={handleVoirBL} style={ghostButtonStyle} onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'} onMouseLeave={e => e.currentTarget.style.background = 'white'}>
              <Truck size={14} /> Voir le BL
            </button>
            <button onClick={handleEnvoyer} 
              style={{ ...ghostButtonStyle, background: '#1a4d3a', color: 'white', border: 'none' }}
              onMouseEnter={e => e.currentTarget.style.background = '#163d2e'} onMouseLeave={e => e.currentTarget.style.background = '#1a4d3a'}
            >
              <Send size={14} /> Envoyer
            </button>
            <button onClick={() => navigate(`/factures/${id}/modifier`)} style={ghostButtonStyle} onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'} onMouseLeave={e => e.currentTarget.style.background = 'white'}>
              <Pencil size={14} /> Modifier
            </button>
            <button onClick={handlePrint} style={ghostButtonStyle} onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'} onMouseLeave={e => e.currentTarget.style.background = 'white'}>
              <Printer size={14} /> Imprimer
            </button>
            <button onClick={() => setShowDelete(true)} 
              style={{ ...ghostButtonStyle, background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca' }}
              onMouseEnter={e => e.currentTarget.style.background = '#fee2e2'} onMouseLeave={e => e.currentTarget.style.background = '#fef2f2'}
            >
              <Trash2 size={14} /> Supprimer
            </button>
          </div>
        </div>

        {/* Fix: Status Stepper (Full width, contained labels) */}
        <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '20px 32px 24px 32px', width: '100%', boxSizing: 'border-box' }} className="no-print">
          <StatusStepper currentStatus={facture.statut} />
        </div>

        {/* Invoice Document */}
        <div style={{ width: '100%' }}>
          <InvoiceDocument facture={facture} />
        </div>

        {/* Fix 3: Suivi des Interventions card (Reduced padding, margin-top) */}
        <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '16px 20px', width: '100%', boxSizing: 'border-box', marginTop: '4px' }} className="no-print">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#111827', margin: 0 }}>Suivi des Interventions</h3>
            <button onClick={() => { setEditingIntervention(null); setShowIntervention(true) }}
              style={{ background: '#1a4d3a', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 14px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: 'background 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.background = '#163d2e'} onMouseLeave={e => e.currentTarget.style.background = '#1a4d3a'}
            >
              <Plus size={14} /> Nouveau Passage
            </button>
          </div>

          <div style={{ width: '100%', overflowX: 'auto' }}>
            <table className="w-full border-collapse">
              <thead>
                <tr style={{ background: '#f8f9fa' }}>
                  {['#', 'Date & Heure', 'Technicien', 'Statut', 'Zones', 'Notes', ''].map((h, i) => (
                    <th key={i} style={{ padding: '8px 16px', textAlign: i === 3 || i === 6 ? 'center' : 'left', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', color: '#9ca3af', borderBottom: '1px solid #f3f4f6' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(facture.interventions || []).map(i => (
                  <tr
                    key={i.id}
                    style={{ borderBottom: '1px solid #f3f4f6', cursor: 'pointer', transition: 'background 0.1s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f0fdf4'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    onClick={() => handleEditIntervention(i)}
                  >
                    <td style={{ padding: '8px 16px', fontSize: '13px', fontWeight: 500, color: '#111827' }}>{i.numeroPassage}</td>
                    <td style={{ padding: '8px 16px', fontSize: '13px', color: '#6b7280' }}>{formatDate(i.datePassage)} {i.heure || ''}</td>
                    <td style={{ padding: '8px 16px', fontSize: '13px', color: '#374151' }}>{i.technicien || '-'}</td>
                    <td style={{ padding: '8px 16px', textAlign: 'center' }}><StatusBadge statut={i.statut} size="sm" /></td>
                    <td style={{ padding: '8px 16px', fontSize: '13px', color: '#6b7280' }}>{i.zonesTraitees || '-'}</td>
                    <td style={{ padding: '8px 16px', fontSize: '13px', color: '#6b7280', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{i.notes || '-'}</td>
                    <td style={{ padding: '8px 16px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <button
                          onClick={e => { e.stopPropagation(); handleEditIntervention(i); }}
                          style={{ padding: '5px', borderRadius: '6px', border: 'none', background: 'transparent', cursor: 'pointer', color: '#98A2B3', transition: 'all 0.1s' }}
                          onMouseEnter={e => { e.currentTarget.style.background = '#eff6ff'; e.currentTarget.style.color = '#2563eb'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#98A2B3'; }}
                        >
                          <Pencil size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {(!facture.interventions || facture.interventions.length === 0) && (
                  <tr>
                    <td colSpan={7} style={{ padding: '20px 0', textAlign: 'center' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                        <Eye size={20} style={{ color: '#e5e7eb' }} />
                        <span style={{ color: '#9ca3af', fontSize: '13.5px' }}>Aucune intervention</span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modals */}
        <ConfirmModal isOpen={showDelete} onClose={() => setShowDelete(false)} onConfirm={handleDelete}
          title="Supprimer la facture" message="Êtes-vous sûr de vouloir supprimer cette facture ? Cette action est irréversible." loading={deleting} />
        
        {showIntervention && (
          <InterventionModal
            isOpen={showIntervention}
            onClose={() => { setShowIntervention(false); setEditingIntervention(null) }}
            onSave={handleSaveIntervention}
            intervention={editingIntervention}
            loading={savingIntervention}
          />
        )}
      </div>
    </div>
  )
}
