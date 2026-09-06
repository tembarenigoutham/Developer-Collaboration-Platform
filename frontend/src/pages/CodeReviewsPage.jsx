import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { GitPullRequest, Plus, Search, ExternalLink, CheckCircle2, Clock, XCircle } from 'lucide-react';
import api from '../services/api';

export const CodeReviewsPage = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [reviews, setReviews] = useState([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  // Submit Review Modal
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    project_id: '',
    title: '',
    pull_request_url: '',
    description: ''
  });

  useEffect(() => {
    loadProjectsAndReviews();
  }, []);

  useEffect(() => {
    if (selectedProjectId) {
      loadProjectReviews(selectedProjectId);
    }
  }, [selectedProjectId]);

  const loadProjectsAndReviews = async () => {
    try {
      setLoading(true);
      const res = await api.get('/projects');
      setProjects(res.data || []);
      if (res.data?.length > 0) {
        const firstId = res.data[0].id;
        setSelectedProjectId(firstId);
        setForm((prev) => ({ ...prev, project_id: firstId }));
        await loadProjectReviews(firstId);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadProjectReviews = async (projId) => {
    try {
      const res = await api.get(`/projects/${projId}/reviews`);
      setReviews(res.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!form.project_id || !form.title.trim() || !form.pull_request_url.trim()) return;

    try {
      const res = await api.post(`/projects/${form.project_id}/reviews`, form);
      if (form.project_id === selectedProjectId) {
        setReviews([res.data, ...reviews]);
      }
      setShowModal(false);
      setForm({
        project_id: selectedProjectId,
        title: '',
        pull_request_url: '',
        description: ''
      });
    } catch (err) {
      alert(err.message || 'Failed to submit review');
    }
  };

  const filtered = reviews.filter((r) => {
    return statusFilter === 'ALL' || r.status === statusFilter;
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Code Reviews</h1>
          <p className="page-subtitle">Conduct peer reviews, review pull requests, and manage approval workflows</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-primary">
          <Plus size={16} /> Submit PR Review
        </button>
      </div>

      {/* Filter */}
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

          <div style={{ width: '180px' }}>
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="CHANGES_REQUESTED">Changes Requested</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0 }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>Loading reviews...</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <GitPullRequest className="empty-state-icon" />
            <h3 className="empty-state-title">No code reviews found</h3>
            <p className="empty-state-desc">Submit a GitHub pull request URL for peer review and approvals.</p>
            <button onClick={() => setShowModal(true)} className="btn btn-primary btn-sm">
              <Plus size={14} /> Submit PR Review
            </button>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Pull Request / Title</th>
                  <th>Status</th>
                  <th>Submitted By</th>
                  <th>Reviewer</th>
                  <th>Comments</th>
                  <th>GitHub PR</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <Link to={`/reviews/${r.id}`} style={{ fontWeight: 600 }}>
                        #{r.id} {r.title}
                      </Link>
                    </td>
                    <td>
                      <span className={`badge ${r.status === 'APPROVED' ? 'badge-success' : r.status === 'CHANGES_REQUESTED' ? 'badge-danger' : 'badge-warning'}`}>
                        {r.status}
                      </span>
                    </td>
                    <td>{r.submitter_name}</td>
                    <td>{r.reviewer_name || 'Unassigned'}</td>
                    <td>{r.comment_count || 0}</td>
                    <td>
                      <a href={r.pull_request_url} target="_blank" rel="noreferrer" style={{ fontSize: '0.85rem' }}>
                        View PR <ExternalLink size={12} style={{ verticalAlign: 'middle' }} />
                      </a>
                    </td>
                    <td style={{ color: 'var(--text-muted)' }}>
                      {new Date(r.created_at).toLocaleDateString()}
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
            <h2 className="card-title" style={{ marginBottom: '1.25rem' }}>Submit Pull Request Review</h2>
            <form onSubmit={handleSubmitReview}>
              <div className="form-group">
                <label className="form-label">Project *</label>
                <select
                  className="form-select"
                  value={form.project_id}
                  onChange={(e) => setForm({ ...form, project_id: e.target.value })}
                  required
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Pull Request Title *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Implement refresh tokens and session revoke"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Pull Request URL *</label>
                <input
                  type="url"
                  className="form-input"
                  placeholder="https://github.com/org/repo/pull/45"
                  value={form.pull_request_url}
                  onChange={(e) => setForm({ ...form, pull_request_url: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Summary & Testing Instructions</label>
                <textarea
                  className="form-textarea"
                  placeholder="Context, architectural trade-offs, and verification commands..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Submit for Review</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
