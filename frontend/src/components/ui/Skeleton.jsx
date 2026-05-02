// Skeleton.jsx
export const Skeleton = ({ width = '100%', height = '16px', borderRadius = '6px' }) => (
  <div style={{
    width, height, borderRadius,
    background: 'linear-gradient(90deg, #F2F4F7 25%, #E9EBF0 50%, #F2F4F7 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.4s infinite',
  }} />
);

// KPI skeleton
export const KpiCardSkeleton = () => (
  <div style={{ background: '#fff', border: '1px solid #EAECF0',
    borderRadius: '12px', padding: '20px 24px' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
      <Skeleton width="120px" height="11px" />
      <Skeleton width="32px" height="32px" borderRadius="8px" />
    </div>
    <Skeleton width="60%" height="28px" borderRadius="6px" />
    <div style={{ marginTop: '12px' }}>
      <Skeleton width="80px" height="11px" />
    </div>
  </div>
);

// Table row skeleton
export const TableRowSkeleton = () => (
  <tr>
    {[140, 180, 90, 110, 70, 40].map((w, i) => (
      <td key={i} style={{ padding: '14px 20px' }}>
        <Skeleton width={`${w}px`} height="13px" />
      </td>
    ))}
  </tr>
);

export const TableSkeleton = ({ rows = 5 }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
    <table className="w-full">
      <tbody>
        {Array.from({ length: rows }).map((_, i) => <TableRowSkeleton key={i} />)}
      </tbody>
    </table>
  </div>
);

export const KpiSkeleton = ({ count = 3 }) => (
  <div style={{ display: 'grid', gridTemplateColumns: `repeat(${count}, 1fr)`, gap: '16px' }}>
    {Array.from({ length: count }).map((_, i) => <KpiCardSkeleton key={i} />)}
  </div>
);

export default Skeleton;
