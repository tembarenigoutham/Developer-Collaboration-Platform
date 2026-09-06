import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Users,
  Search,
  ShieldCheck,
  Mail,
  Calendar,
  CheckSquare,
  AlertCircle,
  FolderGit2,
  Sparkles,
  Filter,
  RefreshCw,
  ExternalLink,
  Clock,
  ArrowRight,
  Github,
  Linkedin,
  ShieldAlert,
  UserCheck,
  UserX,
  Check,
  X,
  Activity,
  UserPlus,
  Eye
} from 'lucide-react';
import api from '../services/api';

export const UsersPage = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshedToast, setRefreshedToast] = useState(false);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  // Owner action modal states
  const [assignModalUser, setAssignModalUser] = useState(null);
  const [assignForm, setAssignForm] = useState({ project_id: '', role: 'DEVELOPER' });
  const [assigning, setAssigning] = useState(false);

  const [activityModalUser, setActivityModalUser] = useState(null);
  const [userActivity, setUserActivity] = useState(null);
  const [loadingActivity, setLoadingActivity] = useState(false);

  const isOwner = currentUser?.system_role === 'OWNER' || currentUser?.email === 'rgoutham079@gmail.com';

  useEffect(() => {
    fetchUsers();
  }, []);

  const loadProjects = async () => {
    try {
      const res = await api.get('/projects');
      const list = res.data || [];
      setProjects(list);
      if (list.length > 0) {
        setAssignForm(prev => ({ ...prev, project_id: prev.project_id || list[0].id }));
      }
    } catch (e) {
      console.error('Failed to load projects:', e);
    }
  };

  const openAssignModal = async (u) => {
    setAssignModalUser(u);
    await loadProjects();
  };

  const handleAssignUser = async (e) => {
    e.preventDefault();
    if (!assignModalUser || !assignForm.project_id) return;

    try {
      setAssigning(true);
      await api.post(`/dashboard/users/${assignModalUser.id}/assign-project`, {
        project_id: assignForm.project_id,
        role: assignForm.role
      });
      alert(`User ${assignModalUser.name} assigned to project successfully!`);
      setAssignModalUser(null);
      fetchUsers();
    } catch (err) {
      alert(err.message || 'Failed to assign user to project');
    } finally {
      setAssigning(false);
    }
  };

  const openActivityModal = async (u) => {
    setActivityModalUser(u);
    setUserActivity(null);
    setLoadingActivity(true);
    try {
      const res = await api.get(`/dashboard/users/${u.id}/activity`);
      setUserActivity(res.data || null);
    } catch (err) {
      alert(err.message || 'Failed to load user activity');
    } finally {
      setLoadingActivity(false);
    }
  };

  const handleToggleStatus = async (u) => {
    const isTargetOwner = u.system_role === 'OWNER' || u.email === 'rgoutham079@gmail.com';
    if (isTargetOwner) {
      alert('The Project Leader account cannot be suspended.');
      return;
    }

    const nextStatus = u.status === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED';
    const confirmAction = window.confirm(
      `Are you sure you want to change account status for ${u.name} (${u.email}) to ${nextStatus}?`
    );
    if (!confirmAction) return;

    try {
      await api.put(`/dashboard/users/${u.id}/status`, { status: nextStatus });
      setUsers(users.map(item => item.id === u.id ? { ...item, status: nextStatus } : item));
    } catch (err) {
      alert(err.message || 'Failed to update user status');
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/dashboard/users?_t=${Date.now()}`);
      const data = res?.data || res;
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch platform users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      const res = await api.get(`/dashboard/users?_t=${Date.now()}`);
      const data = res?.data || res;
      setUsers(Array.isArray(data) ? data : []);
      setRefreshedToast(true);
      setTimeout(() => setRefreshedToast(false), 2000);
    } catch (err) {
      console.error('Failed to refresh platform users:', err);
    } finally {
      setTimeout(() => setRefreshing(false), 500);
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        (u.name && u.name.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q)) ||
        String(u.id).includes(q);

      const isUserOwner = u.system_role === 'OWNER' || u.email === 'rgoutham079@gmail.com';
      const matchesRole =
        roleFilter === 'ALL' ||
        (roleFilter === 'OWNER' && isUserOwner) ||
        (roleFilter === 'USER' && !isUserOwner);

      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  const ownerCount = users.filter((u) => u.system_role === 'OWNER' || u.email === 'rgoutham079@gmail.com').length;
  const regularUserCount = users.length - ownerCount;
  const totalTasks = users.reduce((acc, u) => acc + (parseInt(u.assigned_tasks, 10) || 0), 0);

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <h1 className="page-title" style={{ marginBottom: 0 }}>
              Users & Team Directory
            </h1>
            <span className="badge badge-primary">{users.length} Registered</span>
          </div>
          <p className="page-subtitle">
            All user accounts created on DevCollab &mdash; inspect user details, credentials, and contributions.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button
            onClick={handleRefresh}
            className="btn btn-secondary"
            title="Refresh user list"
            disabled={refreshing}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              minWidth: '105px',
              justifyContent: 'center',
              color: refreshedToast ? 'var(--success)' : 'var(--text-primary)',
              transition: 'all 0.2s ease'
            }}
          >
            <RefreshCw size={15} className={refreshing ? 'spin' : ''} />
            {refreshing ? 'Updating...' : refreshedToast ? 'Updated ✓' : 'Refresh'}
          </button>
          <Link to="/projects/new" className="btn btn-primary">
            <FolderGit2 size={16} /> New Project
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
        gap: '1.25rem',
        marginBottom: '2rem'
      }}>
        {/* Total Registered Users */}
        <div className="card" style={{
          borderTop: '3px solid #6366f1',
          background: 'linear-gradient(180deg, rgba(99, 102, 241, 0.08) 0%, var(--bg-card) 100%)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Total Accounts
              </div>
              <div style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.25rem' }}>
                {users.length}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                Registered users in database
              </div>
            </div>
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 20px rgba(99, 102, 241, 0.35)'
            }}>
              <Users size={24} />
            </div>
          </div>
        </div>

        {/* Project Leader */}
        <div className="card" style={{
          borderTop: '3px solid #f59e0b',
          background: 'linear-gradient(180deg, rgba(245, 158, 11, 0.08) 0%, var(--bg-card) 100%)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--warning)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Project Leader
              </div>
              <div style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.25rem' }}>
                {ownerCount}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                rgoutham079@gmail.com
              </div>
            </div>
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #f59e0b, #ea580c)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 20px rgba(245, 158, 11, 0.35)'
            }}>
              <ShieldCheck size={24} />
            </div>
          </div>
        </div>

        {/* Regular Users */}
        <div className="card" style={{
          borderTop: '3px solid #10b981',
          background: 'linear-gradient(180deg, rgba(16, 185, 129, 0.08) 0%, var(--bg-card) 100%)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--success)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Regular Users
              </div>
              <div style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.25rem' }}>
                {regularUserCount}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                Standard member accounts
              </div>
            </div>
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 20px rgba(16, 185, 129, 0.35)'
            }}>
              <Users size={24} />
            </div>
          </div>
        </div>

        {/* Total Tasks Assigned */}
        <div className="card" style={{
          borderTop: '3px solid #06b6d4',
          background: 'linear-gradient(180deg, rgba(6, 182, 212, 0.08) 0%, var(--bg-card) 100%)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--info)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                User Assigned Tasks
              </div>
              <div style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.25rem' }}>
                {totalTasks}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                Assigned across projects
              </div>
            </div>
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #06b6d4, #0284c7)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 20px rgba(6, 182, 212, 0.35)'
            }}>
              <CheckSquare size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ marginBottom: '1.75rem', padding: '1.25rem' }}>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          {/* Search Box */}
          <div style={{ position: 'relative', flex: '1 1 300px', maxWidth: '500px' }}>
            <Search
              size={18}
              style={{
                position: 'absolute',
                left: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)'
              }}
            />
            <input
              type="text"
              placeholder="Search by user name (e.g. Sharuu) or email address..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '2.75rem', width: '100%' }}
            />
          </div>

          {/* Filter Pills */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => setRoleFilter('ALL')}
              className={`btn btn-sm ${roleFilter === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
            >
              All Users ({users.length})
            </button>
            <button
              onClick={() => setRoleFilter('OWNER')}
              className={`btn btn-sm ${roleFilter === 'OWNER' ? 'btn-primary' : 'btn-secondary'}`}
            >
              👑 Project Leader ({ownerCount})
            </button>
            <button
              onClick={() => setRoleFilter('USER')}
              className={`btn btn-sm ${roleFilter === 'USER' ? 'btn-primary' : 'btn-secondary'}`}
            >
              👤 Regular Users ({regularUserCount})
            </button>
          </div>
        </div>
      </div>

      {/* User Cards Grid */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '1.25rem'
        }}>
          {filteredUsers.map((u) => {
            const isUserOwner = u.system_role === 'OWNER' || u.email === 'rgoutham079@gmail.com';
            return (
              <div
                key={u.id}
                className="card"
                style={{
                  position: 'relative',
                  overflow: 'hidden',
                  borderTop: isUserOwner ? '3px solid #f59e0b' : '3px solid #6366f1',
                  background: isUserOwner
                    ? 'linear-gradient(180deg, rgba(245, 158, 11, 0.06) 0%, var(--bg-card) 100%)'
                    : 'linear-gradient(180deg, rgba(99, 102, 241, 0.05) 0%, var(--bg-card) 100%)',
                  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.25)',
                  transition: 'transform 0.2s ease, border-color 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.borderColor = isUserOwner ? 'rgba(245, 158, 11, 0.6)' : 'rgba(99, 102, 241, 0.6)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'var(--border-color)';
                }}
              >
                {/* Header with Avatar, Name & Role */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <div style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '50%',
                      background: isUserOwner
                        ? 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)'
                        : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '1.1rem',
                      boxShadow: isUserOwner ? '0 0 14px rgba(245, 158, 11, 0.45)' : '0 4px 12px rgba(99, 102, 241, 0.3)',
                      flexShrink: 0
                    }}>
                      {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        {u.name}
                        {isUserOwner && <span title="Project Leader">👑</span>}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600 }}>
                        {u.title || 'Software Engineer'}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        User ID: #{u.id} {u.email === currentUser?.email ? '(Current Account)' : ''}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.35rem' }}>
                    <span className={`badge ${isUserOwner ? 'badge-owner' : 'badge-primary'}`}>
                      {isUserOwner ? '👑 PROJECT LEADER' : '👤 USER'}
                    </span>
                    {u.status === 'SUSPENDED' && (
                      <span className="badge badge-danger" style={{ fontSize: '0.65rem' }}>
                        SUSPENDED
                      </span>
                    )}
                  </div>
                </div>

                {/* Developer Bio */}
                {u.bio && (
                  <p style={{
                    fontSize: '0.825rem',
                    color: 'var(--text-secondary)',
                    marginBottom: '0.75rem',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    lineHeight: '1.4'
                  }}>
                    {u.bio}
                  </p>
                )}

                {/* Skills tags */}
                {u.skills && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '0.85rem' }}>
                    {u.skills.split(',').slice(0, 4).map((s, idx) => s.trim() && (
                      <span key={idx} className="badge badge-info" style={{ fontSize: '0.68rem', padding: '0.1rem 0.45rem' }}>
                        💻 {s.trim()}
                      </span>
                    ))}
                    {u.skills.split(',').length > 4 && (
                      <span className="badge badge-secondary" style={{ fontSize: '0.65rem' }}>
                        +{u.skills.split(',').length - 4}
                      </span>
                    )}
                  </div>
                )}

                {/* Social links */}
                {(u.github_url || u.linkedin_url) && (
                  <div style={{ display: 'flex', gap: '0.85rem', marginBottom: '0.85rem', fontSize: '0.78rem' }}>
                    {u.github_url && (
                      <a
                        href={u.github_url.startsWith('http') ? u.github_url : `https://${u.github_url}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-secondary)' }}
                      >
                        <Github size={13} /> GitHub
                      </a>
                    )}
                    {u.linkedin_url && (
                      <a
                        href={u.linkedin_url.startsWith('http') ? u.linkedin_url : `https://${u.linkedin_url}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: '#0ea5e9' }}
                      >
                        <Linkedin size={13} /> LinkedIn
                      </a>
                    )}
                  </div>
                )}

                {/* Details list */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.825rem' }}>
                    <Mail size={14} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                    <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', wordBreak: 'break-all' }}>
                      {u.email}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <Calendar size={14} style={{ color: '#10b981', flexShrink: 0 }} />
                    <span>
                      Registered on {new Date(u.created_at).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                </div>

                {/* User Platform Activities */}
                <div style={{
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-subtle)',
                  border: '1px solid var(--border-subtle)',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '0.5rem',
                  textAlign: 'center'
                }}>
                  <div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Tasks</div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--primary)', marginTop: '0.1rem' }}>
                      {u.assigned_tasks || 0}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Issues</div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--warning)', marginTop: '0.1rem' }}>
                      {u.reported_issues || 0}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Projects</div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--purple)', marginTop: '0.1rem' }}>
                      {u.project_count || 0}
                    </div>
                  </div>
                </div>

                {/* Footer status and Action Buttons */}
                <div style={{
                  marginTop: '1rem',
                  paddingTop: '0.75rem',
                  borderTop: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '0.75rem',
                  flexWrap: 'wrap',
                  gap: '0.5rem'
                }}>
                  {u.status === 'SUSPENDED' ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: '#ef4444', fontWeight: 600 }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ef4444', boxShadow: '0 0 8px #ef4444' }} />
                      Suspended
                    </span>
                  ) : (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: '#10b981', fontWeight: 600 }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981', boxShadow: '0 0 8px #10b981' }} />
                      Active
                    </span>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <button
                      onClick={() => openActivityModal(u)}
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '0.2rem 0.55rem', fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                      title="View user activity history"
                    >
                      <Activity size={12} /> Activity
                    </button>

                    {isOwner && (
                      <>
                        <button
                          onClick={() => openAssignModal(u)}
                          className="btn btn-primary btn-sm"
                          style={{ padding: '0.2rem 0.55rem', fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                          title="Assign user to project"
                        >
                          <UserPlus size={12} /> Assign
                        </button>

                        {!isUserOwner && (
                          <button
                            onClick={() => handleToggleStatus(u)}
                            className={`btn btn-sm ${u.status === 'SUSPENDED' ? 'btn-success' : 'btn-danger'}`}
                            style={{ padding: '0.2rem 0.55rem', fontSize: '0.72rem' }}
                            title={u.status === 'SUSPENDED' ? 'Activate Account' : 'Suspend Account'}
                          >
                            {u.status === 'SUSPENDED' ? 'Activate' : 'Suspend'}
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Full Responsive Table View */}
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title" style={{ marginBottom: 0 }}>
              Complete Users Data Table
            </h2>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Showing {filteredUsers.length} of {users.length} registered accounts
            </span>
          </div>
        </div>

        {filteredUsers.length === 0 ? (
          <div className="empty-state" style={{ padding: '3rem 1rem' }}>
            <Users className="empty-state-icon" />
            <div className="empty-state-title">No matching users found</div>
            <p className="empty-state-desc">Try clearing or changing your search criteria.</p>
            <button onClick={() => { setSearch(''); setRoleFilter('ALL'); }} className="btn btn-secondary btn-sm" style={{ marginTop: '1rem' }}>
              Clear Search Filters
            </button>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>User & Full Name</th>
                  <th>Title & Skills</th>
                  <th>Email Address</th>
                  <th>Role</th>
                  <th>Tasks</th>
                  <th>Issues</th>
                  <th>Workspaces</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => {
                  const isUserOwner = u.system_role === 'OWNER' || u.email === 'rgoutham079@gmail.com';
                  return (
                    <tr
                      key={u.id}
                      style={{
                        backgroundColor: isUserOwner ? 'rgba(245, 158, 11, 0.05)' : undefined
                      }}
                    >
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{
                            width: '38px',
                            height: '38px',
                            borderRadius: '50%',
                            background: isUserOwner
                              ? 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)'
                              : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                            color: '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '0.9rem',
                            boxShadow: isUserOwner ? '0 0 10px rgba(245, 158, 11, 0.4)' : 'none',
                            flexShrink: 0
                          }}>
                            {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                              {u.name}
                              {isUserOwner && <span title="Project Leader">👑</span>}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                              User #{u.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {u.title || 'Software Engineer'}
                        </div>
                        {u.skills && (
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                            {u.skills.split(',').slice(0, 3).join(', ')}
                          </div>
                        )}
                      </td>
                      <td>
                        <span style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.82rem',
                          color: 'var(--text-primary)',
                          backgroundColor: 'var(--bg-subtle)',
                          padding: '0.2rem 0.5rem',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border-subtle)'
                        }}>
                          {u.email}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${isUserOwner ? 'badge-owner' : 'badge-primary'}`}>
                          {isUserOwner ? '👑 PROJECT LEADER' : '👤 USER'}
                        </span>
                      </td>
                      <td>
                        <span className="badge badge-info">{u.assigned_tasks || 0} tasks</span>
                      </td>
                      <td>
                        <span className="badge badge-warning">{u.reported_issues || 0} issues</span>
                      </td>
                      <td>
                        <span className="badge badge-purple">{u.project_count || 0} projects</span>
                      </td>
                      <td>
                        {u.status === 'SUSPENDED' ? (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            fontSize: '0.78rem',
                            color: '#ef4444',
                            fontWeight: 600,
                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                            padding: '0.2rem 0.5rem',
                            borderRadius: '9999px',
                            border: '1px solid rgba(239, 68, 68, 0.2)'
                          }}>
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
                            Suspended
                          </span>
                        ) : (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            fontSize: '0.78rem',
                            color: '#10b981',
                            fontWeight: 600,
                            backgroundColor: 'rgba(16, 185, 129, 0.1)',
                            padding: '0.2rem 0.5rem',
                            borderRadius: '9999px',
                            border: '1px solid rgba(16, 185, 129, 0.2)'
                          }}>
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                            Active
                          </span>
                        )}
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <button
                            onClick={() => openActivityModal(u)}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '0.2rem 0.45rem', fontSize: '0.72rem' }}
                            title="Activity"
                          >
                            Activity
                          </button>
                          {isOwner && (
                            <>
                              <button
                                onClick={() => openAssignModal(u)}
                                className="btn btn-primary btn-sm"
                                style={{ padding: '0.2rem 0.45rem', fontSize: '0.72rem' }}
                                title="Assign to Project"
                              >
                                Assign
                              </button>
                              {!isUserOwner && (
                                <button
                                  onClick={() => handleToggleStatus(u)}
                                  className={`btn btn-sm ${u.status === 'SUSPENDED' ? 'btn-success' : 'btn-danger'}`}
                                  style={{ padding: '0.2rem 0.45rem', fontSize: '0.72rem' }}
                                >
                                  {u.status === 'SUSPENDED' ? 'Activate' : 'Suspend'}
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Owner Action Modal: Assign User to Project */}
      {assignModalUser && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.75)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 100, padding: '1rem'
        }}>
          <div className="card" style={{ maxWidth: '480px', width: '100%', backgroundColor: 'var(--bg-modal)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <UserPlus size={20} style={{ color: 'var(--primary)' }} />
                <h2 className="card-title" style={{ marginBottom: 0 }}>Assign User to Project</h2>
              </div>
              <button onClick={() => setAssignModalUser(null)} className="btn btn-secondary btn-sm">
                <X size={14} />
              </button>
            </div>

            <div style={{
              padding: '0.85rem',
              backgroundColor: 'var(--bg-subtle)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              marginBottom: '1.25rem'
            }}>
              <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{assignModalUser.name}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{assignModalUser.email}</div>
            </div>

            <form onSubmit={handleAssignUser}>
              <div className="form-group">
                <label className="form-label">Select Project Workspace *</label>
                {projects.length === 0 ? (
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No projects available.</div>
                ) : (
                  <select
                    className="form-select"
                    value={assignForm.project_id}
                    onChange={(e) => setAssignForm({ ...assignForm, project_id: e.target.value })}
                    required
                  >
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        📁 {p.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Assigned Role</label>
                <select
                  className="form-select"
                  value={assignForm.role}
                  onChange={(e) => setAssignForm({ ...assignForm, role: e.target.value })}
                >
                  <option value="DEVELOPER">DEVELOPER (Write code, manage tasks)</option>
                  <option value="ADMIN">ADMIN (Manage workspace settings & members)</option>
                  <option value="VIEWER">VIEWER (Read-only access)</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setAssignModalUser(null)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={assigning || projects.length === 0}>
                  {assigning ? 'Assigning...' : 'Confirm Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* User Activity Modal */}
      {activityModalUser && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.75)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 100, padding: '1rem'
        }}>
          <div className="card" style={{ maxWidth: '640px', width: '100%', maxHeight: '90vh', overflowY: 'auto', backgroundColor: 'var(--bg-modal)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Activity size={20} style={{ color: 'var(--primary)' }} />
                <div>
                  <h2 className="card-title" style={{ marginBottom: 0, fontSize: '1.15rem' }}>
                    Activity History &mdash; {activityModalUser.name}
                  </h2>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{activityModalUser.email}</div>
                </div>
              </div>
              <button onClick={() => setActivityModalUser(null)} className="btn btn-secondary btn-sm">
                <X size={14} />
              </button>
            </div>

            {loadingActivity ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                Loading user activity history...
              </div>
            ) : userActivity ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* Stats row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                  <div style={{ padding: '0.75rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>PROJECTS</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--purple)' }}>{userActivity.stats?.projects || 0}</div>
                  </div>
                  <div style={{ padding: '0.75rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>TASKS COMPLETED</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--success)' }}>{userActivity.stats?.completed_tasks || 0} / {userActivity.stats?.assigned_tasks || 0}</div>
                  </div>
                  <div style={{ padding: '0.75rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>ISSUES REPORTED</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--warning)' }}>{userActivity.stats?.reported_issues || 0}</div>
                  </div>
                </div>

                {/* Projects Section */}
                <div>
                  <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                    Project Memberships ({userActivity.projects?.length || 0})
                  </h3>
                  {userActivity.projects?.length === 0 ? (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Not enrolled in any projects.</div>
                  ) : (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {userActivity.projects?.map((p) => (
                        <div key={p.id} style={{
                          padding: '0.45rem 0.75rem',
                          background: 'var(--bg-subtle)',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border-subtle)',
                          fontSize: '0.8rem'
                        }}>
                          <strong>📁 {p.name}</strong> &bull; <span className="badge badge-primary" style={{ fontSize: '0.65rem' }}>{p.role}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Assigned Tasks Section */}
                <div>
                  <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                    Assigned Tasks ({userActivity.tasks?.length || 0})
                  </h3>
                  {userActivity.tasks?.length === 0 ? (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No tasks assigned to this user.</div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '200px', overflowY: 'auto' }}>
                      {userActivity.tasks?.map((t) => (
                        <div key={t.id} style={{
                          padding: '0.6rem 0.85rem',
                          background: 'var(--bg-subtle)',
                          borderRadius: 'var(--radius-md)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          fontSize: '0.8rem'
                        }}>
                          <div>
                            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{t.title}</span>
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>in {t.project_name}</span>
                          </div>
                          <span className={`badge ${t.status === 'DONE' ? 'badge-success' : 'badge-info'}`} style={{ fontSize: '0.65rem' }}>
                            {t.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Reported Issues Section */}
                <div>
                  <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                    Reported Issues ({userActivity.issues?.length || 0})
                  </h3>
                  {userActivity.issues?.length === 0 ? (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No issues reported by this user.</div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '180px', overflowY: 'auto' }}>
                      {userActivity.issues?.map((iss) => (
                        <div key={iss.id} style={{
                          padding: '0.6rem 0.85rem',
                          background: 'var(--bg-subtle)',
                          borderRadius: 'var(--radius-md)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          fontSize: '0.8rem'
                        }}>
                          <div>
                            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{iss.title}</span>
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>in {iss.project_name}</span>
                          </div>
                          <span className="badge badge-warning" style={{ fontSize: '0.65rem' }}>
                            {iss.priority}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : null}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem' }}>
              <button onClick={() => setActivityModalUser(null)} className="btn btn-secondary">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;
