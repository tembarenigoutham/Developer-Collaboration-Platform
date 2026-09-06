import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderGit2,
  CheckSquare,
  AlertCircle,
  GitPullRequest,
  FileText,
  Github,
  Bell,
  User,
  Users,
  Layers,
  Sparkles
} from 'lucide-react';

export const Sidebar = ({ collapsed }) => {
  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Projects', path: '/projects', icon: FolderGit2 },
    { label: 'Tasks', path: '/tasks', icon: CheckSquare },
    { label: 'Issues', path: '/issues', icon: AlertCircle },
    { label: 'Code Reviews', path: '/reviews', icon: GitPullRequest },
    { label: 'Users & Team', path: '/users', icon: Users },
    { label: 'Documentation', path: '/documentation', icon: FileText },
    { label: 'GitHub', path: '/github', icon: Github },
    { label: 'Notifications', path: '/notifications', icon: Bell },
    { label: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <aside style={{
      width: collapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)',
      backgroundColor: 'var(--bg-sidebar)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderRight: '1px solid var(--border-color)',
      height: '100vh',
      position: 'fixed',
      top: 0,
      left: 0,
      display: 'flex',
      flexDirection: 'column',
      transition: 'width 0.2s ease',
      zIndex: 50,
      overflowY: 'auto'
    }}>
      {/* Brand Header */}
      <div style={{
        height: 'var(--navbar-height)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 1.25rem',
        gap: '0.75rem',
        borderBottom: '1px solid var(--border-color)'
      }}>
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: 'var(--radius-md)',
          background: 'var(--accent-gradient)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          flexShrink: 0,
          boxShadow: '0 2px 10px rgba(99, 102, 241, 0.35)'
        }}>
          <Layers size={18} />
        </div>
        {!collapsed && (
          <span style={{
            fontSize: '1.15rem',
            fontWeight: 800,
            letterSpacing: '-0.025em',
            color: 'var(--text-primary)'
          }}>
            DevCollab
          </span>
        )}
      </div>

      {/* Nav List */}
      <nav style={{ padding: '1rem 0.65rem', display: 'flex', flexDirection: 'column', gap: '0.2rem', flex: 1 }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '0.85rem',
                padding: '0.625rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                backgroundColor: isActive ? 'var(--primary-light)' : 'transparent',
                border: isActive ? '1px solid var(--primary-border)' : '1px solid transparent',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.875rem',
                transition: 'all 0.15s ease'
              })}
              title={collapsed ? item.label : undefined}
            >
              <Icon size={18} style={{ flexShrink: 0, color: 'inherit' }} />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Workspace Footer Card */}
      {!collapsed && (
        <div style={{
          padding: '0.85rem',
          margin: '0.75rem',
          backgroundColor: 'rgba(255, 255, 255, 0.02)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-color)',
          fontSize: '0.75rem',
          color: 'var(--text-muted)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
            <Sparkles size={12} style={{ color: 'var(--primary)' }} /> Developer Platform
          </div>
          <div>Simple &bull; Production Ready</div>
        </div>
      )}
    </aside>
  );
};
