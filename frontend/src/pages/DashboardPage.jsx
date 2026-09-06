import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FolderGit2,
  CheckSquare,
  AlertCircle,
  GitPullRequest,
  Plus,
  ArrowRight,
  Github,
  Clock,
  ExternalLink,
  Layers,
  Activity,
  Sparkles,
  Users,
  ShieldCheck,
  Trophy,
  Award
} from 'lucide-react';
import api from '../services/api';

export const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    projects: 0,
    tasks: 0,
    issues: 0,
    reviews: 0,
    users: 0
  });
  const [recentProjects, setRecentProjects] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [registeredUsers, setRegisteredUsers] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  const isOwner = user?.system_role === 'OWNER' || user?.email === 'rgoutham079@gmail.com';

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dashboard/stats');
      const payload = res?.data || res;
      if (payload) {
        setStats(payload.stats || { projects: 0, tasks: 0, issues: 0, reviews: 0, users: 0 });
        setRecentProjects(payload.recentProjects || []);
        setRecentActivity(payload.recentActivity || []);
        setRegisteredUsers(payload.registeredUsers || []);
        setLeaderboard(payload.leaderboard || []);
      }
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            Welcome back, {user?.name || 'Developer'} 👋
          </h1>
          <p className="page-subtitle">
            Here's what's happening across your development workspaces today.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/users" className="btn btn-secondary">
            <Users size={16} /> View Team ({registeredUsers.length || stats.users || 0})
          </Link>
          <Link to="/projects/new" className="btn btn-primary">
            <Plus size={16} /> New Project
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
        {/* Total Projects */}
        <div className="card" style={{
          position: 'relative',
          overflow: 'hidden',
          borderTop: '3px solid #6366f1',
          background: 'linear-gradient(180deg, rgba(99, 102, 241, 0.08) 0%, var(--bg-card) 100%)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Total Projects
              </div>
              <div style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.25rem' }}>
                {stats.projects}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                Active workspaces
              </div>
            </div>
            <div style={{
              width: '54px',
              height: '54px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 20px rgba(99, 102, 241, 0.4)'
            }}>
              <FolderGit2 size={26} />
            </div>
          </div>
        </div>

          {/* Active Tasks */}
          <div className="card" style={{
            position: 'relative',
            overflow: 'hidden',
            borderTop: '3px solid #10b981',
            background: 'linear-gradient(180deg, rgba(16, 185, 129, 0.08) 0%, var(--bg-card) 100%)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--success)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Active Tasks
                </div>
                <div style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.25rem' }}>
                  {stats.tasks}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                  In sprint pipeline
                </div>
              </div>
              <div style={{
                width: '54px',
                height: '54px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 20px rgba(16, 185, 129, 0.4)'
              }}>
                <CheckSquare size={26} />
              </div>
            </div>
          </div>

          {/* Open Issues */}
          <div className="card" style={{
            position: 'relative',
            overflow: 'hidden',
            borderTop: '3px solid #f59e0b',
            background: 'linear-gradient(180deg, rgba(245, 158, 11, 0.08) 0%, var(--bg-card) 100%)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--warning)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Open Issues
                </div>
                <div style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.25rem' }}>
                  {stats.issues}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                  Requires triage & fix
                </div>
              </div>
              <div style={{
                width: '54px',
                height: '54px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 20px rgba(245, 158, 11, 0.4)'
              }}>
                <AlertCircle size={26} />
              </div>
            </div>
          </div>

          {/* Pending Reviews */}
          <div className="card" style={{
            position: 'relative',
            overflow: 'hidden',
            borderTop: '3px solid #a855f7',
            background: 'linear-gradient(180deg, rgba(168, 85, 247, 0.08) 0%, var(--bg-card) 100%)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--purple)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Pending Reviews
                </div>
                <div style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.25rem' }}>
                  {stats.reviews}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                  Awaiting approval
                </div>
              </div>
              <div style={{
                width: '54px',
                height: '54px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 20px rgba(168, 85, 247, 0.4)'
              }}>
                <GitPullRequest size={26} />
              </div>
            </div>
          </div>

          {/* Registered Users */}
          <div className="card" style={{
            position: 'relative',
            overflow: 'hidden',
            borderTop: '3px solid #06b6d4',
            background: 'linear-gradient(180deg, rgba(6, 182, 212, 0.08) 0%, var(--bg-card) 100%)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--info)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Registered Users
                </div>
                <div style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.25rem' }}>
                  {stats.users || registeredUsers.length}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                  Total platform members
                </div>
              </div>
              <div style={{
                width: '54px',
                height: '54px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #06b6d4 0%, #0284c7 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 20px rgba(6, 182, 212, 0.4)'
              }}>
                <Users size={26} />
              </div>
            </div>
          </div>
        </div>

      {/* Grid: Recent Projects & Activity */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        {/* Recent Projects Card */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Recent Projects</h2>
            <Link to="/projects" style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              View All <ArrowRight size={14} />
            </Link>
          </div>

          {recentProjects.length === 0 ? (
            <div className="empty-state" style={{ padding: '2rem 1rem' }}>
              <FolderGit2 className="empty-state-icon" />
              <div className="empty-state-title">No projects yet</div>
              <p className="empty-state-desc">Create your first software collaboration project to get started.</p>
              <Link to="/projects/new" className="btn btn-primary btn-sm">
                <Plus size={14} /> Create Project
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {recentProjects.map((p) => {
                const total = p.task_count || 0;
                const done = p.done_task_count || 0;
                const percent = total > 0 ? Math.round((done / total) * 100) : 0;

                return (
                  <Link
                    key={p.id}
                    to={`/projects/${p.id}`}
                    style={{
                      display: 'block',
                      padding: '1.1rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--bg-subtle)',
                      border: '1px solid var(--border-color)',
                      textDecoration: 'none',
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.45)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-color)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1rem' }}>
                        {p.name}
                      </span>
                      <span className={`badge ${p.user_role === 'OWNER' ? 'badge-owner' : p.user_role === 'ADMIN' ? 'badge-purple' : 'badge-primary'}`}>
                        {p.user_role === 'OWNER' ? '👑 PROJECT LEADER' : p.user_role}
                      </span>
                    </div>

                    <p style={{
                      fontSize: '0.825rem',
                      color: 'var(--text-secondary)',
                      marginBottom: '0.85rem',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      lineHeight: '1.45'
                    }}>
                      {p.description || 'No description provided.'}
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      <span style={{ fontWeight: 600, color: percent === 100 ? '#10b981' : '#818cf8' }}>
                        {percent}% Completed
                      </span>
                      <span>{done}/{total} tasks done</span>
                    </div>

                    <div style={{
                      width: '100%',
                      height: '6px',
                      backgroundColor: 'rgba(255, 255, 255, 0.08)',
                      borderRadius: '9999px',
                      marginTop: '0.5rem',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${percent}%`,
                        height: '100%',
                        background: percent === 100
                          ? 'linear-gradient(90deg, #10b981 0%, #34d399 100%)'
                          : 'linear-gradient(90deg, #6366f1 0%, #06b6d4 100%)',
                        borderRadius: '9999px',
                        transition: 'width 0.4s ease'
                      }} />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Activity Card */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Recent Activity</h2>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Activity size={14} style={{ color: '#10b981' }} /> Live Feed
            </span>
          </div>

          {recentActivity.length === 0 ? (
            <div className="empty-state" style={{ padding: '2rem 1rem' }}>
              <Clock className="empty-state-icon" />
              <div className="empty-state-title">No recent activity</div>
              <p className="empty-state-desc">Actions and updates by team members will automatically appear here.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {recentActivity.map((act, i) => (
                <div
                  key={i}
                  style={{
                    padding: '0.85rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-subtle)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.85rem'
                  }}
                >
                  <div style={{
                    padding: '0.45rem',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: act.type === 'TASK' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                    color: act.type === 'TASK' ? '#34d399' : '#fbbf24',
                    marginTop: '2px'
                  }}>
                    {act.type === 'TASK' ? <CheckSquare size={16} /> : <AlertCircle size={16} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {act.item_title}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                      <strong style={{ color: 'var(--text-primary)' }}>{act.actor_name}</strong> in <span style={{ color: 'var(--primary)' }}>{act.project_name}</span> &bull; <span className="badge badge-info" style={{ fontSize: '0.65rem', padding: '0.1rem 0.45rem' }}>{act.item_status}</span>
                    </div>
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                    {new Date(act.activity_date).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Team Contribution Leaderboard */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="card-header" style={{ flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
              }}>
                <Trophy size={18} />
              </div>
              <h2 className="card-title" style={{ marginBottom: 0, fontSize: '1.25rem' }}>
                Team Contribution Leaderboard
              </h2>
              <span className="badge badge-warning">Sprint Standings</span>
            </div>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', margin: '0.35rem 0 0 0' }}>
              Real-time developer points: +5 pts per completed task, +2 pts per created task, +3 pts per reported issue.
            </p>
          </div>
          <Link to="/users" className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Users size={14} /> View All Contributors <ArrowRight size={14} />
          </Link>
        </div>

        {leaderboard.length === 0 ? (
          <div className="empty-state" style={{ padding: '2rem 1rem' }}>
            <Trophy className="empty-state-icon" />
            <div className="empty-state-title">No leaderboard points yet</div>
            <p className="empty-state-desc">Complete tasks, file issues, or start sprint items to climb the ranking!</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1rem',
            marginTop: '0.5rem'
          }}>
            {leaderboard.map((item, index) => {
              const rank = index + 1;
              const isFirst = rank === 1;
              const isSecond = rank === 2;
              const isThird = rank === 3;

              const medalColor = isFirst ? '#f59e0b' : isSecond ? '#94a3b8' : isThird ? '#d97706' : '#6366f1';
              const medalIcon = isFirst ? '🥇' : isSecond ? '🥈' : isThird ? '🥉' : `#${rank}`;

              return (
                <div
                  key={item.id}
                  style={{
                    padding: '1.1rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-subtle)',
                    border: isFirst ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid var(--border-color)',
                    background: isFirst
                      ? 'linear-gradient(180deg, rgba(245, 158, 11, 0.08) 0%, var(--bg-subtle) 100%)'
                      : 'var(--bg-subtle)',
                    boxShadow: isFirst ? '0 4px 15px rgba(245, 158, 11, 0.15)' : 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '0.85rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        backgroundColor: isFirst ? 'rgba(245, 158, 11, 0.2)' : isSecond ? 'rgba(148, 163, 184, 0.2)' : 'rgba(99, 102, 241, 0.15)',
                        color: medalColor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: isFirst || isSecond || isThird ? '1.1rem' : '0.85rem',
                        flexShrink: 0
                      }}>
                        {medalIcon}
                      </span>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          {item.name}
                          {item.email === 'rgoutham079@gmail.com' && <span title="Project Leader">👑</span>}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          {item.title || 'Software Engineer'}
                        </div>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.35rem', fontWeight: 800, color: medalColor }}>
                        {item.points}
                      </div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Points
                      </div>
                    </div>
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    flexWrap: 'wrap',
                    paddingTop: '0.5rem',
                    borderTop: '1px solid var(--border-subtle)',
                    fontSize: '0.72rem'
                  }}>
                    <span className="badge badge-success" style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem' }}>
                      ✓ {item.completed_tasks || 0} done
                    </span>
                    <span className="badge badge-primary" style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem' }}>
                      + {item.created_tasks || 0} tasks
                    </span>
                    <span className="badge badge-warning" style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem' }}>
                      ⚠ {item.reported_issues || 0} issues
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Registered Platform Users & Details Section */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="card-header" style={{ flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #06b6d4 0%, #0284c7 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff'
              }}>
                <Users size={18} />
              </div>
              <h2 className="card-title" style={{ marginBottom: 0, fontSize: '1.25rem' }}>
                Registered Platform Users & Details
              </h2>
              <span className="badge badge-primary">{registeredUsers.length || stats.users || 0} Members</span>
            </div>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', margin: '0.35rem 0 0 0' }}>
              All registered user accounts and details entered into DevCollab. {isOwner ? 'Visible to you as the platform Project Leader.' : 'Platform directory.'}
            </p>
          </div>
          <Link to="/users" className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Users size={14} /> Open Full Directory <ArrowRight size={14} />
          </Link>
        </div>

        {registeredUsers.length === 0 ? (
          <div className="empty-state" style={{ padding: '2.5rem 1rem' }}>
            <Users className="empty-state-icon" />
            <div className="empty-state-title">No registered users found</div>
            <p className="empty-state-desc">When users create accounts or register on the platform, their details will display here.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>User & Full Name</th>
                  <th>Email Address</th>
                  <th>Role</th>
                  <th>Registered On</th>
                  <th>Assigned Tasks</th>
                  <th>Reported Issues</th>
                  <th>Workspaces</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {registeredUsers.map((u) => {
                  const isUserOwner = u.system_role === 'OWNER' || u.email === 'rgoutham079@gmail.com';
                  return (
                    <tr
                      key={u.id}
                      style={{
                        backgroundColor: isUserOwner ? 'rgba(245, 158, 11, 0.05)' : undefined,
                        transition: 'background-color 0.15s ease'
                      }}
                    >
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            background: isUserOwner
                              ? 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)'
                              : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                            color: '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '0.95rem',
                            boxShadow: isUserOwner ? '0 0 12px rgba(245, 158, 11, 0.45)' : '0 2px 8px rgba(99, 102, 241, 0.25)',
                            flexShrink: 0
                          }}>
                            {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '0.925rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                              {u.name}
                              {isUserOwner && <span title="Project Leader">👑</span>}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                              User ID: #{u.id} {u.email === user?.email ? '(You)' : ''}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.85rem',
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
                        <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                          {new Date(u.created_at).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          {new Date(u.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
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
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981', boxShadow: '0 0 6px #10b981' }} />
                          Active
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* GitHub Activity Card */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.9) 100%)',
        border: '1px solid rgba(255, 255, 255, 0.12)'
      }}>
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff'
            }}>
              <Github size={20} />
            </div>
            <div>
              <h2 className="card-title" style={{ marginBottom: 0 }}>GitHub Integration</h2>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Real-time repository sync</span>
            </div>
          </div>
          <Link to="/github" style={{ fontSize: '0.85rem', color: '#818cf8', fontWeight: 500 }}>
            Explore Repositories <ExternalLink size={14} style={{ verticalAlign: 'middle', marginLeft: '2px' }} />
          </Link>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.25rem', maxWidth: '750px', lineHeight: '1.5' }}>
          Connect your GitHub repository to track live commits, branches, issues, and pull requests directly within your DevCollab workspace.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link to="/github" className="btn btn-secondary btn-sm" style={{ border: '1px solid rgba(255, 255, 255, 0.2)' }}>
            <Github size={14} /> Connect GitHub Account
          </Link>
          <Link to="/documentation" className="btn btn-primary btn-sm">
            <Sparkles size={14} /> Generate AI Documentation
          </Link>
        </div>
      </div>
    </div>
  );
};
