import React, { useState, useEffect } from 'react';
import {
  Github,
  GitBranch,
  GitCommit,
  GitPullRequest,
  Star,
  GitFork,
  AlertCircle,
  ExternalLink,
  Check,
  Search,
  Key,
  FolderGit2
} from 'lucide-react';
import api from '../services/api';

export const GitHubPage = () => {
  const [account, setAccount] = useState(null);
  const [usernameInput, setUsernameInput] = useState('');
  const [tokenInput, setTokenInput] = useState('');
  const [showConnect, setShowConnect] = useState(false);

  const [repos, setRepos] = useState([]);
  const [selectedRepo, setSelectedRepo] = useState('facebook/react');
  const [repoDetails, setRepoDetails] = useState(null);
  const [commits, setCommits] = useState([]);
  const [branches, setBranches] = useState([]);
  const [issues, setIssues] = useState([]);
  const [pulls, setPulls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    loadAccount();
    loadRepos();
  }, []);

  useEffect(() => {
    if (selectedRepo) {
      loadRepoData(selectedRepo);
    }
  }, [selectedRepo]);

  const loadAccount = async () => {
    try {
      const res = await api.get('/github/account');
      if (res.data) {
        setAccount(res.data);
        setUsernameInput(res.data.github_username || '');
      }
    } catch (_) {}
  };

  const loadRepos = async () => {
    try {
      const res = await api.get('/github/repos');
      setRepos(res.data || []);
      if (res.data?.length > 0 && !selectedRepo) {
        setSelectedRepo(res.data[0].full_name);
      }
    } catch (_) {}
  };

  const loadRepoData = async (fullRepo) => {
    const parts = fullRepo.split('/');
    if (parts.length !== 2) return;
    const [owner, repo] = parts;

    try {
      setLoading(true);
      const [dRes, cRes, bRes, iRes, pRes] = await Promise.all([
        api.get(`/github/repos/${owner}/${repo}`).catch(() => ({ data: null })),
        api.get(`/github/repos/${owner}/${repo}/commits`).catch(() => ({ data: [] })),
        api.get(`/github/repos/${owner}/${repo}/branches`).catch(() => ({ data: [] })),
        api.get(`/github/repos/${owner}/${repo}/issues`).catch(() => ({ data: [] })),
        api.get(`/github/repos/${owner}/${repo}/pulls`).catch(() => ({ data: [] }))
      ]);

      const extractArray = (res) => {
        if (Array.isArray(res)) return res;
        if (Array.isArray(res?.data)) return res.data;
        if (Array.isArray(res?.data?.data)) return res.data.data;
        return [];
      };

      setRepoDetails(dRes?.data || dRes || null);
      setCommits(extractArray(cRes));
      setBranches(extractArray(bRes));
      setIssues(extractArray(iRes));
      setPulls(extractArray(pRes));
    } catch (e) {
      console.error(e);
      setCommits([]);
      setBranches([]);
      setIssues([]);
      setPulls([]);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (e) => {
    e.preventDefault();
    if (!usernameInput.trim()) return;

    try {
      await api.post('/github/connect', {
        github_username: usernameInput.trim(),
        access_token: tokenInput.trim() || null
      });
      setStatusMsg({ type: 'success', text: `Connected GitHub account @${usernameInput.trim()}` });
      setShowConnect(false);
      setTokenInput('');
      loadAccount();
      loadRepos();
    } catch (err) {
      setStatusMsg({ type: 'danger', text: err.message || 'Failed to connect account' });
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">GitHub Integration</h1>
          <p className="page-subtitle">Inspect repositories, commits, branches, issues, and pull requests directly</p>
        </div>
        <div>
          <button
            onClick={() => setShowConnect(!showConnect)}
            className="btn btn-secondary btn-sm"
          >
            <Github size={16} /> {account ? `@${account.github_username}` : 'Connect GitHub Account'}
          </button>
        </div>
      </div>

      {statusMsg.text && (
        <div className={`alert ${statusMsg.type === 'success' ? 'alert-success' : 'alert-danger'}`}>
          <AlertCircle size={18} />
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Connect Account Drawer */}
      {showConnect && (
        <div className="card" style={{ marginBottom: '1.5rem', borderColor: 'var(--primary)' }}>
          <h2 className="card-title" style={{ fontSize: '1rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Key size={16} /> Configure GitHub Credentials
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1rem' }}>
            Connect your personal GitHub account to fetch your private repositories and avoid public API rate limits. Tokens are stored securely on the backend.
          </p>

          <form onSubmit={handleConnect} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', alignItems: 'flex-end' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">GitHub Username *</label>
              <input
                type="text"
                className="form-input"
                placeholder="octocat"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                required
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Personal Access Token (Optional)</label>
              <input
                type="password"
                className="form-input"
                placeholder="ghp_xxxxxxxxxxxx"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
              />
            </div>
            <div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                Save Credentials
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Repo Selector */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            Select Repository:
          </span>
          <select
            className="form-select"
            value={selectedRepo}
            onChange={(e) => setSelectedRepo(e.target.value)}
            style={{ maxWidth: '300px' }}
          >
            {repos.map((r) => (
              <option key={r.id} value={r.full_name}>{r.full_name}</option>
            ))}
            <option value="facebook/react">facebook/react</option>
            <option value="expressjs/express">expressjs/express</option>
            <option value="nodejs/node">nodejs/node</option>
            <option value="torvalds/linux">torvalds/linux</option>
          </select>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flex: 1, minWidth: '220px' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Or enter custom owner/repo..."
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.target.value.includes('/')) {
                  setSelectedRepo(e.target.value.trim());
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Repository Details Header */}
      {repoDetails && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <h1 className="page-title" style={{ fontSize: '1.5rem', marginBottom: 0 }}>
                  {repoDetails.full_name}
                </h1>
                <span className="badge badge-primary">{repoDetails.language || 'Code'}</span>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '800px' }}>
                {repoDetails.description}
              </p>
            </div>

            <a
              href={repoDetails.html_url}
              target="_blank"
              rel="noreferrer"
              className="btn btn-secondary btn-sm"
            >
              View on GitHub <ExternalLink size={14} />
            </a>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <span className="badge badge-warning" style={{ textTransform: 'none', padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}>
              <Star size={14} /> <strong>{repoDetails.stars?.toLocaleString() || 0}</strong> stars
            </span>
            <span className="badge badge-info" style={{ textTransform: 'none', padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}>
              <GitFork size={14} /> <strong>{repoDetails.forks?.toLocaleString() || 0}</strong> forks
            </span>
            <span className="badge badge-danger" style={{ textTransform: 'none', padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}>
              <AlertCircle size={14} /> <strong>{repoDetails.open_issues?.toLocaleString() || 0}</strong> issues
            </span>
            <span className="badge badge-success" style={{ textTransform: 'none', padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}>
              <GitBranch size={14} /> Default: <code>{repoDetails.default_branch || 'main'}</code>
            </span>
          </div>
        </div>
      )}

      {/* Tabbed Content: Commits, Branches, Issues, Pull Requests */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {/* Recent Commits */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.05rem' }}>
              <GitCommit size={18} /> Recent Commits ({Array.isArray(commits) ? commits.length : 0})
            </h2>
          </div>

          {!Array.isArray(commits) || commits.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No commits found</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {(Array.isArray(commits) ? commits : []).slice(0, 8).map((c) => (
                <div
                  key={c.sha || Math.random()}
                  style={{
                    padding: '0.75rem',
                    backgroundColor: 'var(--bg-subtle)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)'
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                    {c.message}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <span>{c.author} &bull; <code>{c.sha}</code></span>
                    <span>{c.date ? new Date(c.date).toLocaleDateString() : 'Recent'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pull Requests & Branches */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Pull Requests */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.05rem' }}>
                <GitPullRequest size={18} /> Pull Requests ({Array.isArray(pulls) ? pulls.length : 0})
              </h2>
            </div>

            {!Array.isArray(pulls) || pulls.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No open pull requests recorded.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {(Array.isArray(pulls) ? pulls : []).slice(0, 5).map((pr) => (
                  <div
                    key={pr.id || pr.number || Math.random()}
                    style={{
                      padding: '0.65rem 0.75rem',
                      backgroundColor: 'var(--bg-subtle)',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '0.825rem'
                    }}
                  >
                    <div>
                      <span style={{ fontWeight: 600 }}>#{pr.number} {pr.title}</span>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>by {pr.user}</div>
                    </div>
                    <span className={`badge ${pr.state === 'open' ? 'badge-success' : 'badge-primary'}`}>
                      {pr.state}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Branches */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.05rem' }}>
                <GitBranch size={18} /> Active Branches ({Array.isArray(branches) ? branches.length : 0})
              </h2>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {(Array.isArray(branches) ? branches : []).slice(0, 12).map((b) => (
                <span
                  key={b.name || Math.random()}
                  className="badge badge-primary"
                  style={{ textTransform: 'none', padding: '0.35rem 0.65rem' }}
                >
                  🌿 {b.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
