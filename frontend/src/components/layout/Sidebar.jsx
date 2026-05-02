import { NavLink, useLocation } from 'react-router-dom';
import logoImage from '../../assets/logo.png';
import {
  LayoutDashboard, Users, FileText,
  Truck, BarChart2, Download
} from 'lucide-react';

const navItems = [
  { path: '/dashboard',         label: 'Tableau de bord',    icon: LayoutDashboard },
  { path: '/clients',           label: 'Gestion Clients',    icon: Users },
  { path: '/factures',          label: 'Facturation / DV',   icon: FileText },
  { path: '/bons-de-livraison', label: 'Bons de Livraison',  icon: Truck },
  { path: '/statistiques',      label: 'Statistiques',       icon: BarChart2 },
  { path: '/exports',           label: 'Exports / Rapports', icon: Download },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="no-print" style={{
      width: '220px', minWidth: '220px',
      height: '100vh', background: '#fff',
      borderRight: '1px solid #EAECF0',
      display: 'flex', flexDirection: 'column',
      position: 'fixed', top: 0, left: 0, zIndex: 50
    }}>
      {/* Logo Section */}
      <div style={{
        height: '76px',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        padding: '0 12px',
        borderBottom: '1px solid #EAECF0',
        userSelect: 'none',
        cursor: 'default',
        overflow: 'hidden'
      }}>
        <img
          src={logoImage}
          alt="HomeShield Logo"
          style={{ width: '56px', height: '56px', borderRadius: '8px', objectFit: 'contain', marginLeft: '-4px' }}
        />
        <div className="flex items-center text-[15px] tracking-tight" style={{ marginLeft: '-4px' }}>
          <span className="font-bold text-[#101828]">HomeShield</span>
          <span className="font-normal text-[#6b7280]">Maroc</span>
        </div>
      </div>

      {/* Nav links */}
      <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {navItems.map(({ path, label, icon: Icon }) => {
          const isActive = location.pathname === path ||
            location.pathname.startsWith(path + '/');

          return (
            <NavLink
              key={path}
              to={path}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '9px 12px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '13.5px',
                fontWeight: isActive ? 600 : 400,
                color: isActive ? '#0D4F2F' : '#667085',
                background: isActive ? '#F0FDF4' : 'transparent',
                borderLeft: isActive
                  ? '3px solid #0D4F2F'
                  : '3px solid transparent',
                transition: 'all 0.12s ease',
                position: 'relative',
              }}
              onMouseEnter={e => {
                if (!isActive) {
                  e.currentTarget.style.background = '#F9FAFB';
                  e.currentTarget.style.color = '#344054';
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#667085';
                }
              }}
            >
              <Icon
                size={15}
                strokeWidth={isActive ? 2.5 : 1.75}
                color={isActive ? '#0D4F2F' : '#98A2B3'}
              />
              <span style={{ flex: 1 }}>{label}</span>
              {/* Active indicator dot */}
              {isActive && (
                <div style={{
                  width: '6px', height: '6px',
                  borderRadius: '50%',
                  background: '#0D4F2F',
                  flexShrink: 0
                }} />
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User info at bottom */}
      <div style={{ padding: '16px 24px', borderTop: '1px solid #F2F4F7',
        display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ width: '34px', height: '34px', borderRadius: '50%',
          background: '#0D4F2F', display: 'flex', alignItems: 'center',
          justifyContent: 'center', flexShrink: 0 }}>
          <span style={{ color: '#fff', fontSize: '12px', fontWeight: 700 }}>AD</span>
        </div>
        <div>
          <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#101828' }}>Administrateur</p>
          <p style={{ margin: 0, fontSize: '11px', color: '#98A2B3' }}>HomeShield Maroc</p>
        </div>
      </div>
    </aside>
  )
}
