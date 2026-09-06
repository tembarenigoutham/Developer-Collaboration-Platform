import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Plus, Search, Filter, MessageSquare, Clock } from 'lucide-react';
import api from '../services/api';

export const IssuesPage = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [issues, setIssues] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  // Create issue modal
  const [showModal, setShowModal] = useState(false);
  const [issueForm, setIssueForm] = useState({
    project_id: '',
    title: '',
    description: '',
    priority: 'MEDIUM',
    status: 'OPEN'
  });

  useEffect(() => {
    loadProjectsAndIssues();
  }, []);

  useEffect(() => {
    if (selectedProjectId) {
      loadProjectIssues(selectedProjectId);
    }
  }, [selectedProjectId]);

  const loadProjectsAndIssues = async () => {
    try {
      setLoading(true);
      const res = await api.get('/projects');
      setProjects(res.data || []);
      if (res.data?.length > 0) {
        const firstId = res.data[0].id;
        setSelectedProjectId(firstId);
        setIssueForm((prev) => ({ ...prev, project_id: firstId }));
        await loadProjectIssues(firstId);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadProjectIssues = async (projId) => {
    try {
      const res = await api.get(`/projects/${projId}/issues`);
      setIssues(res.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateIssue = async (e) => {
    e.preventDefault();
    if (!issueForm.project_id || !issueForm.title.trim()) return;

    try {
      const res = await api.post(`/projects/${issueForm.project_id}/issues`, issueForm);
      if (issueForm.project_id === selectedProjectId) {
        setIssues([res.data, ...issues]);
      }
      setShowModal(false);
      setIssueForm({
        project_id: selectedProjectId,
        title: '',
        description: '',
        priority: 'MEDIUM',
        status: 'OPEN'
      });
    } catch (err) {
      alert(err.message || 'Failed to create issue');
    }
  };

  const filtered = issues.filter((iss) => {
    const matchesSearch = !search.trim() ||
      iss.title.toLowerCase().includes(search.toLowerCase()) ||
      (iss.description && iss.description.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === 'ALL' || iss.status === statusFilter;
    const matchesPriority = priorityFilter === 'ALL' || iss.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Issue Tracker</h1>
          <p className="page-subtitle">Track software bugs, defect lifecycles, and feature requests</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-primary">
          <Plus size={16} /> New Issue
        </button>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ minWidth: '220px' }}>
            <select
              className="form-select"
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>📁 {p.name}</option>
              ))}
            </select>
          </div>

          <div style={{ flex: 1, minWidth: '200px' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Search issues by title or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div style={{ width: '150px' }}>
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>

          <div style={{ width: '150px' }}>
            <select
              className="form-select"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <option value="ALL">All Priorities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0 }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>Loading issues...</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <AlertCircle className="empty-state-icon" />
            <h3 className="empty-state-title">No issues found</h3>
            <p className="empty-state-desc">There are no open defect tickets matching your query.</p>
            <button onClick={() => setShowModal(true)} className="btn btn-primary btn-sm">
              <Plus size={14} /> Report Issue
            </button>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Issue</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Reporter</th>
                  <th>Assignee</th>
                  <th>Comments</th>
                  <th>Reported</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((iss) => (
                  <tr key={iss.id}>
                    <td>
                      <Link to={`/issues/${iss.id}`} style={{ fontWeight: 600 }}>
                        #{iss.id} {iss.title}
                      </Link>
                    </td>
                    <td>
                      <span className={`badge ${
                        iss.status === 'OPEN'
                          ? 'badge-danger'
                          : iss.status === 'RESOLVED'
                          ? 'badge-success'
                          : iss.status === 'IN_PROGRESS'
                          ? 'badge-info'
                          : 'badge-primary'
                      }`}>
                        {iss.status}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${
                        iss.priority === 'CRITICAL'
                          ? 'badge-danger'
                          : iss.priority === 'HIGH'
                          ? 'badge-warning'
                          : iss.priority === 'MEDIUM'
                          ? 'badge-info'
                          : 'badge-primary'
                      }`}>
                        {iss.priority}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <div style={{
                          width: '26px',
                          height: '26px',
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                          color: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          flexShrink: 0
                        }}>
                          {iss.reporter_name ? iss.reporter_name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.85rem' }}>
                            {iss.reporter_name}
                          </div>
                          {iss.reporter_email && (
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                              {iss.reporter_email}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>{iss.assignee_name || 'Unassigned'}</td>
                    <td>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                        <MessageSquare size={13} /> {iss.comment_count || 0}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-muted)' }}>
                      {new Date(iss.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 100, padding: '1rem'
        }}>
          <div className="card" style={{ maxWidth: '500px', width: '100%', backgroundColor: 'var(--bg-modal)' }}>
            <h2 className="card-title" style={{ marginBottom: '1.25rem' }}>Report Issue</h2>
            <form onSubmit={handleCreateIssue}>
              <div className="form-group">
                <label className="form-label">Project *</label>
                <select
                  className="form-select"
                  value={issueForm.project_id}
                  onChange={(e) => setIssueForm({ ...issueForm, project_id: e.target.value })}
                  required
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Issue Title *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Unhandled promise rejection on logout"
                  value={issueForm.title}
                  onChange={(e) => setIssueForm({ ...issueForm, title: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description & Steps</label>
                <textarea
                  className="form-textarea"
                  placeholder="Expected vs actual behavior, stack traces..."
                  value={issueForm.description}
                  onChange={(e) => setIssueForm({ ...issueForm, description: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Priority</label>
                  <select
                    className="form-select"
                    value={issueForm.priority}
                    onChange={(e) => setIssueForm({ ...issueForm, priority: e.target.value })}
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    className="form-select"
                    value={issueForm.status}
                    onChange={(e) => setIssueForm({ ...issueForm, status: e.target.value })}
                  >
                    <option value="OPEN">Open</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="RESOLVED">Resolved</option>
                    <option value="CLOSED">Closed</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Report Issue</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
