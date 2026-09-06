import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  GitPullRequest,
  ArrowLeft,
  CheckCircle,
  XCircle,
  ExternalLink,
  MessageSquare,
  Send,
  AlertCircle,
  User,
  Clock
} from 'lucide-react';
import api from '../services/api';

export const ReviewDetailsPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [review, setReview] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    loadReview();
  }, [id]);

  const loadReview = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/reviews/${id}`);
      setReview(res.data);
      setComments(res.data.comments || []);
    } catch (err) {
      console.error('Failed to load code review:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (status) => {
    try {
      setUpdating(true);
      const res = await api.put(`/reviews/${id}`, { status });
      setReview(res.data);
    } catch (err) {
      alert(err.message || 'Failed to update review status');
    } finally {
      setUpdating(false);
    }
  };

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setPosting(true);
      const res = await api.post(`/reviews/${id}/comments`, { comment: newComment });
      setComments([...comments, res.data]);
      setNewComment('');
    } catch (err) {
      alert(err.message || 'Failed to post feedback');
    } finally {
      setPosting(false);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>Loading code review details...</div>;
  }

  if (!review) {
    return (
      <div className="empty-state">
        <AlertCircle className="empty-state-icon" />
        <h3 className="empty-state-title">Code Review Not Found</h3>
        <Link to="/reviews" className="btn btn-primary" style={{ marginTop: '1rem' }}>Back to Reviews</Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.25rem' }}>
        <Link to="/reviews" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)' }}>
          <ArrowLeft size={16} /> Back to Code Reviews
        </Link>
      </div>

      {/* Review Header Card */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <span className={`badge ${review.status === 'APPROVED' ? 'badge-success' : review.status === 'CHANGES_REQUESTED' ? 'badge-danger' : 'badge-warning'}`}>
                {review.status}
              </span>
              <a
                href={review.pull_request_url}
                target="_blank"
                rel="noreferrer"
                style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
              >
                GitHub Pull Request <ExternalLink size={13} />
              </a>
            </div>

            <h1 className="page-title" style={{ fontSize: '1.6rem', marginBottom: '0.5rem' }}>
              #{review.id}: {review.title}
            </h1>

            <div style={{ display: 'flex', gap: '1.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
              <span>Submitted by <strong>{review.submitter_name}</strong></span>
              <span>&bull;</span>
              <span>Assigned Reviewer: <strong>{review.reviewer_name || 'Unassigned'}</strong></span>
              <span>&bull;</span>
              <span>Project: <strong>{review.project_name}</strong></span>
              <span>&bull;</span>
              <span>{new Date(review.created_at).toLocaleString()}</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => handleUpdateStatus('CHANGES_REQUESTED')}
              disabled={updating || review.status === 'CHANGES_REQUESTED'}
              className="btn btn-secondary btn-sm"
              style={{ color: 'var(--danger)', borderColor: 'var(--danger-border)' }}
            >
              <XCircle size={14} /> Request Changes
            </button>
            <button
              onClick={() => handleUpdateStatus('APPROVED')}
              disabled={updating || review.status === 'APPROVED'}
              className="btn btn-primary btn-sm"
              style={{ backgroundColor: 'var(--success)', borderColor: 'var(--success)' }}
            >
              <CheckCircle size={14} /> Approve Review
            </button>
          </div>
        </div>

        <hr style={{ borderColor: 'var(--border-subtle)', margin: '1.25rem 0' }} />

        <div style={{ color: 'var(--text-primary)', lineHeight: '1.6', fontSize: '0.95rem', whiteSpace: 'pre-wrap' }}>
          {review.description || 'No description provided with this pull request.'}
        </div>
      </div>

      {/* Review Comments */}
      <div className="card">
        <h2 className="card-title" style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <MessageSquare size={18} /> Review Comments & Feedback ({comments.length})
        </h2>

        {comments.length === 0 ? (
          <div className="empty-state" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
            <p className="empty-state-desc" style={{ marginBottom: 0 }}>No comments or code review feedback yet.</p>
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

        <form onSubmit={handlePostComment}>
          <div className="form-group">
            <textarea
              className="form-textarea"
              placeholder="Leave review comments, code feedback, or suggestions..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={3}
              required
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn btn-primary" disabled={posting}>
              <Send size={14} /> {posting ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
