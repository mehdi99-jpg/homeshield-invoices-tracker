import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area } from 'recharts'
import { getStatistiques, getStatistiquesCharts } from '../api/statistiques'
import { KpiSkeleton, TableSkeleton } from '../components/ui/Skeleton'
import { formatMAD } from '../utils/formatters'
import { PERIODES } from '../utils/constants'
import { ChevronDown, Info } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Statistiques() {
  const [stats, setStats] = useState(null)
  const [charts, setCharts] = useState(null)
  const [loading, setLoading] = useState(true)
  const [periode, setPeriode] = useState('CE_MOIS')
  const [dateDebut, setDateDebut] = useState('')
  const [dateFin, setDateFin] = useState('')

  const fetchData = () => {
    setLoading(true)
    const params = { periode }
    if (periode === 'PERSONNALISE') {
      params.dateDebut = dateDebut
      params.dateFin = dateFin
    }
    Promise.all([getStatistiques(params), getStatistiquesCharts(params)])
      .then(([s, c]) => { setStats(s.data); setCharts(c.data) })
      .catch(() => toast.error('Erreur lors du chargement'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchData() }, [])

  const handleApply = () => fetchData()

  if (loading) return (
    <div style={{ background: '#f8f9fa', padding: '28px 32px', minHeight: '100vh' }}>
      <div className="space-y-6">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '14px' }}>
          {[1,2,3,4,5,6].map(i => <div key={i} style={{ height: '100px', background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb' }} className="animate-pulse" />)}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          {[1,2].map(i => <div key={i} style={{ height: '320px', background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb' }} className="animate-pulse" />)}
        </div>
      </div>
    </div>
  )

  const cardStyle = {
    background: 'white',
    borderRadius: '12px',
    border: '1px solid #e5e7eb',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    padding: '18px 20px',
    display: 'flex',
    flexDirection: 'column'
  };

  const labelStyle = {
    fontSize: '11px',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: '#9ca3af',
    marginBottom: '8px'
  };

  const valueStyle = {
    fontSize: '22px',
    fontWeight: 700,
    color: '#111827',
    margin: 0
  };

  return (
    <div style={{ background: '#f8f9fa', minHeight: 'calc(100vh - 64px)' }}>
      <div className="space-y-6 animate-fade-in w-full">
        
        {/* Fix 1 — Page header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#111827', margin: 0 }}>Statistiques</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ position: 'relative' }}>
              <select value={periode} onChange={e => setPeriode(e.target.value)}
                style={{
                  height: '38px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '0 32px 0 12px',
                  fontSize: '14px',
                  background: 'white',
                  appearance: 'none',
                  outline: 'none',
                  cursor: 'pointer',
                  minWidth: '130px'
                }}
              >
                {PERIODES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
              <ChevronDown size={14} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }} />
            </div>
            {periode === 'PERSONNALISE' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input type="date" value={dateDebut} onChange={e => setDateDebut(e.target.value)}
                  style={{ height: '38px', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '0 10px', fontSize: '13px', outline: 'none' }} />
                <input type="date" value={dateFin} onChange={e => setDateFin(e.target.value)}
                  style={{ height: '38px', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '0 10px', fontSize: '13px', outline: 'none' }} />
              </div>
            )}
            <button onClick={handleApply} 
              style={{ background: '#1a4d3a', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 16px', fontSize: '14px', fontWeight: 500, cursor: 'pointer', transition: 'background 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.background = '#163d2e'}
              onMouseLeave={e => e.currentTarget.style.background = '#1a4d3a'}
            >
              Appliquer
            </button>
          </div>
        </div>

        {/* Fix 2 — Stat cards row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '14px', marginBottom: '24px' }}>
          {/* CA Encaissé */}
          <div style={{ ...cardStyle, borderLeft: '4px solid #1a4d3a' }}>
            <span style={labelStyle}>CA Encaissé</span>
            <p style={valueStyle}>{formatMAD(stats?.caEncaisse)}</p>
          </div>
          {/* Factures */}
          <div style={{ ...cardStyle, borderLeft: '4px solid #3b82f6' }}>
            <span style={labelStyle}>Factures</span>
            <p style={valueStyle}>{stats?.nombreFactures || 0}</p>
          </div>
          {/* Impayées */}
          <div style={{ ...cardStyle, borderLeft: '4px solid #f59e0b' }}>
            <span style={labelStyle}>Impayées</span>
            <p style={valueStyle}>{stats?.nombreImpayees || 0}</p>
          </div>
          {/* En Retard */}
          <div style={{ ...cardStyle, borderLeft: '4px solid #ef4444' }}>
            <span style={labelStyle}>En Retard</span>
            <p style={valueStyle}>{stats?.nombreEnRetard || 0}</p>
          </div>
          {/* Recouvrement */}
          <div style={{ ...cardStyle, borderLeft: '4px solid #1a4d3a' }}>
            <span style={labelStyle}>Recouvrement</span>
            <p style={{ ...valueStyle, color: '#1a4d3a' }}>{stats?.tauxRecouvrement || 0}%</p>
            <div style={{ width: '100%', background: '#dcfce7', borderRadius: '3px', height: '6px', marginTop: '8px', overflow: 'hidden' }}>
              <div style={{ background: '#1a4d3a', height: '100%', width: `${Math.min(stats?.tauxRecouvrement || 0, 100)}%`, transition: 'width 0.5s ease-out' }} />
            </div>
          </div>
          {/* Panier Moyen */}
          <div style={{ ...cardStyle, borderLeft: '4px solid #8b5cf6' }}>
            <span style={labelStyle}>Panier Moyen</span>
            <p style={valueStyle}>{formatMAD(stats?.panierMoyen)}</p>
          </div>
        </div>

        {/* Fix 3 — Period info bar */}
        {stats?.periodeSummary && (
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '10px 16px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Info size={16} color="#1a4d3a" />
            <span style={{ fontSize: '13px', color: '#1a4d3a', fontWeight: 500 }}>
              Statistiques du {stats.periodeSummary.replace('Statistiques du ', '')}
            </span>
          </div>
        )}

        {/* Fix 4 — Chart cards (2-column grid) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          {/* Comparatif CA */}
          <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', padding: '20px 24px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#111827', margin: '0 0 16px 0' }}>Comparatif CA</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={charts?.comparatifCA || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f2f4f7" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#98A2B3' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#98A2B3' }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={(value) => [formatMAD(value), '']} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px' }} />
                <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }} />
                <Bar dataKey="thisYear" name="Cette année" fill="#1a4d3a" radius={[4, 4, 0, 0]} />
                <Bar dataKey="lastYear" name="Année précédente" fill="#d1d5db" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Top 5 Clients */}
          <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', padding: '20px 24px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#111827', margin: '0 0 16px 0' }}>Top 5 Clients</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={charts?.top5Clients || []} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f2f4f7" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#98A2B3' }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                <YAxis type="category" dataKey="client" tick={{ fontSize: 11, fill: '#6b7280' }} width={120} axisLine={false} tickLine={false} />
                <Tooltip formatter={(value) => [formatMAD(value), 'Total']} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px' }} />
                <Bar dataKey="total" fill="#1a4d3a" radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Status Breakdown */}
          <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', padding: '20px 24px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#111827', margin: '0 0 16px 0' }}>Répartition mensuelle des statuts</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={charts?.repartitionStatuts || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f2f4f7" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#98A2B3' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#98A2B3' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px' }} />
                <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '11px' }} />
                <Bar dataKey="Payée" stackId="a" fill="#16a34a" />
                <Bar dataKey="En retard" stackId="a" fill="#dc2626" />
                <Bar dataKey="Livrée" stackId="a" fill="#0891b2" />
                <Bar dataKey="Brouillon" stackId="a" fill="#6b7280" />
                <Bar dataKey="En attente" stackId="a" fill="#d97706" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Average Basket */}
          <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', padding: '20px 24px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#111827', margin: '0 0 16px 0' }}>Panier moyen par mois</h3>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={charts?.panierMoyenParMois || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f2f4f7" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#98A2B3' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#98A2B3' }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={(value) => [formatMAD(value), 'Panier moyen']} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px' }} />
                <Area type="monotone" dataKey="value" stroke="#1a4d3a" fill="#dcfce7" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
