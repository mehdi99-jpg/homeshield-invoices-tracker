import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Bell, AlertTriangle, Clock, CheckCheck, ArrowRight, X } from 'lucide-react';
import { getOverdueNotifications, markAllRead } from '../../api/auth'
import { getFactures } from '../../api/factures'

export default function Header() {
  const navigate = useNavigate()
  const [overdueNotifications, setOverdueNotifications] = useState([])
  const [upcomingNotifications, setUpcomingNotifications] = useState([])
  const [overdueCount, setOverdueCount] = useState(0)
  const [notifOpen, setNotifOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const notifRef = useRef(null)

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/factures?search=${encodeURIComponent(searchQuery)}`)
    }
  };

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const fetchNotifications = async () => {
    try {
      const res = await getOverdueNotifications()
      setOverdueNotifications(res.data || [])
      setOverdueCount((res.data || []).length)
    } catch { 
      setOverdueNotifications([]) 
      setOverdueCount(0)
    }

    try {
      const res = await getFactures({ statut: 'EN_ATTENTE' })
      const factures = res.data || []
      const today = new Date();
      const upcoming = factures.filter(f => {
        if (!f.validite) return false;
        const due = new Date(f.validite);
        const daysLeft = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
        return daysLeft >= 0 && daysLeft <= 7;
      }).map(f => ({
        id: f.id,
        numero: f.numero,
        client: f.client,
        joursRestants: Math.ceil((new Date(f.validite) - today) / (1000 * 60 * 60 * 24))
      }));
      setUpcomingNotifications(upcoming);
    } catch {
      setUpcomingNotifications([])
    }
  }

  const markAllAsRead = async () => {
    try {
      await markAllRead();
    } catch (e) {
      // fail silently
    } finally {
      setOverdueCount(0);
      setOverdueNotifications([]);
      // keep upcomingNotifications visible
    }
  };

  return (
    <header className="no-print" style={{
      height: '64px',
      minHeight: '64px',
      background: '#ffffff',
      borderBottom: '1px solid #EAECF0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      position: 'sticky',
      top: 0,
      zIndex: 40,
    }}>

      {/* Left — Search */}
      <div style={{
        position: 'relative',
        width: '380px',
        display: 'flex',
        alignItems: 'center',
        gap: '6px'
      }}>
        {/* Input wrapper */}
        <div style={{ position: 'relative', flex: 1 }}>
          <Search
            size={14}
            strokeWidth={1.75}
            color="#98A2B3"
            style={{
              position: 'absolute', left: '12px',
              top: '50%', transform: 'translateY(-50%)',
              pointerEvents: 'none'
            }}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="Rechercher client, facture, BL..."
            style={{
              width: '100%',
              padding: '8px 12px 8px 34px',
              border: '1px solid #EAECF0',
              borderRadius: '8px',
              fontSize: '13px',
              color: '#101828',
              background: '#F9FAFB',
              outline: 'none',
              boxSizing: 'border-box',
              fontFamily: 'Inter, sans-serif',
            }}
            onFocus={e => {
              e.target.style.borderColor = '#0D4F2F';
              e.target.style.background = '#ffffff';
              e.target.style.boxShadow = '0 0 0 3px rgba(13,79,47,0.08)';
            }}
            onBlur={e => {
              e.target.style.borderColor = '#EAECF0';
              e.target.style.background = '#F9FAFB';
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>

        {/* Search button */}
        <button
          onClick={handleSearch}
          style={{
            height: '34px',
            padding: '0 14px',
            background: '#0D4F2F',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '12.5px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            whiteSpace: 'nowrap',
            fontFamily: 'Inter, sans-serif',
            flexShrink: 0,
            transition: 'background 0.12s ease',
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#154d30'}
          onMouseLeave={e => e.currentTarget.style.background = '#0D4F2F'}
          onMouseDown={e => e.currentTarget.style.background = '#0a3d24'}
          onMouseUp={e => e.currentTarget.style.background = '#154d30'}
        >
          <Search size={13} strokeWidth={2} color="#ffffff" />
          Rechercher
        </button>
      </div>

      {/* Right — Bell + Divider + Date */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>

        {/* Bell button */}
        <div ref={notifRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              border: overdueCount > 0 ? '1px solid #FECACA' : '1px solid #EAECF0',
              background: overdueCount > 0 ? '#FEF2F2' : '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              outline: 'none',
              transition: 'background 0.15s, border-color 0.15s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = overdueCount > 0 ? '#FEE2E2' : '#F9FAFB';
              e.currentTarget.style.borderColor = overdueCount > 0 ? '#FCA5A5' : '#D0D5DD';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = overdueCount > 0 ? '#FEF2F2' : '#ffffff';
              e.currentTarget.style.borderColor = overdueCount > 0 ? '#FECACA' : '#EAECF0';
            }}
          >
            <Bell
              size={16}
              strokeWidth={1.75}
              color={overdueCount > 0 ? '#DC2626' : '#475467'}
              className={overdueCount > 0 ? 'bell-ringing' : ''}
            />
          </button>

          {overdueCount > 0 && (
            <span
              className="badge-pulse"
              style={{
                position: 'absolute',
                top: '-5px',
                right: '-5px',
                minWidth: '17px',
                height: '17px',
                background: '#DC2626',
                color: '#ffffff',
                fontSize: '9px',
                fontWeight: 700,
                borderRadius: '9999px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0 4px',
                border: '2px solid #ffffff',
                lineHeight: 1,
                pointerEvents: 'none',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              {overdueCount > 99 ? '99+' : overdueCount}
            </span>
          )}

          {notifOpen && (
            <>
              {/* Backdrop to close on outside click */}
              <div
                onClick={() => setNotifOpen(false)}
                style={{
                  position: 'fixed', inset: 0, zIndex: 48,
                }}
              />

              {/* Dropdown panel */}
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 10px)',
                right: 0,
                width: '360px',
                background: '#ffffff',
                border: '1px solid #EAECF0',
                borderRadius: '14px',
                boxShadow: '0 8px 32px rgba(16,24,40,0.12)',
                zIndex: 49,
                overflow: 'hidden',
              }}>

                {/* ── HEADER ── */}
                <div style={{
                  padding: '14px 16px',
                  borderBottom: '1px solid #F2F4F7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Bell size={15} strokeWidth={2} color="#101828" />
                    <span style={{ fontSize: '14px', fontWeight: 700, color: '#101828' }}>
                      Notifications
                    </span>
                    {overdueCount > 0 && (
                      <span style={{
                        background: '#FEE2E2', color: '#DC2626',
                        fontSize: '10px', fontWeight: 700,
                        padding: '2px 7px', borderRadius: '9999px',
                      }}>
                        {overdueCount}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => setNotifOpen(false)}
                    style={{
                      width: '26px', height: '26px', border: '1px solid #EAECF0',
                      borderRadius: '6px', background: 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', color: '#98A2B3',
                      transition: 'background 0.1s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <X size={13} strokeWidth={2} />
                  </button>
                </div>

                {/* ── SCROLLABLE SECTION ── */}
                <div style={{ maxHeight: '420px', overflowY: 'auto' }}>
                  {/* ── OVERDUE SECTION — Red theme ── */}
                  {overdueNotifications?.length > 0 && (
                    <div>
                      <div style={{
                        padding: '10px 16px 6px',
                        display: 'flex', alignItems: 'center', gap: '6px',
                      }}>
                        <AlertTriangle size={11} strokeWidth={2.5} color="#DC2626" />
                        <span style={{
                          fontSize: '10px', fontWeight: 700, color: '#DC2626',
                          textTransform: 'uppercase', letterSpacing: '0.07em',
                        }}>
                          En retard de paiement
                        </span>
                      </div>

                      {overdueNotifications.map((notif, i) => (
                        <div
                          key={notif.id}
                          onClick={() => { navigate(`/factures/${notif.id}`); setNotifOpen(false); }}
                          style={{
                            padding: '10px 16px',
                            display: 'flex', alignItems: 'center', gap: '12px',
                            cursor: 'pointer',
                            borderBottom: i < overdueNotifications.length - 1
                              ? '1px solid #FEF2F2' : 'none',
                            transition: 'background 0.1s',
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = '#FFF5F5'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          {/* Red dot indicator */}
                          <div style={{
                            width: '32px', height: '32px', borderRadius: '50%',
                            background: '#FEE2E2', flexShrink: 0,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            <AlertTriangle size={14} strokeWidth={2} color="#DC2626" />
                          </div>

                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{
                              margin: 0, fontSize: '13px', fontWeight: 700,
                              color: '#101828', fontFamily: 'monospace',
                            }}>
                              {notif.numero}
                            </p>
                            <p style={{
                              margin: '1px 0 0', fontSize: '11.5px', color: '#667085',
                              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                            }}>
                              {notif.client}
                            </p>
                          </div>

                          {/* Days late badge */}
                          <span style={{
                            background: '#FEE2E2', color: '#B91C1C',
                            fontSize: '10px', fontWeight: 700,
                            padding: '3px 8px', borderRadius: '9999px',
                            whiteSpace: 'nowrap', flexShrink: 0,
                          }}>
                            {notif.joursRetard}j retard
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* ── DIVIDER ── */}
                  {upcomingNotifications?.length > 0 && overdueNotifications?.length > 0 && (
                    <div style={{ height: '1px', background: '#F2F4F7', margin: '0' }} />
                  )}

                  {/* ── UPCOMING SECTION — Yellow theme ── */}
                  {upcomingNotifications?.length > 0 && (
                    <div>
                      <div style={{
                        padding: '10px 16px 6px',
                        display: 'flex', alignItems: 'center', gap: '6px',
                      }}>
                        <Clock size={11} strokeWidth={2.5} color="#D97706" />
                        <span style={{
                          fontSize: '10px', fontWeight: 700, color: '#D97706',
                          textTransform: 'uppercase', letterSpacing: '0.07em',
                        }}>
                          Échéance proche
                        </span>
                      </div>

                      {upcomingNotifications.map((notif, i) => (
                        <div
                          key={notif.id}
                          onClick={() => { navigate(`/factures/${notif.id}`); setNotifOpen(false); }}
                          style={{
                            padding: '10px 16px',
                            display: 'flex', alignItems: 'center', gap: '12px',
                            cursor: 'pointer',
                            borderBottom: i < upcomingNotifications.length - 1
                              ? '1px solid #FFFBEB' : 'none',
                            transition: 'background 0.1s',
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = '#FFFBEB'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          {/* Yellow dot indicator */}
                          <div style={{
                            width: '32px', height: '32px', borderRadius: '50%',
                            background: '#FEF3C7', flexShrink: 0,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            <Clock size={14} strokeWidth={2} color="#D97706" />
                          </div>

                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{
                              margin: 0, fontSize: '13px', fontWeight: 700,
                              color: '#101828', fontFamily: 'monospace',
                            }}>
                              {notif.numero}
                            </p>
                            <p style={{
                              margin: '1px 0 0', fontSize: '11.5px', color: '#667085',
                              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                            }}>
                              {notif.client}
                            </p>
                          </div>

                          {/* Days remaining badge */}
                          <span style={{
                            background: '#FEF3C7', color: '#92400E',
                            fontSize: '10px', fontWeight: 700,
                            padding: '3px 8px', borderRadius: '9999px',
                            whiteSpace: 'nowrap', flexShrink: 0,
                          }}>
                            {notif.joursRestants}j restants
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* ── EMPTY STATE ── */}
                  {!overdueNotifications?.length && !upcomingNotifications?.length && (
                    <div style={{
                      padding: '32px 16px',
                      display: 'flex', flexDirection: 'column',
                      alignItems: 'center', gap: '10px',
                    }}>
                      <div style={{
                        width: '44px', height: '44px', borderRadius: '50%',
                        background: '#F0FDF4',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <Bell size={20} strokeWidth={1.75} color="#16A34A" />
                      </div>
                      <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#101828' }}>
                        Tout est à jour
                      </p>
                      <p style={{ margin: 0, fontSize: '12px', color: '#98A2B3', textAlign: 'center' }}>
                        Aucune facture en retard ou proche de l'échéance
                      </p>
                    </div>
                  )}
                </div>

                {/* ── FOOTER ACTIONS ── */}
                <div style={{
                  borderTop: '1px solid #F2F4F7',
                  display: 'flex',
                  flexDirection: 'column',
                }}>

                  {/* Mark all as read */}
                  <button
                    onClick={() => markAllAsRead()}
                    style={{
                      width: '100%',
                      padding: '11px 16px',
                      background: 'transparent',
                      border: 'none',
                      borderBottom: '1px solid #F2F4F7',
                      display: 'flex', alignItems: 'center', gap: '8px',
                      cursor: 'pointer',
                      fontSize: '12.5px', fontWeight: 600,
                      color: '#475467',
                      fontFamily: 'Inter, sans-serif',
                      transition: 'background 0.1s',
                      textAlign: 'left',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <CheckCheck size={14} strokeWidth={2} color="#16A34A" />
                    Tout marquer comme lu
                  </button>

                  {/* View all urgent invoices */}
                  <button
                    onClick={() => {
                      navigate('/factures?statut=EN_RETARD');
                      setNotifOpen(false);
                    }}
                    style={{
                      width: '100%',
                      padding: '11px 16px',
                      background: 'transparent',
                      border: 'none',
                      display: 'flex', alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      fontSize: '12.5px', fontWeight: 600,
                      color: '#0D4F2F',
                      fontFamily: 'Inter, sans-serif',
                      transition: 'background 0.1s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#F0FDF4'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <span>Voir toutes les factures urgentes</span>
                    <ArrowRight size={13} strokeWidth={2.5} color="#0D4F2F" />
                  </button>
                </div>

              </div>
            </>
          )}
        </div>

        {/* Vertical divider */}
        <div style={{
          width: '1px', height: '20px',
          background: '#EAECF0',
          flexShrink: 0
        }} />

        {/* Date */}
        <span style={{
          fontSize: '12.5px',
          fontWeight: 500,
          color: '#475467',
          whiteSpace: 'nowrap',
          fontFamily: 'Inter, sans-serif',
        }}>
          {new Date().toLocaleDateString('fr-FR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          })}
        </span>
      </div>
    </header>
  )
}
