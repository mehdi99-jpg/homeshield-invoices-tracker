import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const KpiCard = ({
  label,
  value,
  icon: Icon,
  iconColor = '#0D4F2F',
  iconBg = '#F0FDF4',
  valueColor = '#101828',
  trend = null,      // number like +12.5 or -3.2
  trendLabel = 'vs mois dernier'
}) => {
  const isPositive = trend > 0;
  const isNegative = trend < 0;

  return (
    <div style={{
      background: '#ffffff',
      border: '1px solid #EAECF0',
      borderRadius: '12px',
      padding: '20px 24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    }}>
      {/* Top row: label + icon */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <p style={{
          margin: 0,
          fontSize: '11px',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.07em',
          color: '#98A2B3'
        }}>
          {label}
        </p>
        {Icon && (
          <div style={{
            width: '32px', height: '32px',
            borderRadius: '8px',
            background: iconBg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0
          }}>
            <Icon size={15} color={iconColor} strokeWidth={2} />
          </div>
        )}
      </div>

      {/* Value */}
      <p style={{
        margin: 0,
        fontSize: '26px',
        fontWeight: 700,
        color: valueColor,
        letterSpacing: '-0.5px',
        lineHeight: 1.15
      }}>
        {value ?? '—'}
      </p>

      {/* Trend */}
      {trend !== null && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '3px',
            fontSize: '12px', fontWeight: 600,
            color: isPositive ? '#16A34A' : isNegative ? '#DC2626' : '#98A2B3'
          }}>
            {isPositive ? <TrendingUp size={13} /> : isNegative ? <TrendingDown size={13} /> : <Minus size={13} />}
            {isPositive ? '+' : ''}{trend?.toFixed(1)}%
          </span>
          <span style={{ fontSize: '11px', color: '#98A2B3' }}>{trendLabel}</span>
        </div>
      )}
    </div>
  );
};

export default KpiCard;
