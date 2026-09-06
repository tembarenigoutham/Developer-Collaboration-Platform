import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FolderGit2, Plus, Search, Users, Github, ArrowRight, CheckSquare, Sparkles } from 'lucide-react';
import api from '../services/api';

export const ProjectsPage = () => {
  const [search, setSearch] = useState('');
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProjects();
  }, [search]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const res = await api.get('/projects', {
        params: { search: search.trim() || undefined }
      });
      setProjects(res.data || []);
    } catch (err) {
      console.error('Failed to load projects:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Projects</h1>
          <p className="page-subtitle">Manage and collaborate on software workspaces and repositories</p>
        </div>
        <Link to="/projects/new" className="btn btn-primary">
          <Plus size={16} /> New Project
        </Link>
      </div>

      {/* Modern Search Filter */}
      <div style={{ marginBottom: '1.75rem', position: 'relative' }}>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Search size={16} style={{ position: 'absolute', left: '1rem', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '2.5rem', backgroundColor: 'var(--bg-card)' }}
            placeholder="Search projects by name, description, or repository..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3.5rem', color: 'var(--text-secondary)' }}>
          Loading workspaces...
        </div>
      ) : projects.length === 0 ? (
        <div className="empty-state">
          <FolderGit2 className="empty-state-icon" />
          <h3 className="empty-state-title">No projects found</h3>
          <p className="empty-state-desc">
            {search ? 'No projects match your search.' : 'Get started by creating your first workspace.'}
          </p>
          <Link to="/projects/new" className="btn btn-primary btn-sm">
            <Plus size={14} /> Create Project
          </Link>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '1.5rem'
        }}>
          {projects.map((p) => (
            <div
              key={p.id}
              className="card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
                  <Link to={`/projects/${p.id}`} style={{ color: 'inherit' }}>
                    {p.name}
                  </Link>
                </h2>
                <span className={`badge ${p.user_role === 'OWNER' ? 'badge-owner' : 'badge-primary'}`}>
                  {p.user_role === 'OWNER' ? '👑 PROJECT LEADER' : p.user_role}
                </span>
              </div>

              <p style={{
                color: 'var(--text-secondary)',
                fontSize: '0.875rem',
                marginBottom: '1.25rem',
                flex: 1,
                lineHeight: '1.5',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}>
                {p.description || 'No description provided.'}
              </p>

              {p.github_repo && (
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  fontSize: '0.8rem',
                  color: 'var(--text-muted)',
                  marginBottom: '1.25rem'
                }}>
                  <Github size={14} /> <span>{p.github_repo}</span>
                </div>
              )}

              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '1rem',
                borderTop: '1px solid var(--border-subtle)',
                fontSize: '0.825rem',
                color: 'var(--text-muted)'
              }}>
                <div style={{ display: 'flex', gap: '1.25rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Users size={14} /> {p.member_count} {p.member_count === 1 ? 'member' : 'members'}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <CheckSquare size={14} /> {p.task_count} tasks
                  </span>
                </div>

                <Link to={`/projects/${p.id}`} className="btn btn-secondary btn-sm" style={{ padding: '0.4rem 0.85rem' }}>
                  Open Workspace <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
