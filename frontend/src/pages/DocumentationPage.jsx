import React, { useState, useEffect } from 'react';
import {
  FileText,
  Sparkles,
  Save,
  Copy,
  Check,
  FolderGit2,
  Trash2,
  Edit,
  Download,
  AlertCircle
} from 'lucide-react';
import api from '../services/api';

export const DocumentationPage = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [documents, setDocuments] = useState([]);
  const [docTitle, setDocTitle] = useState('README.md');
  const [docContent, setDocContent] = useState('');
  const [activeDocType, setActiveDocType] = useState('readme');
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    if (selectedProjectId) {
      loadDocuments(selectedProjectId);
    }
  }, [selectedProjectId]);

  const loadProjects = async () => {
    try {
      const res = await api.get('/projects');
      setProjects(res.data || []);
      if (res.data?.length > 0) {
        setSelectedProjectId(res.data[0].id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadDocuments = async (projId) => {
    try {
      const res = await api.get(`/projects/${projId}/documents`);
      setDocuments(res.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleGenerate = async (type) => {
    if (!selectedProjectId) return;

    try {
      setGenerating(true);
      setActiveDocType(type);
      setStatusMsg({ type: '', text: '' });

      let endpoint = '/ai/generate-readme';
      let defaultTitle = 'README.md';

      if (type === 'api_docs') {
        endpoint = '/ai/generate-documentation';
        defaultTitle = 'API_DOCUMENTATION.md';
      } else if (type === 'setup_guide') {
        endpoint = '/ai/generate-documentation';
        defaultTitle = 'SETUP_GUIDE.md';
      } else if (type === 'summary') {
        endpoint = '/ai/generate-summary';
        defaultTitle = 'PROJECT_SUMMARY.md';
      }

      setDocTitle(defaultTitle);

      const res = await api.post(endpoint, {
        project_id: selectedProjectId,
        type
      });

      setDocContent(res.data.content || '');
      setStatusMsg({ type: 'success', text: `Generated ${defaultTitle} successfully!` });
    } catch (err) {
      setStatusMsg({ type: 'danger', text: err.message || 'Documentation generation failed' });
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!selectedProjectId || !docContent.trim() || !docTitle.trim()) return;

    try {
      setSaving(true);
      const res = await api.post(`/projects/${selectedProjectId}/documents`, {
        title: docTitle.trim(),
        content: docContent,
        document_type: activeDocType.toUpperCase()
      });
      setDocuments([res.data, ...documents]);
      setStatusMsg({ type: 'success', text: 'Document saved to workspace!' });
    } catch (err) {
      setStatusMsg({ type: 'danger', text: err.message || 'Failed to save document' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteDoc = async (docId) => {
    if (!window.confirm('Delete this document?')) return;
    try {
      await api.delete(`/ai/documents/${docId}`);
      setDocuments(documents.filter((d) => d.id !== docId));
    } catch (err) {
      alert(err.message || 'Failed to delete document');
    }
  };

  const handleCopy = () => {
    if (!docContent) return;
    navigator.clipboard.writeText(docContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!docContent) return;
    const blob = new Blob([docContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = docTitle;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">AI Documentation Assistant</h1>
          <p className="page-subtitle">Synthesize comprehensive Markdown technical documentation powered by AI</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <select
            className="form-select"
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            style={{ width: '220px' }}
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>📁 {p.name}</option>
            ))}
          </select>
        </div>
      </div>

      {statusMsg.text && (
        <div className={`alert ${statusMsg.type === 'success' ? 'alert-success' : 'alert-danger'}`}>
          <AlertCircle size={18} />
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Generation Buttons */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--text-secondary)' }}>
          Select Document Generator
        </h2>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => handleGenerate('readme')}
            disabled={generating}
            className="btn btn-sm"
            style={{
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              color: '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: activeDocType === 'readme' ? '0 0 16px rgba(99, 102, 241, 0.6)' : '0 2px 8px rgba(99, 102, 241, 0.3)',
              opacity: generating && activeDocType !== 'readme' ? 0.6 : 1
            }}
          >
            <Sparkles size={14} /> {generating && activeDocType === 'readme' ? 'Synthesizing...' : 'Generate README'}
          </button>
          <button
            onClick={() => handleGenerate('api_docs')}
            disabled={generating}
            className="btn btn-sm"
            style={{
              background: 'linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)',
              color: '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: activeDocType === 'api_docs' ? '0 0 16px rgba(6, 182, 212, 0.6)' : '0 2px 8px rgba(6, 182, 212, 0.3)',
              opacity: generating && activeDocType !== 'api_docs' ? 0.6 : 1
            }}
          >
            <Sparkles size={14} /> {generating && activeDocType === 'api_docs' ? 'Synthesizing...' : 'Generate API Documentation'}
          </button>
          <button
            onClick={() => handleGenerate('setup_guide')}
            disabled={generating}
            className="btn btn-sm"
            style={{
              background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
              color: '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: activeDocType === 'setup_guide' ? '0 0 16px rgba(16, 185, 129, 0.6)' : '0 2px 8px rgba(16, 185, 129, 0.3)',
              opacity: generating && activeDocType !== 'setup_guide' ? 0.6 : 1
            }}
          >
            <Sparkles size={14} /> {generating && activeDocType === 'setup_guide' ? 'Synthesizing...' : 'Generate Setup Guide'}
          </button>
          <button
            onClick={() => handleGenerate('summary')}
            disabled={generating}
            className="btn btn-sm"
            style={{
              background: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)',
              color: '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: activeDocType === 'summary' ? '0 0 16px rgba(245, 158, 11, 0.6)' : '0 2px 8px rgba(245, 158, 11, 0.3)',
              opacity: generating && activeDocType !== 'summary' ? 0.6 : 1
            }}
          >
            <Sparkles size={14} /> {generating && activeDocType === 'summary' ? 'Synthesizing...' : 'Generate Project Summary'}
          </button>
        </div>
      </div>

      {/* Editor & Preview Workspace */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(260px, 1fr)', gap: '1.5rem', alignItems: 'start' }}>
        {/* Editor Area */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <input
              type="text"
              className="form-input"
              value={docTitle}
              onChange={(e) => setDocTitle(e.target.value)}
              style={{ maxWidth: '240px', padding: '0.35rem 0.65rem', fontSize: '0.85rem' }}
              placeholder="Filename..."
            />

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {docContent && (
                <>
                  <button onClick={handleCopy} className="btn btn-secondary btn-sm" title="Copy to clipboard">
                    {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? 'Copied' : 'Copy'}
                  </button>
                  <button onClick={handleDownload} className="btn btn-secondary btn-sm" title="Download markdown file">
                    <Download size={14} /> Download
                  </button>
                  <button onClick={handleSave} disabled={saving} className="btn btn-primary btn-sm">
                    <Save size={14} /> {saving ? 'Saving...' : 'Save Document'}
                  </button>
                </>
              )}
            </div>
          </div>

          {docContent ? (
            <textarea
              className="form-textarea"
              value={docContent}
              onChange={(e) => setDocContent(e.target.value)}
              style={{
                minHeight: '480px',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.875rem',
                lineHeight: '1.6',
                backgroundColor: 'var(--bg-input)'
              }}
            />
          ) : (
            <div className="empty-state" style={{ padding: '3.5rem 1rem' }}>
              <Sparkles className="empty-state-icon" style={{ color: 'var(--primary)' }} />
              <h3 className="empty-state-title">No documentation active</h3>
              <p className="empty-state-desc">
                Click any of the AI generator buttons above to instantly synthesize technical documentation tailored to your repository.
              </p>
            </div>
          )}
        </div>

        {/* Saved Documents Sidebar */}
        <div className="card">
          <h2 className="card-title" style={{ fontSize: '1rem', marginBottom: '1rem' }}>
            Saved Project Documents ({documents.length})
          </h2>

          {documents.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No saved documents in this project.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {documents.map((d) => (
                <div
                  key={d.id}
                  style={{
                    padding: '0.75rem',
                    backgroundColor: 'var(--bg-subtle)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {d.title}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                      {new Date(d.updated_at).toLocaleDateString()}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.3rem', marginLeft: '0.5rem' }}>
                    <button
                      onClick={() => {
                        setDocTitle(d.title);
                        setDocContent(d.content);
                      }}
                      className="btn-icon"
                      style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer' }}
                      title="Load into Editor"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      onClick={() => handleDeleteDoc(d.id)}
                      className="btn-icon"
                      style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}
                      title="Delete Document"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
