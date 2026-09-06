import axios from 'axios';
import { getLocalStore, saveLocalStore, generateDocTemplate } from './mockData';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 8000,
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Fallback mock router for static hosting (e.g. GitHub Pages) when no backend server is reachable
const handleFallback = async (error) => {
  const config = error.config;
  if (!config) return null;

  const url = config.url || '';
  const method = (config.method || 'get').toLowerCase();
  const store = getLocalStore();

  let body = {};
  try {
    body = typeof config.data === 'string' ? JSON.parse(config.data) : config.data || {};
  } catch (_) {}

  // 1. Health Probe
  if (url.includes('/health')) {
    return {
      success: true,
      status: 'ok',
      database: 'connected',
      message: 'Developer Collaboration Platform API is operating normally',
    };
  }

  // 2. Dashboard Stats
  if (url.includes('/dashboard/stats')) {
    const statsObj = {
      projects: store.projects.length,
      tasks: store.tasks.filter((t) => t.status !== 'DONE').length,
      issues: store.issues.filter((i) => i.status === 'OPEN').length,
      reviews: store.reviews.filter((r) => r.status === 'PENDING').length,
      users: store.users.length,
    };
    return {
      success: true,
      data: {
        stats: statsObj,
        recentProjects: store.projects.slice(0, 5),
        recentActivity: store.recentActivity || [],
        registeredUsers: store.users || [],
        leaderboard: store.leaderboard || [],
      },
      stats: statsObj,
      recentProjects: store.projects.slice(0, 5),
      recentActivity: store.recentActivity || [],
      registeredUsers: store.users || [],
      leaderboard: store.leaderboard || [],
    };
  }

  // 3. Dashboard Users
  if (url.includes('/dashboard/users')) {
    if (url.includes('/activity')) {
      return { success: true, data: store.recentActivity || [] };
    }
    if (method === 'post' || method === 'put') {
      return { success: true, message: 'User updated successfully' };
    }
    return {
      success: true,
      data: store.users || [],
    };
  }

  // 4. Project Documents, Tasks, Issues, Reviews sub-routes
  const projSubMatch = url.match(/\/projects\/(\d+)\/(tasks|issues|reviews|documents|members)/);
  if (projSubMatch) {
    const projId = parseInt(projSubMatch[1]);
    const resource = projSubMatch[2];

    if (resource === 'documents') {
      if (method === 'get') {
        const pDocs = (store.documents || []).filter((d) => d.project_id === projId);
        return { success: true, data: pDocs };
      }
      if (method === 'post') {
        const newDoc = {
          id: Date.now(),
          project_id: projId,
          title: body.title || 'Technical Document',
          content: body.content || '',
          document_type: body.document_type || 'README',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        if (!store.documents) store.documents = [];
        store.documents.unshift(newDoc);
        saveLocalStore(store);
        return { success: true, data: newDoc };
      }
    }

    if (resource === 'tasks') {
      if (method === 'get') {
        const pTasks = store.tasks.filter((t) => t.project_id === projId);
        return { success: true, data: pTasks };
      }
      if (method === 'post') {
        const newTask = {
          id: Date.now(),
          project_id: projId,
          project_name: store.projects.find((p) => p.id === projId)?.name || 'Project Workspace',
          title: body.title || 'Untitled Task',
          description: body.description || '',
          status: body.status || 'TODO',
          priority: body.priority || 'MEDIUM',
          assigned_to: body.assigned_to || 1,
          assignee_name: store.users.find((u) => u.id === body.assigned_to)?.name || 'Goutham Reddy',
          due_date: body.due_date || new Date().toISOString().split('T')[0],
          created_at: new Date().toISOString(),
        };
        store.tasks.unshift(newTask);
        saveLocalStore(store);
        return { success: true, data: newTask };
      }
    }

    if (resource === 'issues') {
      if (method === 'get') {
        const pIssues = store.issues.filter((i) => i.project_id === projId);
        return { success: true, data: pIssues };
      }
      if (method === 'post') {
        const newIssue = {
          id: Date.now(),
          project_id: projId,
          project_name: store.projects.find((p) => p.id === projId)?.name || 'Project Workspace',
          title: body.title || 'New Issue',
          description: body.description || '',
          priority: body.priority || 'HIGH',
          status: 'OPEN',
          reported_by: 1,
          reporter_name: 'Goutham Reddy',
          assigned_to: body.assigned_to || 1,
          assignee_name: store.users.find((u) => u.id === body.assigned_to)?.name || 'Goutham Reddy',
          comments_count: 0,
          created_at: new Date().toISOString(),
        };
        store.issues.unshift(newIssue);
        saveLocalStore(store);
        return { success: true, data: newIssue };
      }
    }

    if (resource === 'reviews') {
      if (method === 'get') {
        const pReviews = store.reviews.filter((r) => r.project_id === projId);
        return { success: true, data: pReviews };
      }
      if (method === 'post') {
        const newRev = {
          id: Date.now(),
          project_id: projId,
          project_name: store.projects.find((p) => p.id === projId)?.name || 'Project Workspace',
          pull_request_url: body.pull_request_url || 'https://github.com/expressjs/express/pull/1',
          title: body.title || 'New Pull Request',
          description: body.description || '',
          submitted_by: 1,
          author_name: 'Goutham Reddy',
          reviewer_id: 2,
          reviewer_name: 'Sarah Connor',
          status: 'PENDING',
          created_at: new Date().toISOString(),
        };
        store.reviews.unshift(newRev);
        saveLocalStore(store);
        return { success: true, data: newRev };
      }
    }

    if (resource === 'members') {
      return { success: true, data: store.users };
    }
  }

  // 5. Projects
  if (url.includes('/projects')) {
    if (method === 'get') {
      const match = url.match(/\/projects\/(\d+)/);
      if (match) {
        const id = parseInt(match[1]);
        const project = store.projects.find((p) => p.id === id) || store.projects[0];
        const projectTasks = store.tasks.filter((t) => t.project_id === id);
        const projectIssues = store.issues.filter((i) => i.project_id === id);
        return {
          success: true,
          data: {
            ...project,
            tasks: projectTasks,
            issues: projectIssues,
            members: store.users,
          },
        };
      }
      return { success: true, data: store.projects };
    }
    if (method === 'post') {
      const newProj = {
        id: Date.now(),
        name: body.name || 'New Workspace',
        description: body.description || '',
        owner_id: 1,
        owner_name: 'Goutham Reddy',
        user_role: 'OWNER',
        github_repo: body.github_repo || null,
        tasks_total: 0,
        tasks_done: 0,
        completion_percentage: 0,
        members_count: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      store.projects.unshift(newProj);
      saveLocalStore(store);
      return { success: true, data: newProj };
    }
  }

  // 6. Tasks
  if (url.includes('/tasks')) {
    if (method === 'get') {
      return { success: true, data: store.tasks };
    }
    if (method === 'put' || method === 'patch') {
      const match = url.match(/\/tasks\/(\d+)/);
      if (match) {
        const id = parseInt(match[1]);
        const task = store.tasks.find((t) => t.id === id);
        if (task) {
          Object.assign(task, body);
          saveLocalStore(store);
          return { success: true, data: task };
        }
      }
      return { success: true };
    }
  }

  // 7. Issues
  if (url.includes('/issues')) {
    const match = url.match(/\/issues\/(\d+)/);
    if (match) {
      const id = parseInt(match[1]);
      const issue = store.issues.find((i) => i.id === id) || store.issues[0];
      if (method === 'get') {
        return {
          success: true,
          data: {
            ...issue,
            comments: [
              {
                id: 1,
                user_id: 1,
                user_name: 'Goutham Reddy',
                comment: 'Inspecting connection pool configuration.',
                created_at: '2026-09-06T18:20:12.000Z',
              },
            ],
          },
        };
      }
      if (method === 'put' || method === 'patch') {
        Object.assign(issue, body);
        saveLocalStore(store);
        return { success: true, data: issue };
      }
      if (url.includes('/comments') && method === 'post') {
        return {
          success: true,
          data: {
            id: Date.now(),
            user_id: 1,
            user_name: 'Goutham Reddy',
            comment: body.comment || '',
            created_at: new Date().toISOString(),
          },
        };
      }
    }
    return { success: true, data: store.issues };
  }

  // 8. Reviews
  if (url.includes('/reviews')) {
    const match = url.match(/\/reviews\/(\d+)/);
    if (match) {
      const id = parseInt(match[1]);
      const rev = store.reviews.find((r) => r.id === id) || store.reviews[0];
      if (method === 'get') {
        return {
          success: true,
          data: {
            ...rev,
            comments: [
              {
                id: 1,
                user_id: 1,
                user_name: 'Goutham Reddy',
                comment: 'Looks clean! Make sure stack traces are only included in development mode.',
                created_at: '2026-09-06T18:20:26.000Z',
              },
            ],
          },
        };
      }
      if (method === 'put') {
        Object.assign(rev, body);
        saveLocalStore(store);
        return { success: true, data: rev };
      }
    }
    return { success: true, data: store.reviews };
  }

  // 9. Users
  if (url.includes('/users')) {
    return { success: true, data: store.users };
  }

  // 10. Notifications
  if (url.includes('/notifications')) {
    if (method === 'get') {
      const unread = store.notifications.filter((n) => !n.is_read).length;
      return { success: true, data: store.notifications, unreadCount: unread };
    }
    if (method === 'put') {
      store.notifications.forEach((n) => {
        n.is_read = 1;
      });
      saveLocalStore(store);
      return { success: true };
    }
    if (method === 'delete') {
      return { success: true };
    }
  }

  // 11. Profile & Auth
  if (url.includes('/auth/profile')) {
    return {
      success: true,
      data: store.users[0],
    };
  }

  if (url.includes('/auth/login') || url.includes('/auth/register')) {
    const email = body.email || 'rgoutham079@gmail.com';
    const user = store.users.find((u) => u.email === email) || {
      id: 1,
      name: body.name || email.split('@')[0],
      email: email,
      role: 'Project Leader',
      system_role: 'OWNER',
      profile_image: 'https://github.com/tembarenigoutham.png',
    };
    return {
      success: true,
      data: {
        user,
        token: 'demo-jwt-token-online-sync',
      },
    };
  }

  // 12. GitHub Integration (live fetch with rich fallback)
  if (url.includes('/github')) {
    if (url.includes('/account')) {
      return {
        success: true,
        data: {
          id: 1,
          github_username: 'tembarenigoutham',
        },
      };
    }

    if (url.includes('/connect')) {
      return { success: true, message: 'GitHub account connected successfully.' };
    }

    if (url === '/github/repos' || url.endsWith('/github/repos')) {
      return {
        success: true,
        data: [
          { id: 1, name: 'react', full_name: 'facebook/react', description: 'The library for web and native user interfaces', stars: 249154, forks: 46800 },
          { id: 2, name: 'express', full_name: 'expressjs/express', description: 'Fast, unopinionated, minimalist web framework for node.', stars: 65200, forks: 15100 },
          { id: 3, name: 'Developer-Collaboration-Platform', full_name: 'tembarenigoutham/Developer-Collaboration-Platform', description: 'Full-stack Developer Collaboration Platform', stars: 1, forks: 0 },
          { id: 4, name: 'vue', full_name: 'vuejs/core', description: 'Vue.js is a progressive JavaScript framework.', stars: 45000, forks: 8000 },
        ],
      };
    }

    // Specific Repo Sub-routes: /github/repos/:owner/:repo/(commits|branches|issues|pulls)
    const repoMatch = url.match(/\/github\/repos\/([^/]+)\/([^/]+)(?:\/(commits|branches|issues|pulls))?/);
    if (repoMatch) {
      const owner = repoMatch[1];
      const repo = repoMatch[2];
      const sub = repoMatch[3];

      // Commits
      if (sub === 'commits') {
        try {
          const raw = await fetch(`https://api.github.com/repos/${owner}/${repo}/commits?per_page=15`);
          if (raw.ok) {
            const list = await raw.json();
            if (Array.isArray(list)) {
              return {
                success: true,
                data: list.map((c) => ({
                  sha: c.sha.substring(0, 7),
                  full_sha: c.sha,
                  message: c.commit?.message || 'Update repository',
                  author: c.commit?.author?.name || 'Developer',
                  date: c.commit?.author?.date || new Date().toISOString(),
                  html_url: c.html_url,
                })),
              };
            }
          }
        } catch (_) {}

        return {
          success: true,
          data: [
            { sha: '37524a1', message: '[rust-compiler] Preserve ref access location across phi joins (#37524)', author: 'Jimmy Miller', date: '2026-09-05T12:00:00Z' },
            { sha: '8425bb9', message: '[DevTools] Upgrade chrome-devtools-mcp to 1.8.0 (#37497)', author: 'Ruslan Lesiutin', date: '2026-09-04T10:00:00Z' },
            { sha: 'c21047a', message: 'Stop advertising hooks on react__get_component_by_dom_element (#37496)', author: 'Ruslan Lesiutin', date: '2026-09-03T15:00:00Z' },
            { sha: '491dd7a', message: 'fix: cleanup unmounted fiber root in concurrent mode', author: 'Sophie Alpert', date: '2026-09-02T09:00:00Z' },
            { sha: 'a1b2c3d', message: 'feat: initialize microservice structure', author: 'Goutham Reddy', date: '2026-09-01T14:00:00Z' },
          ],
        };
      }

      // Branches
      if (sub === 'branches') {
        try {
          const raw = await fetch(`https://api.github.com/repos/${owner}/${repo}/branches?per_page=20`);
          if (raw.ok) {
            const list = await raw.json();
            if (Array.isArray(list)) {
              return {
                success: true,
                data: list.map((b) => ({
                  name: b.name,
                  commit_sha: b.commit?.sha?.substring(0, 7),
                  protected: b.protected,
                })),
              };
            }
          }
        } catch (_) {}

        return {
          success: true,
          data: [
            { name: 'main', protected: true },
            { name: '0.3-stable', protected: false },
            { name: '0.4-stable', protected: false },
            { name: '0.5-stable', protected: false },
            { name: '0.8-stable', protected: false },
            { name: '0.9-stable', protected: false },
            { name: 'develop', protected: false },
          ],
        };
      }

      // Pull Requests
      if (sub === 'pulls') {
        try {
          const raw = await fetch(`https://api.github.com/repos/${owner}/${repo}/pulls?per_page=15&state=all`);
          if (raw.ok) {
            const list = await raw.json();
            if (Array.isArray(list)) {
              return {
                success: true,
                data: list.map((p) => ({
                  id: p.id,
                  number: p.number,
                  title: p.title,
                  user: p.user?.login || 'contributor',
                  state: p.state,
                  created_at: p.created_at,
                  html_url: p.html_url,
                })),
              };
            }
          }
        } catch (_) {}

        return {
          success: true,
          data: [
            { id: 37530, number: 37530, title: 'test out TestPilot', user: 'yassine-yousfi-dev', state: 'closed' },
            { id: 37529, number: 37529, title: 'docs: update resource directory', user: 'cryptotify', state: 'closed' },
            { id: 37528, number: 37528, title: '[compiler] Allow strict comparisons of ref-accessing callbacks', user: 'kolvian', state: 'open' },
            { id: 37527, number: 37527, title: '[DOM] fix: apply autofocus attribute', user: 'WofWca', state: 'open' },
            { id: 37526, number: 37526, title: 'Attach ref before commitHostMount so autoFocus sees it', user: 'NAVEENKUMARK077', state: 'open' },
          ],
        };
      }

      // Issues
      if (sub === 'issues') {
        try {
          const raw = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues?per_page=15`);
          if (raw.ok) {
            const list = await raw.json();
            if (Array.isArray(list)) {
              return {
                success: true,
                data: list.filter((i) => !i.pull_request).map((i) => ({
                  id: i.id,
                  number: i.number,
                  title: i.title,
                  user: i.user?.login || 'reporter',
                  state: i.state,
                  created_at: i.created_at,
                })),
              };
            }
          }
        } catch (_) {}

        return {
          success: true,
          data: [
            { id: 1, number: 31201, title: 'Memory leak in Suspense hydration on edge cases', user: 'gaearon', state: 'open' },
            { id: 2, number: 31195, title: 'React.forwardRef types regression in TypeScript 5.5', user: 'eps1lon', state: 'open' },
          ],
        };
      }

      // Repository Details
      try {
        const raw = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
        if (raw.ok) {
          const d = await raw.json();
          return {
            success: true,
            data: {
              id: d.id,
              name: d.name,
              full_name: d.full_name,
              description: d.description,
              stars: d.stargazers_count,
              forks: d.forks_count,
              open_issues: d.open_issues_count,
              default_branch: d.default_branch,
              html_url: d.html_url,
              language: d.language,
            },
          };
        }
      } catch (_) {}

      return {
        success: true,
        data: {
          name: repo,
          full_name: `${owner}/${repo}`,
          description: owner === 'facebook' ? 'The library for web and native user interfaces' : 'Fast, unopinionated, minimalist web framework for node.',
          stars: owner === 'facebook' ? 249154 : 65200,
          forks: owner === 'facebook' ? 46800 : 15100,
          open_issues: owner === 'facebook' ? 1204 : 150,
          default_branch: 'main',
          html_url: `https://github.com/${owner}/${repo}`,
          language: 'JavaScript',
        },
      };
    }
  }

  // 13. AI Docs synthesis fallback
  if (url.includes('/ai') || url.includes('/generate-')) {
    if (url.includes('/documents') && method === 'delete') {
      const match = url.match(/\/documents\/(\d+)/);
      if (match) {
        const docId = parseInt(match[1]);
        store.documents = (store.documents || []).filter((d) => d.id !== docId);
        saveLocalStore(store);
      }
      return { success: true, message: 'Document deleted' };
    }

    let docType = 'readme';
    if (url.includes('generate-summary') || body.type === 'summary') {
      docType = 'summary';
    } else if (url.includes('generate-documentation')) {
      docType = body.type === 'setup_guide' ? 'setup_guide' : 'api_docs';
    } else if (url.includes('generate-readme') || body.type === 'readme') {
      docType = 'readme';
    }

    const projId = body.project_id || 1;
    const project = store.projects.find((p) => p.id === projId) || store.projects[0];
    const generatedMarkdown = generateDocTemplate(docType, project);

    return {
      success: true,
      data: {
        documentType: docType.toUpperCase(),
        content: generatedMarkdown,
      },
    };
  }

  return null;
};

// Response interceptor with automatic fallback
api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const status = error.response?.status;
    const isOfflineOrStatic =
      !error.response || status === 404 || status === 405 || status === 502 || status === 503;

    if (isOfflineOrStatic) {
      try {
        const fallbackRes = await handleFallback(error);
        if (fallbackRes) {
          return fallbackRes;
        }
      } catch (e) {
        console.warn('Fallback error:', e);
      }
    }

    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }

    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred';
    return Promise.reject({
      ...error,
      message,
      status: error.response?.status,
      errors: error.response?.data?.errors,
    });
  }
);

export default api;
