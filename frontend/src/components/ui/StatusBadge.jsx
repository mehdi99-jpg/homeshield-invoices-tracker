import { PAYMENT_MODE_COLORS } from '../../utils/constants';

const STATUS_CONFIG = {
  // Invoice statuses
  PAYEE:       { label: 'Payée',       bg: '#DCFCE7', color: '#15803D', dot: '#16A34A' },
  LIVREE:      { label: 'Livrée',      bg: '#CFFAFE', color: '#0E7490', dot: '#0891B2' },
  EN_ATTENTE:  { label: 'En attente',  bg: '#FEF3C7', color: '#B45309', dot: '#D97706' },
  BROUILLON:   { label: 'Brouillon',   bg: '#F2F4F7', color: '#344054', dot: '#667085' },
  EN_RETARD:   { label: 'En retard',   bg: '#FEE2E2', color: '#B91C1C', dot: '#DC2626' },
  // BL statuses
  LIVRE:       { label: 'Livrée',      bg: '#CFFAFE', color: '#0E7490', dot: '#0891B2' },
  // Intervention statuses
  EFFECTUE:    { label: 'Effectué',    bg: '#DCFCE7', color: '#15803D', dot: '#16A34A' },
  PLANIFIE:    { label: 'Planifié',    bg: '#EFF6FF', color: '#1D4ED8', dot: '#3B82F6' },
  ANNULE:      { label: 'Annulé',      bg: '#FEE2E2', color: '#B91C1C', dot: '#DC2626' },
  // Client types
  RESIDENCE:   { label: 'Résidence',   bg: '#F0FDF4', color: '#166534', dot: '#16A34A' },
  HOTEL:       { label: 'Hôtel',       bg: '#EFF6FF', color: '#1D4ED8', dot: '#3B82F6' },
  CAFE:        { label: 'Café',        bg: '#FFFBEB', color: '#92400E', dot: '#D97706' },
  ENTREPRISE:  { label: 'Entreprise',  bg: '#F5F3FF', color: '#5B21B6', dot: '#7C3AED' },
  MAGASIN:     { label: 'Magasin',     bg: '#FFF0F9', color: '#9D174D', dot: '#DB2777' },
};

const StatusBadge = ({ statut, size = 'md' }) => {
  const key = statut?.toUpperCase().replace(/ /g, '_').replace(/É/g, 'E').replace(/È/g, 'E');
  const cfg = STATUS_CONFIG[key] || {
    label: statut,
    bg: '#F2F4F7',
    color: '#344054',
    dot: '#667085'
  };

  const padding = size === 'sm' ? '2px 7px' : '3px 10px';
  const fontSize = size === 'sm' ? '11px' : '12px';

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '5px',
      background: cfg.bg,
      color: cfg.color,
      padding,
      borderRadius: '9999px',
      fontSize,
      fontWeight: 600,
      whiteSpace: 'nowrap',
      userSelect: 'none'
    }}>
      <span style={{
        width: '5px', height: '5px',
        borderRadius: '50%',
        background: cfg.dot,
        flexShrink: 0
      }} />
      {cfg.label}
    </span>
  );
};

export const PaymentModeBadge = ({ mode, size = 'md' }) => {
  const label = mode || 'Non défini';
  const color = PAYMENT_MODE_COLORS[label] || PAYMENT_MODE_COLORS['Non défini'];

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      <div style={{ 
        width: size === 'sm' ? '8px' : '10px', 
        height: size === 'sm' ? '8px' : '10px', 
        borderRadius: '50%', 
        background: color, 
        flexShrink: 0 
      }} />
      <span style={{ fontSize: size === 'sm' ? '12px' : '13.5px', color: '#374151', fontWeight: 500 }}>{label}</span>
    </div>
  );
};

export default StatusBadge;
