import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import {
  TrendingUp, BarChart2, Award,
  FileText, AlertCircle, DollarSign, Eye,
  AlertTriangle, ArrowRight, X
} from 'lucide-react';
import { getDashboardStats, getChartData, getPaymentModes } from '../api/dashboard'
import { getRecentFactures } from '../api/factures'
import { getOverdueNotifications } from '../api/auth'
import { formatMAD, formatDate } from '../utils/formatters'
import { PAYMENT_MODE_COLORS } from '../utils/constants'
import KpiCard from '../components/ui/KpiCard'
import StatusBadge from '../components/ui/StatusBadge'
import { KpiCardSkeleton } from '../components/ui/Skeleton'

// Reusable custom tooltip for bar chart
const BarTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#101828',
      border: 'none',
      borderRadius: '8px',
      padding: '10px 14px',
      boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
      minWidth: '130px',
    }}>
      <p style={{
        margin: '0 0 5px 0',
        fontSize: '11px',
        fontWeight: 600,
        color: '#98A2B3',
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
      }}>
        {label}
      </p>
      <p style={{
        margin: 0,
        fontSize: '14px',
        fontWeight: 700,
        color: '#ffffff',
        letterSpacing: '-0.2px',
      }}>
        {Number(payload[0].value).toLocaleString('fr-FR', {
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        })} MAD
      </p>
    </div>
  );
};

// Reusable custom tooltip for donut chart
const DonutTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  return (
    <div style={{
      background: '#101828',
      border: 'none',
      borderRadius: '8px',
      padding: '10px 14px',
      boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
      minWidth: '130px',
    }}>
      <p style={{
        margin: '0 0 5px 0',
        fontSize: '11px',
        fontWeight: 600,
        color: '#98A2B3',
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
      }}>
        {item.name}
      </p>
      <p style={{
        margin: 0,
        fontSize: '14px',
        fontWeight: 700,
        color: '#ffffff',
        letterSpacing: '-0.2px',
      }}>
        {Number(item.value).toLocaleString('fr-FR', {
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        })} MAD
      </p>
      <p style={{
        margin: '4px 0 0 0',
        fontSize: '11px',
        color: '#667085',
      }}>
        {item.payload?.percent
          ? `${(item.payload.percent * 100).toFixed(1)}%`
          : ''}
      </p>
    </div>
  );
};

export default function Dashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState({})
  const [chartData, setChartData] = useState([])
  const [paymentModes, setPaymentModes] = useState([])
  const [recentInvoices, setRecentInvoices] = useState([])
  const [overdueCount, setOverdueCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [bannerDismissed, setBannerDismissed] = useState(false)

  const currentYear = new Date().getFullYear();
  const startYear = 2024;
  const years = Array.from(
    { length: currentYear - startYear + 1 },
    (_, i) => currentYear - i
  );
  const [selectedYear, setSelectedYear] = useState(currentYear);

  useEffect(() => {
    Promise.all([
      getDashboardStats(),
      getPaymentModes(),
      getRecentFactures(5),
      getOverdueNotifications(),
    ]).then(([s, p, f, n]) => {
      setStats(s.data || {})
      setPaymentModes(p.data || [])
      setRecentInvoices(f.data || [])
      setOverdueCount(s.data?.overdueCount || n.data?.length || 0)
    }).catch(console.error).finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    getChartData(selectedYear).then(res => setChartData(res.data || [])).catch(console.error)
  }, [selectedYear])

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          {[1, 2, 3].map(i => <KpiCardSkeleton key={i} />)}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {[1, 2].map(i => <KpiCardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* 1. ALERT BANNER — show only if overdueCount > 0 and not dismissed */}
      {overdueCount > 0 && !bannerDismissed && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          padding: '14px 18px',
          background: '#ffffff',
          border: '1px solid #FECACA',
          borderRadius: '12px',
          marginBottom: '24px',
        }}>

          {/* Left — icon + message */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Icon circle */}
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: '#FEE2E2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <AlertTriangle size={16} strokeWidth={2} color="#DC2626" />
            </div>

            {/* Text */}
            <div>
              <p style={{
                margin: 0,
                fontSize: '13.5px',
                fontWeight: 600,
                color: '#101828',
              }}>
                {overdueCount} facture{overdueCount > 1 ? 's' : ''} en retard de paiement
              </p>
              <p style={{
                margin: '2px 0 0',
                fontSize: '12px',
                color: '#98A2B3',
              }}>
                Ces factures nécessitent votre attention immédiate
              </p>
            </div>
          </div>

          {/* Right — action + dismiss */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
            <button
              onClick={() => navigate('/factures?statut=EN_RETARD')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 14px',
                background: '#DC2626',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '12.5px',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'Inter, sans-serif',
                transition: 'background 0.12s ease',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#B91C1C'}
              onMouseLeave={e => e.currentTarget.style.background = '#DC2626'}
            >
              Gérer
              <ArrowRight size={13} strokeWidth={2} />
            </button>

            {/* Dismiss X button */}
            <button
              onClick={() => setBannerDismissed(true)}
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '6px',
                border: '1px solid #EAECF0',
                background: 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#98A2B3',
                transition: 'background 0.12s, color 0.12s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = '#F2F4F7';
                e.currentTarget.style.color = '#475467';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = '#98A2B3';
              }}
            >
              <X size={14} strokeWidth={2} />
            </button>
          </div>
        </div>
      )}

      {/* 2. PAGE TITLE */}
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#111827', margin: 0 }}>
          Tableau de bord
        </h1>
        <p style={{ color: '#6b7280', fontSize: '14px', marginTop: '4px' }}>
          Bienvenue sur votre espace HomeShield. Voici le récapitulatif de votre activité.
        </p>
      </div>

      {/* 3. KPI ROW 1 — 3 equal columns */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        <KpiCard
          label="Chiffre d'affaires (mois)"
          value={formatMAD(stats.caMonth)}
          icon={TrendingUp}
          iconColor="#0D4F2F" iconBg="#F0FDF4"
          trend={stats.caMonthTrend}
        />
        <KpiCard
          label="Chiffre d'affaires (année)"
          value={formatMAD(stats.caYear)}
          icon={BarChart2}
          iconColor="#1D4ED8" iconBg="#EFF6FF"
          trend={stats.caYearTrend}
        />
        <KpiCard
          label="Meilleur client (mois)"
          value={stats.bestClient}
          icon={Award}
          iconColor="#B45309" iconBg="#FFFBEB"
        />
      </div>

      {/* 4. KPI ROW 2 — EXACTLY 2 equal columns, NO exceptions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <KpiCard
          label="Factures ce mois"
          value={stats.invoicesThisMonth}
          icon={FileText}
          iconColor="#0891B2" iconBg="#ECFEFF"
          trend={stats.invoicesTrend}
        />
        <KpiCard
          label="Factures impayées"
          value={stats.unpaidInvoices}
          icon={AlertCircle}
          iconColor="#DC2626" iconBg="#FEF2F2"
          valueColor="#DC2626"
        />
      </div>

      {/* 5. CHARTS ROW */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>

        {/* Bar Chart */}
        <div style={{ background: '#fff', border: '1px solid #EAECF0',
          borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column', minHeight: '320px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#101828' }}>
                Évolution du chiffre d'affaires
              </p>
              <p style={{ margin: '3px 0 0', fontSize: '11px', color: '#98A2B3' }}>
                En MAD — année en cours
              </p>
            </div>
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <select
                value={selectedYear}
                onChange={e => setSelectedYear(Number(e.target.value))}
                style={{
                  appearance: 'none',
                  WebkitAppearance: 'none',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  color: '#344054',
                  background: '#ffffff',
                  border: '1px solid #EAECF0',
                  borderRadius: '8px',
                  padding: '6px 32px 6px 12px',
                  cursor: 'pointer',
                  outline: 'none',
                  fontFamily: 'Inter, sans-serif',
                  transition: 'border-color 0.12s, box-shadow 0.12s',
                }}
                onFocus={e => {
                  e.target.style.borderColor = '#0D4F2F';
                  e.target.style.boxShadow = '0 0 0 3px rgba(13,79,47,0.08)';
                }}
                onBlur={e => {
                  e.target.style.borderColor = '#EAECF0';
                  e.target.style.boxShadow = 'none';
                }}
              >
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>

              {/* Custom chevron icon replacing native arrow */}
              <div style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                pointerEvents: 'none',
              }}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M3 4.5L6 7.5L9 4.5"
                    stroke="#667085" strokeWidth="1.5"
                    strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          </div>

          <div style={{ flex: 1, minHeight: 0 }}>
            <ResponsiveContainer width="100%" height={230}>
              <BarChart
                data={chartData}
                barSize={30}
                margin={{ top: 4, right: 4, left: -8, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="2 4"
                  stroke="#F2F4F7"
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: '#98A2B3' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: '#98A2B3' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={v =>
                    v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v
                  }
                />
                <Tooltip
                  content={<BarTooltip />}
                  cursor={{ fill: 'rgba(13,79,47,0.04)', radius: 6 }}
                />
                <Bar dataKey="amount" fill="#0D4F2F" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut Chart */}
        <div style={{
          background: '#fff', border: '1px solid #EAECF0',
          borderRadius: '12px', padding: '24px',
          display: 'flex', flexDirection: 'column',
          minHeight: '320px'
        }}>
          <div style={{ marginBottom: '16px' }}>
            <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#101828' }}>
              Mode de règlement
            </p>
            <p style={{ margin: '3px 0 0', fontSize: '11px', color: '#98A2B3' }}>
              Répartition des paiements reçus
            </p>
          </div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={paymentModes} cx="50%" cy="50%"
                  innerRadius={52} outerRadius={80}
                  dataKey="count" nameKey="mode" paddingAngle={3} startAngle={90} endAngle={-270}>
                  {paymentModes.map((entry, index) => {
                    const modeLabel = entry.mode || 'Non défini';
                    const color = PAYMENT_MODE_COLORS[modeLabel] || PAYMENT_MODE_COLORS['Non défini'];
                    return <Cell key={`cell-${index}`} fill={color} />;
                  })}
                </Pie>
                <Tooltip content={<DonutTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Legend with counts */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0', marginTop: '12px' }}>
            {[
              { label: 'Chèque', key: 'Chèque' },
              { label: 'Virement', key: 'Virement' },
              { label: 'Espèces', key: 'Espèces' },
              { label: 'Carte Bancaire', key: 'Carte Bancaire' },
              { label: 'Non défini', key: 'Non défini' },
            ].map(({ label, key }) => {
              const dataItem = paymentModes.find(m => (m.mode || 'Non défini') === key);
              if (!dataItem && key !== 'Non défini') return null; // Show even if 0 only for "Non défini" or if data exists
              const count = dataItem?.count ?? 0;
              const color = PAYMENT_MODE_COLORS[key];
              
              return (
                <div key={label} style={{ 
                  display: 'flex', justifyContent: 'space-between', 
                  alignItems: 'center', padding: '6px 0', 
                  borderBottom: '1px solid #f3f4f6' 
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%',
                      background: color, flexShrink: 0 }} />
                    <span style={{ fontSize: '13px', color: '#374151' }}>{label}</span>
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#101828' }}>
                    {count.toLocaleString('fr-FR')}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 6. RECENT INVOICES TABLE */}
      <div style={{ background: '#fff', borderRadius: '12px',
        border: '1px solid #e5e7eb', padding: '0 0 24px 0', overflow: 'hidden' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '18px 24px 14px',
          borderBottom: '1px solid #F2F4F7',
        }}>
          <div>
            <p style={{
              margin: 0,
              fontSize: '15px',
              fontWeight: 700,
              color: '#101828',
            }}>
              Dernières Factures
            </p>
            <p style={{
              margin: '2px 0 0',
              fontSize: '12px',
              color: '#98A2B3',
            }}>
              Les 5 factures les plus récentes
            </p>
          </div>

          <button
            onClick={() => navigate('/factures')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 14px',
              background: 'transparent',
              border: '1px solid #EAECF0',
              borderRadius: '8px',
              fontSize: '12.5px',
              fontWeight: 600,
              color: '#344054',
              cursor: 'pointer',
              fontFamily: 'Inter, sans-serif',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = '#0D4F2F';
              e.currentTarget.style.color = '#ffffff';
              e.currentTarget.style.borderColor = '#0D4F2F';
              e.currentTarget.querySelector('.arrow-icon').style.transform = 'translateX(3px)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = '#344054';
              e.currentTarget.style.borderColor = '#EAECF0';
              e.currentTarget.querySelector('.arrow-icon').style.transform = 'translateX(0)';
            }}
          >
            Voir tout
            <span
              className="arrow-icon"
              style={{
                display: 'inline-flex',
                transition: 'transform 0.15s ease',
              }}
            >
              <ArrowRight size={13} strokeWidth={2.5} />
            </span>
          </button>
        </div>
        <div style={{ padding: '0 24px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '16px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
              {['N° Facture','Client','Date','Montant TTC','Statut','Actions'].map((col, i) => (
                <th key={col} style={{ padding: '10px 12px', textAlign: i === 5 ? 'center' : i === 3 ? 'right' : 'left',
                  fontSize: '11px', fontWeight: 600, color: '#9ca3af',
                  textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {recentInvoices.map((inv, index) => (
              <tr key={inv.id} style={{ 
                  background: index % 2 === 0 ? '#fafafa' : '#fff',
                  borderBottom: '1px solid #f3f4f6' 
                }}>
                <td style={{ padding: '12px', fontWeight: 700, color: '#111827', fontSize: '13px' }}>
                  {inv.numero}
                </td>
                <td style={{ padding: '12px', color: '#374151', fontSize: '14px' }}>
                  {inv.client}
                </td>
                <td style={{ padding: '12px', color: '#6b7280', fontSize: '14px' }}>
                  {formatDate(inv.date)}
                </td>
                <td style={{ padding: '12px', fontWeight: 600, color: '#111827', fontSize: '14px', textAlign: 'right' }}>
                  {formatMAD(inv.montantTTC)}
                </td>
                <td style={{ padding: '12px' }}>
                  <StatusBadge statut={inv.statut} />
                </td>
                <td style={{ padding: '12px', textAlign: 'center' }}>
                  <button onClick={() => navigate(`/factures/${inv.id}`)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                    onMouseEnter={e => e.currentTarget.querySelector('svg').style.color = '#1B5E3B'}
                    onMouseLeave={e => e.currentTarget.querySelector('svg').style.color = '#9ca3af'}>
                    <Eye size={16} color="#9ca3af" style={{ transition: 'color 0.2s' }} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      </div>

    </div>
  )
}
