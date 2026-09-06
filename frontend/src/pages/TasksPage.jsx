import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckSquare, Plus, Search, Filter, Calendar, FolderGit2, User, CheckCircle2 } from 'lucide-react';
import api from '../services/api';

export const TasksPage = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [tasks, setTasks] = useState([]);
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [memberFilter, setMemberFilter] = useState('ALL');
  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);
  const [loading, setLoading] = useState(true);

  // New task modal
  const [showModal, setShowModal] = useState(false);
  const [modalForm, setModalForm] = useState({
    project_id: '',
    title: '',
    description: '',
    priority: 'MEDIUM',
    status: 'TODO'
  });

  useEffect(() => {
    loadProjectsAndTasks();
  }, []);

  useEffect(() => {
    if (selectedProjectId) {
      loadProjectTasks(selectedProjectId);
    }
  }, [selectedProjectId]);

  const loadProjectsAndTasks = async () => {
    try {
      setLoading(true);
      const pRes = await api.get('/projects');
      setProjects(pRes.data || []);

      if (pRes.data && pRes.data.length > 0) {
        const firstId = pRes.data[0].id;
        setSelectedProjectId(firstId);
        setModalForm((prev) => ({ ...prev, project_id: firstId }));
        await loadProjectTasks(firstId);
      }
    } catch (e) {
      console.error('Failed to load tasks:', e);
    } finally {
      setLoading(false);
    }
  };

  const loadProjectTasks = async (projId) => {
    try {
      const res = await api.get(`/projects/${projId}/tasks`);
      setTasks(res.data || []);
    } catch (e) {
      console.error('Failed to load project tasks:', e);
    }
  };

  const handleUpdateStatus = async (taskId, newStatus) => {
    try {
      await api.put(`/tasks/${taskId}`, { status: newStatus });
      setTasks(tasks.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)));
    } catch (err) {
      alert(err.message || 'Failed to update task');
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!modalForm.project_id || !modalForm.title.trim()) return;

    try {
      const res = await api.post(`/projects/${modalForm.project_id}/tasks`, modalForm);
      if (modalForm.project_id === selectedProjectId) {
        setTasks([res.data, ...tasks]);
      }
      setShowModal(false);
      setModalForm({
        project_id: selectedProjectId,
        title: '',
        description: '',
        priority: 'MEDIUM',
        status: 'TODO'
      });
    } catch (err) {
      alert(err.message || 'Failed to create task');
    }
  };

  // Distinct assignees for filtering
  const uniqueAssignees = Array.from(
    new Map(
      tasks
        .filter((t) => t.assigned_to && t.assignee_name)
        .map((t) => [t.assigned_to, { id: t.assigned_to, name: t.assignee_name }])
    ).values()
  );

  const filteredTasks = tasks.filter((t) => {
    const matchesSearch = !search.trim() ||
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      (t.description && t.description.toLowerCase().includes(search.toLowerCase()));
    const matchesPriority = priorityFilter === 'ALL' || t.priority === priorityFilter;
    const matchesMember =
      memberFilter === 'ALL' ||
      (memberFilter === 'UNASSIGNED' && !t.assigned_to) ||
      String(t.assigned_to) === String(memberFilter);

    return matchesSearch && matchesPriority && matchesMember;
  });

  const columns = [
    { id: 'TODO', title: 'To Do', color: '#6366f1', border: '#6366f1', badgeClass: 'badge-primary', bg: 'linear-gradient(180deg, rgba(99, 102, 241, 0.06) 0%, var(--bg-subtle) 100%)' },
    { id: 'IN_PROGRESS', title: 'In Progress', color: '#06b6d4', border: '#06b6d4', badgeClass: 'badge-info', bg: 'linear-gradient(180deg, rgba(6, 182, 212, 0.06) 0%, var(--bg-subtle) 100%)' },
    { id: 'REVIEW', title: 'Under Review', color: '#f59e0b', border: '#f59e0b', badgeClass: 'badge-warning', bg: 'linear-gradient(180deg, rgba(245, 158, 11, 0.06) 0%, var(--bg-subtle) 100%)' },
    { id: 'DONE', title: 'Done', color: '#10b981', border: '#10b981', badgeClass: 'badge-success', bg: 'linear-gradient(180deg, rgba(16, 185, 129, 0.06) 0%, var(--bg-subtle) 100%)' },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Tasks Board</h1>
          <p className="page-subtitle">Track, assign, and organize project milestones with agile Kanban workflow</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-primary">
          <Plus size={16} /> New Task
        </button>
      </div>

      {/* Filter & Controls */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ minWidth: '220px' }}>
            <select
              className="form-select"
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  📁 {p.name}
                </option>
              ))}
            </select>
          </div>

          <div style={{ flex: 1, minWidth: '200px' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Search tasks by title or details..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div style={{ width: '160px' }}>
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

          <div style={{ width: '180px' }}>
            <select
              className="form-select"
              value={memberFilter}
              onChange={(e) => setMemberFilter(e.target.value)}
            >
              <option value="ALL">All Assignees</option>
              <option value="UNASSIGNED">Unassigned</option>
              {uniqueAssignees.map((a) => (
                <option key={a.id} value={a.id}>
                  👤 {a.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Kanban Board Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>Loading Kanban board...</div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '1.25rem',
          alignItems: 'start'
        }}>
          {columns.map((col) => {
            const colTasks = filteredTasks.filter((t) => t.status === col.id);

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
                  const taskIdStr = e.dataTransfer.getData('text/plain') || draggedTaskId;
                  if (taskIdStr) {
                    handleUpdateStatus(parseInt(taskIdStr, 10), col.id);
                  }
                }}
                style={{
                  background: col.bg,
                  borderTop: `3px solid ${col.border}`,
                  outline: dragOverColumn === col.id ? '2px dashed #818cf8' : 'none',
                  outlineOffset: '-2px',
                  transition: 'outline 0.15s ease',
                  padding: '1.25rem'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      backgroundColor: col.color,
                      boxShadow: `0 0 8px ${col.color}`
                    }} />
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>{col.title}</h3>
                  </div>
                  <span className={`badge ${col.badgeClass}`}>{colTasks.length}</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', minHeight: '160px' }}>
                  {colTasks.length === 0 ? (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: '120px',
                      color: 'var(--text-muted)',
                      fontSize: '0.825rem',
                      border: '1px dashed var(--border-subtle)',
                      borderRadius: 'var(--radius-md)'
                    }}>
                      No tasks in this lane &bull; Drop task here
                    </div>
                  ) : (
                    colTasks.map((task) => (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={(e) => {
                          setDraggedTaskId(task.id);
                          e.dataTransfer.setData('text/plain', String(task.id));
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
                          padding: '1rem',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                          cursor: 'grab',
                          opacity: draggedTaskId === task.id ? 0.45 : 1,
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
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem', gap: '0.5rem' }}>
                          <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: '1.3' }}>
                            {task.title}
                          </span>
                          <span
                            className={`badge ${
                              task.priority === 'CRITICAL'
                                ? 'badge-danger'
                                : task.priority === 'HIGH'
                                ? 'badge-warning'
                                : task.priority === 'MEDIUM'
                                ? 'badge-info'
                                : 'badge-primary'
                            }`}
                            style={{ fontSize: '0.65rem' }}
                          >
                            {task.priority}
                          </span>
                        </div>

                        {task.description && (
                          <p style={{
                            fontSize: '0.825rem',
                            color: 'var(--text-secondary)',
                            marginBottom: '0.75rem',
                            lineHeight: '1.45',
                            display: '-webkit-box',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}>
                            {task.description}
                          </p>
                        )}

                        <div style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.4rem',
                          paddingTop: '0.6rem',
                          borderTop: '1px solid var(--border-subtle)',
                          fontSize: '0.75rem',
                          color: 'var(--text-muted)'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                              By: <strong style={{ color: 'var(--text-primary)' }}>{task.creator_name || 'User'}</strong>
                            </span>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                              {task.created_at ? new Date(task.created_at).toLocaleDateString() : ''}
                            </span>
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                              <span style={{
                                width: '18px',
                                height: '18px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                color: '#fff',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.6rem',
                                fontWeight: 700
                              }}>
                                {task.assignee_name ? task.assignee_name[0].toUpperCase() : '?'}
                              </span>
                              <span style={{ color: task.assignee_name ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                                {task.assignee_name || 'Unassigned'}
                              </span>
                            </span>
                            <select
                              value={task.status}
                              onChange={(e) => handleUpdateStatus(task.id, e.target.value)}
                              style={{
                                background: 'var(--bg-input)',
                                color: 'var(--text-primary)',
                                border: '1px solid var(--border-color)',
                                borderRadius: '6px',
                                fontSize: '0.725rem',
                                padding: '2px 8px',
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
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 100, padding: '1rem'
        }}>
          <div className="card" style={{ maxWidth: '480px', width: '100%', backgroundColor: 'var(--bg-modal)' }}>
            <h2 className="card-title" style={{ marginBottom: '1.25rem' }}>Add Task</h2>
            <form onSubmit={handleCreateTask}>
              <div className="form-group">
                <label className="form-label">Project *</label>
                <select
                  className="form-select"
                  value={modalForm.project_id}
                  onChange={(e) => setModalForm({ ...modalForm, project_id: e.target.value })}
                  required
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Title *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Task title..."
                  value={modalForm.title}
                  onChange={(e) => setModalForm({ ...modalForm, title: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-textarea"
                  placeholder="Task description..."
                  value={modalForm.description}
                  onChange={(e) => setModalForm({ ...modalForm, description: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Priority</label>
                  <select
                    className="form-select"
                    value={modalForm.priority}
                    onChange={(e) => setModalForm({ ...modalForm, priority: e.target.value })}
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
                    value={modalForm.status}
                    onChange={(e) => setModalForm({ ...modalForm, status: e.target.value })}
                  >
                    <option value="TODO">To Do</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="REVIEW">Review</option>
                    <option value="DONE">Done</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Create Task</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
