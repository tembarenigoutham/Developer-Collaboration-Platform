import React, { useState, useEffect } from 'react';
import { Bell, Check, Trash2, Clock, CheckCircle2, AlertCircle, GitPullRequest, FolderPlus } from 'lucide-react';
import api from '../services/api';

export const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/notifications');
      setNotifications(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(notifications.map((n) => (n.id === id ? { ...n, is_read: 1 } : n)));
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(notifications.map((n) => ({ ...n, is_read: 1 })));
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(notifications.filter((n) => n.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'TASK_ASSIGNED':
        return <CheckCircle2 size={16} style={{ color: 'var(--success)' }} />;
      case 'ISSUE_ASSIGNED':
      case 'ISSUE_REPORTED':
        return <AlertCircle size={16} style={{ color: 'var(--warning)' }} />;
      case 'REVIEW_REQUESTED':
      case 'REVIEW_APPROVED':
      case 'CHANGES_REQUESTED':
        return <GitPullRequest size={16} style={{ color: 'var(--purple)' }} />;
      default:
        return <Bell size={16} style={{ color: 'var(--primary)' }} />;
    }
  };

  return (
    <div style={{ maxWidth: '820px', margin: '0 auto' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Notifications</h1>
          <p className="page-subtitle">Stay notified about task assignments, pull request reviews, and project activities</p>
        </div>
        {notifications.some((n) => !n.is_read) && (
          <button onClick={handleMarkAllRead} className="btn btn-secondary btn-sm">
            <Check size={14} /> Mark all as read
          </button>
        )}
      </div>

      <div className="card" style={{ padding: 0 }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="empty-state">
            <Bell className="empty-state-icon" />
            <h3 className="empty-state-title">No notifications</h3>
            <p className="empty-state-desc">You are all caught up! New alerts and team actions will appear here.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {notifications.map((notif) => (
              <div
                key={notif.id}
                style={{
                  padding: '1.25rem 1.5rem',
                  borderBottom: '1px solid var(--border-color)',
                  backgroundColor: notif.is_read ? 'transparent' : 'rgba(99, 102, 241, 0.05)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  transition: 'background-color 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', flex: 1 }}>
                  <div style={{
                    padding: '0.5rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-subtle)',
                    border: '1px solid var(--border-subtle)',
                    marginTop: '2px'
                  }}>
                    {getNotificationIcon(notif.type)}
                  </div>
                  <div>
                    <div style={{
                      color: notif.is_read ? 'var(--text-secondary)' : 'var(--text-primary)',
                      fontWeight: notif.is_read ? 400 : 600,
                      fontSize: '0.925rem',
                      lineHeight: '1.4'
                    }}>
                      {notif.message}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.35rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      <span>{new Date(notif.created_at).toLocaleString()}</span>
                      <span>&bull;</span>
                      <span className="badge badge-primary" style={{ fontSize: '0.65rem' }}>{notif.type}</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {!notif.is_read && (
                    <button
                      onClick={() => handleMarkRead(notif.id)}
                      className="btn-icon"
                      style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer' }}
                      title="Mark as Read"
                    >
                      <Check size={16} />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(notif.id)}
                    className="btn-icon"
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
