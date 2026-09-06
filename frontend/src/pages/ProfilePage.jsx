import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Calendar, FolderGit2, CheckSquare, AlertCircle, Save, Check, AlertTriangle, Github, Linkedin, Briefcase, Code } from 'lucide-react';
import api from '../services/api';

export const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [name, setName] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [title, setTitle] = useState('');
  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get('/auth/profile');
      setProfile(res.data);
      setName(res.data.name || '');
      setProfileImage(res.data.profile_image || '');
      setTitle(res.data.title || 'Software Engineer');
      setBio(res.data.bio || '');
      setSkills(res.data.skills || '');
      setGithubUrl(res.data.github_url || '');
      setLinkedinUrl(res.data.linkedin_url || '');
    } catch (err) {
      setStatusMsg({ type: 'danger', text: err.message || 'Failed to load profile' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setSaving(true);
      setStatusMsg({ type: '', text: '' });
      const res = await api.put('/auth/profile', {
        name: name.trim(),
        profile_image: profileImage.trim() || null,
        title: title.trim() || null,
        bio: bio.trim() || null,
        skills: skills.trim() || null,
        github_url: githubUrl.trim() || null,
        linkedin_url: linkedinUrl.trim() || null
      });
      updateUser(res.data);
      setProfile((prev) => ({ ...prev, ...res.data }));
      setStatusMsg({ type: 'success', text: 'Profile updated successfully!' });
      setTimeout(() => setStatusMsg({ type: '', text: '' }), 4000);
    } catch (err) {
      setStatusMsg({ type: 'danger', text: err.message || 'Failed to update profile' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
        Loading developer profile...
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Developer Profile</h1>
          <p className="page-subtitle">Manage your personal credentials and view workspace contributions</p>
        </div>
      </div>

      {statusMsg.text && (
        <div className={`alert ${statusMsg.type === 'success' ? 'alert-success' : 'alert-danger'}`}>
          {statusMsg.type === 'success' ? <Check size={18} /> : <AlertTriangle size={18} />}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--primary-light)',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <FolderGit2 size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Projects Joined</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{profile?.stats?.projects || 0}</div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--success-bg)',
            color: 'var(--success)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <CheckSquare size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Assigned Tasks</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{profile?.stats?.activeTasks || 0}</div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--warning-bg)',
            color: 'var(--warning)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <AlertCircle size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Assigned Issues</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{profile?.stats?.assignedIssues || 0}</div>
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <div className="card">
        <form onSubmit={handleSave}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.75rem' }}>
            <div style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              backgroundColor: 'var(--primary)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.85rem',
              fontWeight: 700,
              boxShadow: '0 0 15px rgba(99, 102, 241, 0.4)'
            }}>
              {name ? name[0].toUpperCase() : 'U'}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                  {name || 'Developer'}
                </h2>
                {title && <span className="badge badge-primary" style={{ fontSize: '0.72rem' }}>{title}</span>}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                <Mail size={14} /> {profile?.email}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                <Calendar size={14} /> Member since {new Date(profile?.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Developer Title / Role</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Senior Full-Stack Engineer"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Work Email</label>
              <input
                type="email"
                className="form-input"
                value={profile?.email || ''}
                disabled
                style={{ opacity: 0.6, cursor: 'not-allowed' }}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Email address cannot be changed</span>
            </div>

            <div className="form-group">
              <label className="form-label">Profile Image URL (Optional)</label>
              <input
                type="url"
                className="form-input"
                placeholder="https://example.com/avatar.png"
                value={profileImage}
                onChange={(e) => setProfileImage(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Developer Bio & Summary</label>
            <textarea
              className="form-textarea"
              placeholder="Tell the team about your engineering background, favorite tech, or key achievements..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Tech Stack & Skills (Comma-Separated)</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. React, Node.js, TypeScript, Docker, GraphQL, Python"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
            />
            {skills && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.5rem' }}>
                {skills.split(',').map((s, idx) => s.trim() && (
                  <span key={idx} className="badge badge-info" style={{ fontSize: '0.72rem', padding: '0.15rem 0.5rem' }}>
                    💻 {s.trim()}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">GitHub Profile URL</label>
              <input
                type="url"
                className="form-input"
                placeholder="https://github.com/username"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">LinkedIn Profile URL</label>
              <input
                type="url"
                className="form-input"
                placeholder="https://linkedin.com/in/username"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              <Save size={16} /> {saving ? 'Saving Changes...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
