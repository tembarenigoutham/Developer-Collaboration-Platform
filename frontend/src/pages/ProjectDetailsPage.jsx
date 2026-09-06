import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FolderGit2,
  CheckSquare,
  AlertCircle,
  GitPullRequest,
  FileText,
  Github,
  Users,
  Plus,
  ArrowLeft,
  Sparkles,
  Save,
  Check,
  Trash2,
  ExternalLink,
  Edit,
  Clock,
  User,
  Shield,
  Copy,
  MessageSquare,
  Send
} from 'lucide-react';
import api from '../services/api';

export const ProjectDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  // Tab Data States
  const [tasks, setTasks] = useState([]);
  const [issues, setIssues] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [members, setMembers] = useState([]);
  const [githubData, setGithubData] = useState(null);

  // Chat State
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

  // Drag-and-Drop state for Tasks
  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);

  // Modals & Inputs
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskForm, setTaskForm] = useState({ title: '', description: '', priority: 'MEDIUM', status: 'TODO', assigned_to: '' });

  const [showIssueModal, setShowIssueModal] = useState(false);
  const [issueForm, setIssueForm] = useState({ title: '', description: '', priority: 'MEDIUM', assigned_to: '' });

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewForm, setReviewForm] = useState({ title: '', pull_request_url: '', description: '', reviewer_id: '' });

  const [showMemberModal, setShowMemberModal] = useState(false);
  const [memberForm, setMemberForm] = useState({ email: '', role: 'DEVELOPER' });

  // AI Docs State
  const [aiGenerating, setAiGenerating] = useState(false);
  const [generatedDoc, setGeneratedDoc] = useState('');
  const [docTitle, setDocTitle] = useState('README.md');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadProjectDetails();
  }, [id]);

  // Periodic polling for team chat when chat tab is active
  useEffect(() => {
    if (activeTab === 'chat' && id) {
      const pollInterval = setInterval(async () => {
        try {
          const res = await api.get(`/projects/${id}/messages`);
          setMessages(res.data || []);
        } catch (e) {
          // ignore background polling error
        }
      }, 4000);
      return () => clearInterval(pollInterval);
    }
  }, [activeTab, id]);

  const loadProjectDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/projects/${id}`);
      setProject(res.data);
      setMembers(res.data.members || []);

      // Load sub-resources in parallel
      const [tRes, iRes, rRes, dRes, mRes] = await Promise.all([
        api.get(`/projects/${id}/tasks`).catch(() => ({ data: [] })),
        api.get(`/projects/${id}/issues`).catch(() => ({ data: [] })),
        api.get(`/projects/${id}/reviews`).catch(() => ({ data: [] })),
        api.get(`/projects/${id}/documents`).catch(() => ({ data: [] })),
        api.get(`/projects/${id}/messages`).catch(() => ({ data: [] }))
      ]);

      setTasks(tRes.data || []);
      setIssues(iRes.data || []);
      setReviews(rRes.data || []);
      setDocuments(dRes.data || []);
      setMessages(mRes.data || []);

      // Load GitHub data if repo set
      if (res.data.github_repo) {
        loadGitHubData(res.data.github_repo);
      }
    } catch (err) {
      console.error('Error loading project details:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadGitHubData = async (repoName) => {
    try {
      const parts = repoName.split('/');
      if (parts.length === 2) {
        const [owner, repo] = parts;
        const [dRes, cRes, bRes, pRes] = await Promise.all([
          api.get(`/github/repos/${owner}/${repo}`).catch(() => null),
          api.get(`/github/repos/${owner}/${repo}/commits`).catch(() => ({ data: [] })),
          api.get(`/github/repos/${owner}/${repo}/branches`).catch(() => ({ data: [] })),
          api.get(`/github/repos/${owner}/${repo}/pulls`).catch(() => ({ data: [] }))
        ]);
        setGithubData({
          details: dRes?.data || null,
          commits: cRes?.data || [],
          branches: bRes?.data || [],
          pulls: pRes?.data || []
        });
      }
    } catch (e) {
      console.error('Failed to load GitHub data:', e);
    }
  };

  // Handlers for Tasks
  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post(`/projects/${id}/tasks`, taskForm);
      setTasks([res.data, ...tasks]);
      setShowTaskModal(false);
      setTaskForm({ title: '', description: '', priority: 'MEDIUM', status: 'TODO', assigned_to: '' });
    } catch (err) {
      alert(err.message || 'Failed to create task');
    }
  };

  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    try {
      await api.put(`/tasks/${taskId}`, { status: newStatus });
      setTasks(tasks.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)));
    } catch (err) {
      alert(err.message || 'Failed to update task');
    }
  };

  // Handlers for Issues
  const handleCreateIssue = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post(`/projects/${id}/issues`, issueForm);
      setIssues([res.data, ...issues]);
      setShowIssueModal(false);
      setIssueForm({ title: '', description: '', priority: 'MEDIUM', assigned_to: '' });
    } catch (err) {
      alert(err.message || 'Failed to create issue');
    }
  };

  // Handlers for Reviews
  const handleCreateReview = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post(`/projects/${id}/reviews`, reviewForm);
      setReviews([res.data, ...reviews]);
      setShowReviewModal(false);
      setReviewForm({ title: '', pull_request_url: '', description: '', reviewer_id: '' });
    } catch (err) {
      alert(err.message || 'Failed to submit review');
    }
  };

  // Handlers for Members
  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/projects/${id}/members`, memberForm);
      setShowMemberModal(false);
      setMemberForm({ email: '', role: 'DEVELOPER' });
      loadProjectDetails();
    } catch (err) {
      alert(err.message || 'Failed to add member');
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm('Remove this member from the project?')) return;
    try {
      await api.delete(`/projects/${id}/members/${userId}`);
      setMembers(members.filter((m) => m.user_id !== userId));
    } catch (err) {
      alert(err.message || 'Failed to remove member');
    }
  };

  // AI Documentation Generation
  const handleGenerateAI = async (type) => {
    try {
      setAiGenerating(true);
      let endpoint = '/ai/generate-readme';
      if (type === 'api_docs') endpoint = '/ai/generate-documentation';
      else if (type === 'setup_guide') endpoint = '/ai/generate-documentation';
      else if (type === 'summary') endpoint = '/ai/generate-summary';

      const body = { project_id: id, type };
      const res = await api.post(endpoint, body);
      setGeneratedDoc(res.data.content || '');
      setDocTitle(type === 'readme' ? 'README.md' : type === 'api_docs' ? 'API_DOCUMENTATION.md' : type === 'setup_guide' ? 'SETUP_GUIDE.md' : 'PROJECT_SUMMARY.md');
    } catch (err) {
      alert(err.message || 'AI documentation generation failed');
    } finally {
      setAiGenerating(false);
    }
  };

  const handleSaveDocument = async () => {
    if (!generatedDoc.trim()) return;
    try {
      const res = await api.post(`/projects/${id}/documents`, {
        title: docTitle,
        content: generatedDoc,
        document_type: docTitle.replace('.md', '')
      });
      setDocuments([res.data, ...documents]);
      alert('Document saved to project documents!');
    } catch (err) {
      alert(err.message || 'Failed to save document');
    }
  };

  // Team Chat Message Send Handler
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sendingMessage) return;

    try {
      setSendingMessage(true);
      const res = await api.post(`/projects/${id}/messages`, {
        message: newMessage.trim()
      });
      setMessages((prev) => [...prev, res.data]);
      setNewMessage('');
    } catch (err) {
      alert(err.message || 'Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>Loading project workspace...</div>;
  }

  if (!project) {
    return (
      <div className="empty-state">
        <AlertCircle className="empty-state-icon" />
        <h3 className="empty-state-title">Project not found</h3>
        <Link to="/projects" className="btn btn-primary" style={{ marginTop: '1rem' }}>Back to Projects</Link>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FolderGit2, count: null },
    { id: 'chat', label: 'Team Chat', icon: MessageSquare, count: messages.length > 0 ? messages.length : null },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare, count: tasks.length },
    { id: 'issues', label: 'Issues', icon: AlertCircle, count: issues.filter(i => i.status !== 'CLOSED').length },
    { id: 'reviews', label: 'Code Reviews', icon: GitPullRequest, count: reviews.filter(r => r.status === 'PENDING').length },
    { id: 'docs', label: 'Documentation', icon: FileText, count: documents.length },
    { id: 'github', label: 'GitHub', icon: Github, count: null },
    { id: 'members', label: 'Members', icon: Users, count: members.length },
  ];

  return (
    <div>
      <div style={{ marginBottom: '1.25rem' }}>
        <Link to="/projects" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)' }}>
          <ArrowLeft size={16} /> Back to Projects
        </Link>
      </div>

      {/* Project Banner */}
      <div className="card" style={{ marginBottom: '1.5rem', paddingBottom: '0.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <h1 className="page-title" style={{ fontSize: '1.6rem', marginBottom: 0 }}>{project.name}</h1>
              <span className={`badge ${project.userRole === 'OWNER' ? 'badge-owner' : 'badge-primary'}`}>
                {project.userRole === 'OWNER' ? '👑 PROJECT LEADER' : (project.userRole || 'MEMBER')}
              </span>
            </div>
            <p className="page-subtitle" style={{ maxWidth: '800px' }}>
              {project.description || 'Collaborative software engineering workspace'}
            </p>
            {project.github_repo && (
              <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
                <Github size={15} />
                <a href={`https://github.com/${project.github_repo}`} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)' }}>
                  {project.github_repo} <ExternalLink size={12} style={{ verticalAlign: 'middle' }} />
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          gap: '0.4rem',
          borderBottom: '1px solid var(--border-color)',
          marginTop: '1.5rem',
          overflowX: 'auto',
          paddingBottom: '0.5rem'
        }}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.55rem 1rem',
                  border: isActive ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid transparent',
                  background: isActive ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                  color: isActive ? '#ffffff' : 'var(--text-secondary)',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.875rem',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  whiteSpace: 'nowrap'
                }}
              >
                <Icon size={16} style={{ color: isActive ? '#818cf8' : 'currentColor' }} /> {tab.label}
                {tab.count !== null && tab.count > 0 && (
                  <span className={`badge ${isActive ? 'badge-primary' : 'badge-info'}`} style={{ fontSize: '0.65rem', padding: '0.1rem 0.45rem' }}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          <div className="card">
            <h2 className="card-title" style={{ marginBottom: '1.25rem' }}>Project Statistics</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{
                padding: '1.1rem',
                backgroundColor: 'rgba(16, 185, 129, 0.06)',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                borderTop: '3px solid #10b981',
                borderRadius: 'var(--radius-md)'
              }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--success)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Tasks Completed</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                  {tasks.filter(t => t.status === 'DONE').length} / {tasks.length}
                </div>
              </div>

              <div style={{
                padding: '1.1rem',
                backgroundColor: 'rgba(245, 158, 11, 0.06)',
                border: '1px solid rgba(245, 158, 11, 0.2)',
                borderTop: '3px solid #f59e0b',
                borderRadius: 'var(--radius-md)'
              }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--warning)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Open Issues</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                  {issues.filter(i => i.status !== 'CLOSED').length}
                </div>
              </div>

              <div style={{
                padding: '1.1rem',
                backgroundColor: 'rgba(168, 85, 247, 0.06)',
                border: '1px solid rgba(168, 85, 247, 0.2)',
                borderTop: '3px solid #a855f7',
                borderRadius: 'var(--radius-md)'
              }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--purple)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Pending Reviews</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                  {reviews.filter(r => r.status === 'PENDING').length}
                </div>
              </div>

              <div style={{
                padding: '1.1rem',
                backgroundColor: 'rgba(99, 102, 241, 0.06)',
                border: '1px solid rgba(99, 102, 241, 0.2)',
                borderTop: '3px solid #6366f1',
                borderRadius: 'var(--radius-md)'
              }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Team Members</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                  {members.length}
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="card-title" style={{ marginBottom: '1.25rem' }}>Quick Shortcuts</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button
                onClick={() => { setActiveTab('tasks'); setShowTaskModal(true); }}
                className="btn btn-secondary"
                style={{ justifyContent: 'flex-start', border: '1px solid rgba(99, 102, 241, 0.25)' }}
              >
                <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'rgba(99, 102, 241, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8' }}>
                  <Plus size={16} />
                </div>
                <span>Create Task</span>
              </button>

              <button
                onClick={() => { setActiveTab('issues'); setShowIssueModal(true); }}
                className="btn btn-secondary"
                style={{ justifyContent: 'flex-start', border: '1px solid rgba(245, 158, 11, 0.25)' }}
              >
                <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'rgba(245, 158, 11, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fbbf24' }}>
                  <AlertCircle size={16} />
                </div>
                <span>Report New Issue</span>
              </button>

              <button
                onClick={() => { setActiveTab('reviews'); setShowReviewModal(true); }}
                className="btn btn-secondary"
                style={{ justifyContent: 'flex-start', border: '1px solid rgba(168, 85, 247, 0.25)' }}
              >
                <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'rgba(168, 85, 247, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c084fc' }}>
                  <GitPullRequest size={16} />
                </div>
                <span>Submit Pull Request</span>
              </button>

              <button
                onClick={() => { setActiveTab('docs'); handleGenerateAI('readme'); }}
                className="btn btn-primary"
                style={{ justifyContent: 'flex-start' }}
              >
                <Sparkles size={16} /> Synthesize AI Documentation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TASKS (KANBAN BOARD) */}
      {activeTab === 'tasks' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h2 className="card-title" style={{ marginBottom: 0 }}>Kanban Tasks</h2>
            <button onClick={() => setShowTaskModal(true)} className="btn btn-primary btn-sm">
              <Plus size={14} /> Add Task
            </button>
          </div>

          {/* Kanban Columns */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', alignItems: 'start' }}>
            {[
              { id: 'TODO', title: 'To Do', color: '#6366f1', border: '#6366f1', badgeClass: 'badge-primary', bg: 'linear-gradient(180deg, rgba(99, 102, 241, 0.06) 0%, var(--bg-subtle) 100%)' },
              { id: 'IN_PROGRESS', title: 'In Progress', color: '#06b6d4', border: '#06b6d4', badgeClass: 'badge-info', bg: 'linear-gradient(180deg, rgba(6, 182, 212, 0.06) 0%, var(--bg-subtle) 100%)' },
              { id: 'REVIEW', title: 'Under Review', color: '#f59e0b', border: '#f59e0b', badgeClass: 'badge-warning', bg: 'linear-gradient(180deg, rgba(245, 158, 11, 0.06) 0%, var(--bg-subtle) 100%)' },
              { id: 'DONE', title: 'Completed', color: '#10b981', border: '#10b981', badgeClass: 'badge-success', bg: 'linear-gradient(180deg, rgba(16, 185, 129, 0.06) 0%, var(--bg-subtle) 100%)' },
            ].map((col) => {
              const colTasks = tasks.filter((t) => t.status === col.id);

              return (
                <div
                  key={col.id}
                  className="card"
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'move';
                    if (dragOverColumn !== col.id) setDragOverColumn(col.id);
                  }}
                  onDragLeave={(e) => {
                    if (e.currentTarget.contains(e.relatedTarget)) return;
                    setDragOverColumn(null);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOverColumn(null);
                    const tId = e.dataTransfer.getData('text/plain') || draggedTaskId;
                    if (tId) {
                      handleUpdateTaskStatus(parseInt(tId, 10), col.id);
                    }
                  }}
                  style={{
                    background: col.bg,
                    borderTop: `3px solid ${col.border}`,
                    outline: dragOverColumn === col.id ? '2px dashed #818cf8' : 'none',
                    outlineOffset: '-2px',
                    transition: 'outline 0.15s ease',
                    padding: '1.1rem'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{
                        width: '9px',
                        height: '9px',
                        borderRadius: '50%',
                        backgroundColor: col.color,
                        boxShadow: `0 0 6px ${col.color}`
                      }} />
                      <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{col.title}</span>
                    </div>
                    <span className={`badge ${col.badgeClass}`}>{colTasks.length}</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', minHeight: '120px' }}>
                    {colTasks.length === 0 ? (
                      <div style={{
                        textAlign: 'center',
                        padding: '1.5rem',
                        color: 'var(--text-muted)',
                        fontSize: '0.8rem',
                        border: '1px dashed var(--border-subtle)',
                        borderRadius: 'var(--radius-md)'
                      }}>
                        No tasks &bull; Drop task here
                      </div>
                    ) : (
                      colTasks.map((t) => (
                        <div
                          key={t.id}
                          draggable
                          onDragStart={(e) => {
                            setDraggedTaskId(t.id);
                            e.dataTransfer.setData('text/plain', String(t.id));
                            e.dataTransfer.effectAllowed = 'move';
                          }}
                          onDragEnd={() => {
                            setDraggedTaskId(null);
                            setDragOverColumn(null);
                          }}
                          style={{
                            backgroundColor: 'var(--bg-card)',
                            border: '1px solid var(--border-color)',
                            borderRadius: 'var(--radius-md)',
                            padding: '0.9rem',
                            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.25)',
                            cursor: 'grab',
                            opacity: draggedTaskId === t.id ? 0.45 : 1,
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.4)';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = 'var(--border-color)';
                            e.currentTarget.style.transform = 'translateY(0)';
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem', gap: '0.4rem' }}>
                            <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{t.title}</span>
                            <span className={`badge ${
                              t.priority === 'CRITICAL'
                                ? 'badge-danger'
                                : t.priority === 'HIGH'
                                ? 'badge-warning'
                                : t.priority === 'MEDIUM'
                                ? 'badge-info'
                                : 'badge-primary'
                            }`} style={{ fontSize: '0.65rem' }}>
                              {t.priority}
                            </span>
                          </div>

                          {t.description && (
                            <p style={{
                              fontSize: '0.8rem',
                              color: 'var(--text-secondary)',
                              marginBottom: '0.6rem',
                              lineHeight: '1.4',
                              display: '-webkit-box',
                              WebkitLineClamp: 3,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden'
                            }}>
                              {t.description}
                            </p>
                          )}

                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            fontSize: '0.75rem',
                            color: 'var(--text-muted)',
                            paddingTop: '0.5rem',
                            borderTop: '1px solid var(--border-subtle)'
                          }}>
                            <span>{t.assignee_name ? `👤 ${t.assignee_name}` : 'Unassigned'}</span>
                            <select
                              value={t.status}
                              onChange={(e) => handleUpdateTaskStatus(t.id, e.target.value)}
                              style={{
                                background: 'var(--bg-input)',
                                color: 'var(--text-primary)',
                                border: '1px solid var(--border-color)',
                                borderRadius: '4px',
                                fontSize: '0.7rem',
                                padding: '2px 4px',
                                cursor: 'pointer'
                              }}
                            >
                              <option value="TODO">To Do</option>
                              <option value="IN_PROGRESS">In Progress</option>
                              <option value="REVIEW">Review</option>
                              <option value="DONE">Done</option>
                            </select>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: ISSUES */}
      {activeTab === 'issues' && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Project Issues</h2>
            <button onClick={() => setShowIssueModal(true)} className="btn btn-primary btn-sm">
              <Plus size={14} /> Report Issue
            </button>
          </div>

          {issues.length === 0 ? (
            <div className="empty-state">
              <AlertCircle className="empty-state-icon" />
              <div className="empty-state-title">No issues recorded</div>
              <p className="empty-state-desc">Keep track of bugs, crashes, and defects in this repository.</p>
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
                  </tr>
                </thead>
                <tbody>
                  {issues.map((iss) => (
                    <tr key={iss.id}>
                      <td>
                        <Link to={`/issues/${iss.id}`} style={{ fontWeight: 600 }}>
                          #{iss.id} {iss.title}
                        </Link>
                      </td>
                      <td>
                        <span className={`badge ${iss.status === 'OPEN' ? 'badge-danger' : iss.status === 'RESOLVED' ? 'badge-success' : 'badge-warning'}`}>
                          {iss.status}
                        </span>
                      </td>
                      <td>
                        <span className="badge badge-purple">{iss.priority}</span>
                      </td>
                      <td>{iss.reporter_name}</td>
                      <td>{iss.assignee_name || 'Unassigned'}</td>
                      <td>{iss.comment_count || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: CODE REVIEWS */}
      {activeTab === 'reviews' && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Code Reviews</h2>
            <button onClick={() => setShowReviewModal(true)} className="btn btn-primary btn-sm">
              <Plus size={14} /> Submit PR Review
            </button>
          </div>

          {reviews.length === 0 ? (
            <div className="empty-state">
              <GitPullRequest className="empty-state-icon" />
              <div className="empty-state-title">No code reviews</div>
              <p className="empty-state-desc">Submit GitHub pull requests for peer reviews and approvals.</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Review / Title</th>
                    <th>Status</th>
                    <th>Submitter</th>
                    <th>Reviewer</th>
                    <th>PR Link</th>
                  </tr>
                </thead>
                <tbody>
                  {reviews.map((r) => (
                    <tr key={r.id}>
                      <td>
                        <Link to={`/reviews/${r.id}`} style={{ fontWeight: 600 }}>
                          {r.title}
                        </Link>
                      </td>
                      <td>
                        <span className={`badge ${r.status === 'APPROVED' ? 'badge-success' : r.status === 'CHANGES_REQUESTED' ? 'badge-danger' : 'badge-warning'}`}>
                          {r.status}
                        </span>
                      </td>
                      <td>{r.submitter_name}</td>
                      <td>{r.reviewer_name || 'Unassigned'}</td>
                      <td>
                        <a href={r.pull_request_url} target="_blank" rel="noreferrer" style={{ fontSize: '0.85rem' }}>
                          View PR <ExternalLink size={12} style={{ verticalAlign: 'middle' }} />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: AI DOCUMENTATION */}
      {activeTab === 'docs' && (
        <div>
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div className="card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sparkles size={20} style={{ color: 'var(--primary)' }} />
                <h2 className="card-title">AI Documentation Assistant</h2>
              </div>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
              Synthesize production-ready Markdown technical documentation for <strong>{project.name}</strong> automatically.
            </p>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
              <button
                onClick={() => handleGenerateAI('readme')}
                disabled={aiGenerating}
                className="btn btn-sm"
                style={{
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  color: '#ffffff',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)'
                }}
              >
                <Sparkles size={14} /> {aiGenerating ? 'Synthesizing...' : 'Generate README'}
              </button>
              <button
                onClick={() => handleGenerateAI('api_docs')}
                disabled={aiGenerating}
                className="btn btn-sm"
                style={{
                  background: 'linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)',
                  color: '#ffffff',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: '0 4px 14px rgba(6, 182, 212, 0.35)'
                }}
              >
                Generate API Documentation
              </button>
              <button
                onClick={() => handleGenerateAI('setup_guide')}
                disabled={aiGenerating}
                className="btn btn-sm"
                style={{
                  background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                  color: '#ffffff',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)'
                }}
              >
                Generate Setup Guide
              </button>
              <button
                onClick={() => handleGenerateAI('summary')}
                disabled={aiGenerating}
                className="btn btn-sm"
                style={{
                  background: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)',
                  color: '#ffffff',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: '0 4px 14px rgba(245, 158, 11, 0.35)'
                }}
              >
                Generate Project Summary
              </button>
            </div>

            {generatedDoc && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <input
                    type="text"
                    className="form-input"
                    value={docTitle}
                    onChange={(e) => setDocTitle(e.target.value)}
                    style={{ maxWidth: '260px', padding: '0.35rem 0.65rem', fontSize: '0.85rem' }}
                  />
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(generatedDoc);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      className="btn btn-secondary btn-sm"
                    >
                      {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? 'Copied' : 'Copy'}
                    </button>
                    <button onClick={handleSaveDocument} className="btn btn-primary btn-sm">
                      <Save size={14} /> Save to Project Documents
                    </button>
                  </div>
                </div>

                <textarea
                  className="form-textarea"
                  value={generatedDoc}
                  onChange={(e) => setGeneratedDoc(e.target.value)}
                  style={{ minHeight: '380px', fontFamily: 'var(--font-mono)', fontSize: '0.875rem', lineHeight: '1.6' }}
                />
              </div>
            )}
          </div>

          {/* Previous Documents */}
          <div className="card">
            <h2 className="card-title" style={{ marginBottom: '1rem' }}>Saved Project Documents</h2>
            {documents.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No documents saved yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    style={{
                      padding: '1rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--bg-subtle)',
                      border: '1px solid var(--border-color)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{doc.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                        Created by {doc.creator_name} &bull; {new Date(doc.updated_at).toLocaleDateString()}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setDocTitle(doc.title);
                        setGeneratedDoc(doc.content);
                      }}
                      className="btn btn-secondary btn-sm"
                    >
                      <Edit size={14} /> View / Edit
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 6: GITHUB INTEGRATION */}
      {activeTab === 'github' && (
        <div>
          {project.github_repo ? (
            <div>
              {githubData?.details && (
                <div className="card" style={{ marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                      <h2 className="card-title" style={{ fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Github size={20} /> {githubData.details.full_name}
                      </h2>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                        {githubData.details.description}
                      </p>
                    </div>
                    <a href={githubData.details.html_url} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm">
                      Open on GitHub <ExternalLink size={14} />
                    </a>
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    <span className="badge badge-warning" style={{ textTransform: 'none', padding: '0.35rem 0.75rem' }}>
                      ⭐ <strong>{githubData.details.stars?.toLocaleString()}</strong> stars
                    </span>
                    <span className="badge badge-info" style={{ textTransform: 'none', padding: '0.35rem 0.75rem' }}>
                      🍴 <strong>{githubData.details.forks?.toLocaleString()}</strong> forks
                    </span>
                    <span className="badge badge-danger" style={{ textTransform: 'none', padding: '0.35rem 0.75rem' }}>
                      🐛 <strong>{githubData.details.open_issues?.toLocaleString()}</strong> issues
                    </span>
                    <span className="badge badge-success" style={{ textTransform: 'none', padding: '0.35rem 0.75rem' }}>
                      🌿 Default: <code>{githubData.details.default_branch}</code>
                    </span>
                  </div>
                </div>
              )}

              {/* Commits & Branches Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
                <div className="card">
                  <h3 className="card-title" style={{ fontSize: '1rem', marginBottom: '1rem' }}>Recent Commits</h3>
                  {githubData?.commits?.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                      {githubData.commits.slice(0, 7).map((c) => (
                        <div key={c.sha} style={{ padding: '0.65rem 0.85rem', backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem' }}>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{c.message}</div>
                          <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem', marginTop: '0.25rem' }}>
                            <code style={{ color: '#818cf8', background: 'rgba(99, 102, 241, 0.15)', padding: '2px 4px', borderRadius: '4px' }}>{c.sha.substring(0, 7)}</code> &bull; {c.author} &bull; {new Date(c.date).toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No commit stream loaded.</p>
                  )}
                </div>

                <div className="card">
                  <h3 className="card-title" style={{ fontSize: '1rem', marginBottom: '1rem' }}>Branches & PRs</h3>
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Branches:</div>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {githubData?.branches?.map((b) => (
                        <span key={b.name} className="badge badge-info" style={{ textTransform: 'none' }}>
                          🌿 {b.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <Github className="empty-state-icon" />
              <h3 className="empty-state-title">No GitHub Repository Connected</h3>
              <p className="empty-state-desc">Link a GitHub repository in project settings to inspect live commits, branches, and pull requests.</p>
            </div>
          )}
        </div>
      )}

      {/* TAB 7: MEMBERS */}
      {activeTab === 'members' && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Team Collaborators</h2>
            {['OWNER', 'ADMIN'].includes(project.userRole) && (
              <button onClick={() => setShowMemberModal(true)} className="btn btn-primary btn-sm">
                <Plus size={14} /> Add Member
              </button>
            )}
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Role</th>
                  <th>Joined Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {members.map((m) => (
                  <tr key={m.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          background: m.role === 'OWNER'
                            ? 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)'
                            : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                          color: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '0.85rem',
                          boxShadow: m.role === 'OWNER' ? '0 0 10px rgba(245, 158, 11, 0.4)' : 'none'
                        }}>
                          {m.name ? m.name[0].toUpperCase() : 'U'}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600 }}>{m.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{m.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${m.role === 'OWNER' ? 'badge-owner' : m.role === 'ADMIN' ? 'badge-purple' : 'badge-info'}`}>
                        {m.role === 'OWNER' ? '👑 PROJECT LEADER' : m.role}
                      </span>
                    </td>
                    <td>{new Date(m.joined_at).toLocaleDateString()}</td>
                    <td>
                      {m.role !== 'OWNER' && ['OWNER', 'ADMIN'].includes(project.userRole) && (
                        <button
                          onClick={() => handleRemoveMember(m.user_id)}
                          className="btn btn-danger btn-sm"
                          style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                        >
                          Remove
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: TEAM CHAT & DISCUSSIONS */}
      {activeTab === 'chat' && (
        <div className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', height: '640px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingBottom: '1rem',
            borderBottom: '1px solid var(--border-subtle)',
            marginBottom: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
              }}>
                <MessageSquare size={18} />
              </div>
              <div>
                <h2 className="card-title" style={{ marginBottom: 0, fontSize: '1.15rem' }}>
                  Project Team Discussion Room
                </h2>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Workspace collaboration channel for {project.name} &bull; {members.length} team members
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                Live Sync
              </span>
              <span className="badge badge-primary">{messages.length} messages</span>
            </div>
          </div>

          {/* Messages Feed */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            paddingRight: '0.5rem',
            marginBottom: '1rem'
          }}>
            {messages.length === 0 ? (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                color: 'var(--text-muted)',
                textAlign: 'center'
              }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '16px',
                  backgroundColor: 'rgba(99, 102, 241, 0.1)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem'
                }}>
                  <MessageSquare size={28} />
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                  No messages yet
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '380px' }}>
                  Kick off the conversation! Share architecture updates, ask technical questions, or leave review notes for the team.
                </p>
              </div>
            ) : (
              messages.map((msg) => {
                const isMe = msg.user_id === user?.id;
                return (
                  <div
                    key={msg.id}
                    style={{
                      display: 'flex',
                      flexDirection: isMe ? 'row-reverse' : 'row',
                      alignItems: 'flex-start',
                      gap: '0.75rem',
                      maxWidth: '85%',
                      alignSelf: isMe ? 'flex-end' : 'flex-start'
                    }}
                  >
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: isMe
                        ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
                        : msg.user_email === 'rgoutham079@gmail.com'
                        ? 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)'
                        : 'linear-gradient(135deg, #06b6d4 0%, #0284c7 100%)',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      boxShadow: isMe ? '0 0 10px rgba(99, 102, 241, 0.4)' : 'none',
                      flexShrink: 0
                    }}>
                      {msg.user_name ? msg.user_name.charAt(0).toUpperCase() : 'U'}
                    </div>

                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: isMe ? 'flex-end' : 'flex-start'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        marginBottom: '0.25rem',
                        fontSize: '0.75rem',
                        color: 'var(--text-muted)'
                      }}>
                        <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                          {isMe ? 'You' : msg.user_name}
                        </span>
                        {msg.user_title && (
                          <span className="badge badge-info" style={{ fontSize: '0.62rem', padding: '0.05rem 0.4rem' }}>
                            {msg.user_title}
                          </span>
                        )}
                        <span>{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>

                      <div style={{
                        padding: '0.75rem 1rem',
                        borderRadius: isMe ? '14px 2px 14px 14px' : '2px 14px 14px 14px',
                        backgroundColor: isMe ? 'var(--primary)' : 'var(--bg-subtle)',
                        color: isMe ? '#ffffff' : 'var(--text-primary)',
                        border: isMe ? '1px solid rgba(99, 102, 241, 0.5)' : '1px solid var(--border-color)',
                        fontSize: '0.875rem',
                        lineHeight: '1.45',
                        wordBreak: 'break-word',
                        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.15)'
                      }}>
                        {msg.message}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Message Input Box */}
          <form
            onSubmit={handleSendMessage}
            style={{
              display: 'flex',
              gap: '0.65rem',
              paddingTop: '0.75rem',
              borderTop: '1px solid var(--border-subtle)'
            }}
          >
            <input
              type="text"
              className="form-input"
              placeholder={`Send a message as ${user?.name || 'Developer'}...`}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              disabled={sendingMessage}
              style={{ flex: 1 }}
            />
            <button
              type="submit"
              className="btn btn-primary"
              disabled={sendingMessage || !newMessage.trim()}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', minWidth: '90px', justifyContent: 'center' }}
            >
              <Send size={15} /> {sendingMessage ? '...' : 'Send'}
            </button>
          </form>
        </div>
      )}

      {/* Task Creation Modal */}
      {showTaskModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 100, padding: '1rem'
        }}>
          <div className="card" style={{ maxWidth: '500px', width: '100%', backgroundColor: 'var(--bg-modal)' }}>
            <h2 className="card-title" style={{ marginBottom: '1.25rem' }}>Create New Task</h2>
            <form onSubmit={handleCreateTask}>
              <div className="form-group">
                <label className="form-label">Task Title *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Implement OAuth2 flow"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-textarea"
                  placeholder="Details, requirements, and acceptance criteria..."
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Priority</label>
                  <select
                    className="form-select"
                    value={taskForm.priority}
                    onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
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
                    value={taskForm.status}
                    onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value })}
                  >
                    <option value="TODO">To Do</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="REVIEW">Review</option>
                    <option value="DONE">Done</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Assign To</label>
                <select
                  className="form-select"
                  value={taskForm.assigned_to}
                  onChange={(e) => setTaskForm({ ...taskForm, assigned_to: e.target.value })}
                >
                  <option value="">Unassigned</option>
                  {members.map((m) => (
                    <option key={m.user_id} value={m.user_id}>{m.name} ({m.role})</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setShowTaskModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Create Task</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Issue Modal */}
      {showIssueModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 100, padding: '1rem'
        }}>
          <div className="card" style={{ maxWidth: '500px', width: '100%', backgroundColor: 'var(--bg-modal)' }}>
            <h2 className="card-title" style={{ marginBottom: '1.25rem' }}>Report Project Issue</h2>
            <form onSubmit={handleCreateIssue}>
              <div className="form-group">
                <label className="form-label">Issue Title *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Memory leak during large dataset export"
                  value={issueForm.title}
                  onChange={(e) => setIssueForm({ ...issueForm, title: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Description & Steps to Reproduce</label>
                <textarea
                  className="form-textarea"
                  placeholder="Provide logs, reproduction steps, and expected behavior..."
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
                  <label className="form-label">Assignee</label>
                  <select
                    className="form-select"
                    value={issueForm.assigned_to}
                    onChange={(e) => setIssueForm({ ...issueForm, assigned_to: e.target.value })}
                  >
                    <option value="">Unassigned</option>
                    {members.map((m) => (
                      <option key={m.user_id} value={m.user_id}>{m.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setShowIssueModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Report Issue</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Code Review Modal */}
      {showReviewModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 100, padding: '1rem'
        }}>
          <div className="card" style={{ maxWidth: '500px', width: '100%', backgroundColor: 'var(--bg-modal)' }}>
            <h2 className="card-title" style={{ marginBottom: '1.25rem' }}>Submit Pull Request for Review</h2>
            <form onSubmit={handleCreateReview}>
              <div className="form-group">
                <label className="form-label">PR Title *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Feature: Distributed cache tier"
                  value={reviewForm.title}
                  onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Pull Request URL *</label>
                <input
                  type="url"
                  className="form-input"
                  placeholder="https://github.com/owner/repo/pull/123"
                  value={reviewForm.pull_request_url}
                  onChange={(e) => setReviewForm({ ...reviewForm, pull_request_url: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Description & Review Notes</label>
                <textarea
                  className="form-textarea"
                  placeholder="Describe changes, test coverage, and areas needing attention..."
                  value={reviewForm.description}
                  onChange={(e) => setReviewForm({ ...reviewForm, description: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Assign Reviewer</label>
                <select
                  className="form-select"
                  value={reviewForm.reviewer_id}
                  onChange={(e) => setReviewForm({ ...reviewForm, reviewer_id: e.target.value })}
                >
                  <option value="">Choose Reviewer</option>
                  {members.map((m) => (
                    <option key={m.user_id} value={m.user_id}>{m.name} ({m.role})</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setShowReviewModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Submit for Review</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Member Invite Modal */}
      {showMemberModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 100, padding: '1rem'
        }}>
          <div className="card" style={{ maxWidth: '460px', width: '100%', backgroundColor: 'var(--bg-modal)' }}>
            <h2 className="card-title" style={{ marginBottom: '1.25rem' }}>Add Team Member</h2>
            <form onSubmit={handleAddMember}>
              <div className="form-group">
                <label className="form-label">Member Email *</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="colleague@example.com"
                  value={memberForm.email}
                  onChange={(e) => setMemberForm({ ...memberForm, email: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Assigned Role</label>
                <select
                  className="form-select"
                  value={memberForm.role}
                  onChange={(e) => setMemberForm({ ...memberForm, role: e.target.value })}
                >
                  <option value="DEVELOPER">Developer (Read / Write)</option>
                  <option value="ADMIN">Admin (Project Management)</option>
                  <option value="VIEWER">Viewer (Read Only)</option>
                </select>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setShowMemberModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Add to Project</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
