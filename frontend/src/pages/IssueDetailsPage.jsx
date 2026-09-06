import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AlertCircle, ArrowLeft, Send, MessageSquare, Clock, User, CheckCircle, Shield } from 'lucide-react';
import api from '../services/api';

export const IssueDetailsPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [issue, setIssue] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    loadIssue();
  }, [id]);

  const loadIssue = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/issues/${id}`);
      setIssue(res.data);
      setComments(res.data.comments || []);
    } catch (err) {
      console.error('Failed to load issue:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    try {
      await api.put(`/issues/${id}`, { status: newStatus });
      setIssue((prev) => ({ ...prev, status: newStatus }));
    } catch (err) {
      alert(err.message || 'Failed to update status');
    }
  };

  const handleUpdatePriority = async (newPriority) => {
    try {
      await api.put(`/issues/${id}`, { priority: newPriority });
      setIssue((prev) => ({ ...prev, priority: newPriority }));
    } catch (err) {
      alert(err.message || 'Failed to update priority');
    }
  };

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setPosting(true);
      const res = await api.post(`/issues/${id}/comments`, { comment: newComment });
      setComments([...comments, res.data]);
      setNewComment('');
    } catch (err) {
      alert(err.message || 'Failed to post comment');
    } finally {
      setPosting(false);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>Loading issue details...</div>;
  }

  if (!issue) {
    return (
      <div className="empty-state">
        <AlertCircle className="empty-state-icon" />
        <h3 className="empty-state-title">Issue Not Found</h3>
        <Link to="/issues" className="btn btn-primary" style={{ marginTop: '1rem' }}>Back to Issues</Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.25rem' }}>
        <Link to="/issues" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)' }}>
          <ArrowLeft size={16} /> Back to Issues
        </Link>
      </div>

      {/* Main Issue Card */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <span className={`badge ${issue.status === 'OPEN' ? 'badge-danger' : issue.status === 'RESOLVED' ? 'badge-success' : 'badge-warning'}`}>
                {issue.status}
              </span>
              <span className="badge badge-purple">{issue.priority} PRIORITY</span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Project: <strong>{issue.project_name}</strong></span>
            </div>

            <h1 className="page-title" style={{ fontSize: '1.6rem', marginBottom: '0.75rem' }}>
              #{issue.id}: {issue.title}
            </h1>

            <div style={{ display: 'flex', gap: '1.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
              <span>Reported by <strong>{issue.reporter_name}</strong></span>
              <span>&bull;</span>
              <span>Assignee: <strong>{issue.assignee_name || 'Unassigned'}</strong></span>
              <span>&bull;</span>
              <span>Logged: {new Date(issue.created_at).toLocaleString()}</span>
              <span>&bull;</span>
              <span>Last updated: {new Date(issue.updated_at).toLocaleString()}</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <select
              value={issue.status}
              onChange={(e) => handleUpdateStatus(e.target.value)}
              className="form-select"
              style={{ width: 'auto', fontSize: '0.85rem' }}
            >
              <option value="OPEN">Mark OPEN</option>
              <option value="IN_PROGRESS">Mark IN PROGRESS</option>
              <option value="RESOLVED">Mark RESOLVED</option>
              <option value="CLOSED">Mark CLOSED</option>
            </select>

            <select
              value={issue.priority}
              onChange={(e) => handleUpdatePriority(e.target.value)}
              className="form-select"
              style={{ width: 'auto', fontSize: '0.85rem' }}
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </select>
          </div>
        </div>

        <hr style={{ borderColor: 'var(--border-subtle)', margin: '1.25rem 0' }} />

        <div style={{ color: 'var(--text-primary)', lineHeight: '1.6', fontSize: '0.95rem', whiteSpace: 'pre-wrap' }}>
          {issue.description || 'No detailed reproduction steps provided.'}
        </div>
      </div>

      {/* Discussion & Comments */}
      <div className="card">
        <h2 className="card-title" style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <MessageSquare size={18} /> Discussion ({comments.length})
        </h2>

        {comments.length === 0 ? (
          <div className="empty-state" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
            <p className="empty-state-desc" style={{ marginBottom: 0 }}>No comments or updates posted yet.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
            {comments.map((c) => (
              <div
                key={c.id}
                style={{
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-subtle)',
                  border: '1px solid var(--border-color)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--primary)',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '0.75rem'
                    }}>
                      {c.author_name ? c.author_name[0].toUpperCase() : 'U'}
                    </div>
                    <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{c.author_name}</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {new Date(c.created_at).toLocaleString()}
                  </span>
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-primary)', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>
                  {c.comment}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* New Comment Box */}
        <form onSubmit={handlePostComment}>
          <div className="form-group">
            <textarea
              className="form-textarea"
              placeholder="Leave a comment or update on this issue..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={3}
              required
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn btn-primary" disabled={posting}>
              <Send size={14} /> {posting ? 'Posting...' : 'Post Comment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
