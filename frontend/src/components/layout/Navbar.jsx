import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Bell, User, LogOut, Menu, Shield, Crown } from 'lucide-react';
import { ThemeToggle } from '../common/ThemeToggle';
import api from '../../services/api';

export const Navbar = ({ toggleSidebar }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [recentNotifs, setRecentNotifs] = useState([]);
  const [backendHealthy, setBackendHealthy] = useState(null);

  const isPlatformOwner = user?.email === 'rgoutham079@gmail.com' || user?.system_role === 'OWNER';

  useEffect(() => {
    api.get('/health')
      .then((data) => {
        if (data.status === 'ok') setBackendHealthy(true);
      })
      .catch(() => setBackendHealthy(false));

    if (isAuthenticated) {
      loadNotifications();
      const interval = setInterval(loadNotifications, 20000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const loadNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setUnreadCount(res.unreadCount || 0);
      setRecentNotifs(res.data?.slice(0, 5) || []);
    } catch (_) {}
  };

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setUnreadCount(0);
      setRecentNotifs((prev) => prev.map((n) => ({ ...n, is_read: 1 })));
    } catch (_) {}
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header style={{
      height: 'var(--navbar-height)',
      backgroundColor: 'var(--bg-navbar)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border-color)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 1.75rem',
      position: 'sticky',
      top: 0,
      zIndex: 40
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          onClick={toggleSidebar}
          className="btn-icon"
          style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
          title="Toggle Navigation"
        >
          <Menu size={19} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{
            display: 'inline-block',
            width: '7px',
            height: '7px',
            borderRadius: '50%',
            backgroundColor: backendHealthy === true ? 'var(--success)' : backendHealthy === false ? 'var(--danger)' : 'var(--warning)',
            boxShadow: backendHealthy === true ? '0 0 8px rgba(16, 185, 129, 0.6)' : 'none'
          }} />
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', letterSpacing: '0.01em' }}>
            {backendHealthy === true ? 'API Connected' : backendHealthy === false ? 'API Offline' : 'Connecting...'}
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        {/* Theme Switcher */}
        <ThemeToggle />

        {isAuthenticated ? (
          <>
            {/* Notifications */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => {
                  setNotifOpen(!notifOpen);
                  setDropdownOpen(false);
                }}
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0.45rem',
                  borderRadius: 'var(--radius-md)',
                  position: 'relative'
                }}
                title="Notifications"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '-3px',
                    right: '-3px',
                    backgroundColor: 'var(--danger)',
                    color: '#fff',
                    borderRadius: '50%',
                    fontSize: '0.62rem',
                    fontWeight: 800,
                    width: '16px',
                    height: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 0 8px rgba(244, 63, 94, 0.6)'
                  }}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div style={{
                  position: 'absolute',
                  right: 0,
                  marginTop: '0.6rem',
                  width: '320px',
                  backgroundColor: 'var(--bg-modal)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: 'var(--shadow-lg)',
                  padding: '0.75rem 0',
                  zIndex: 50
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.5rem 1rem',
                    borderBottom: '1px solid var(--border-color)'
                  }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Notifications</span>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600 }}
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                    {recentNotifs.length === 0 ? (
                      <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        No notifications
                      </div>
                    ) : (
                      recentNotifs.map((n) => (
                        <div
                          key={n.id}
                          style={{
                            padding: '0.75rem 1rem',
                            borderBottom: '1px solid var(--border-subtle)',
                            backgroundColor: n.is_read ? 'transparent' : 'rgba(99, 102, 241, 0.05)',
                            fontSize: '0.825rem'
                          }}
                        >
                          <div style={{ color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
                            {n.message}
                          </div>
                          <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>
                            {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div style={{ padding: '0.5rem 1rem 0', textAlign: 'center', borderTop: '1px solid var(--border-color)' }}>
                    <Link
                      to="/notifications"
                      onClick={() => setNotifOpen(false)}
                      style={{ fontSize: '0.8rem', fontWeight: 600 }}
                    >
                      View all notifications
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Chip & Menu */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => {
                  setDropdownOpen(!dropdownOpen);
                  setNotifOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-color)',
                  padding: '0.35rem 0.75rem',
                  borderRadius: 'var(--radius-full)',
                  cursor: 'pointer',
                  color: 'var(--text-primary)',
                  transition: 'border-color 0.15s ease'
                }}
              >
                <div style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  background: isPlatformOwner ? 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)' : 'var(--accent-gradient)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '700',
                  fontSize: '0.8rem',
                  color: '#fff'
                }}>
                  {user?.name ? user.name[0].toUpperCase() : 'U'}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                    {user?.name || 'Developer'}
                  </span>
                  {isPlatformOwner ? (
                    <span className="badge badge-owner" style={{ fontSize: '0.62rem', padding: '0.1rem 0.45rem' }}>
                      <Crown size={10} style={{ verticalAlign: 'middle' }} /> PROJECT LEADER
                    </span>
                  ) : (
                    <span className="badge badge-primary" style={{ fontSize: '0.62rem', padding: '0.1rem 0.45rem' }}>
                      USER
                    </span>
                  )}
                </div>
              </button>

              {dropdownOpen && (
                <div style={{
                  position: 'absolute',
                  right: 0,
                  marginTop: '0.6rem',
                  width: '200px',
                  backgroundColor: 'var(--bg-modal)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-lg)',
                  padding: '0.5rem 0',
                  zIndex: 50
                }}>
                  <div style={{ padding: '0.5rem 1rem', borderBottom: '1px solid var(--border-subtle)', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    <div>Signed in as:</div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</div>
                  </div>
                  <Link
                    to="/profile"
                    onClick={() => setDropdownOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.6rem 1rem',
                      fontSize: '0.85rem',
                      color: 'var(--text-primary)'
                    }}
                  >
                    <User size={15} /> Profile & Settings
                  </Link>
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      handleLogout();
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.6rem 1rem',
                      fontSize: '0.85rem',
                      color: 'var(--danger)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <LogOut size={15} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link to="/login" className="btn btn-secondary btn-sm">Sign In</Link>
            <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
          </div>
        )}
      </div>
    </header>
  );
};
