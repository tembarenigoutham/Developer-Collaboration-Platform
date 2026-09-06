import axios from 'axios';
import { getLocalStore, saveLocalStore } from './mockData';

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
const handleFallback = (error) => {
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
    return Promise.resolve({
      success: true,
      status: 'ok',
      database: 'connected',
      message: 'Developer Collaboration Platform API is operating normally'
    });
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
    return Promise.resolve({
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
    });
  }

  // 3. Dashboard Users
  if (url.includes('/dashboard/users')) {
    if (url.includes('/activity')) {
      return Promise.resolve({ success: true, data: store.recentActivity || [] });
    }
    if (method === 'post' || method === 'put') {
      return Promise.resolve({ success: true, message: 'User updated successfully' });
    }
    return Promise.resolve({
      success: true,
      data: store.users || []
    });
  }

  // 4. Project Tasks, Issues, Reviews sub-routes
  const projSubMatch = url.match(/\/projects\/(\d+)\/(tasks|issues|reviews|documents|members)/);
  if (projSubMatch) {
    const projId = parseInt(projSubMatch[1]);
    const resource = projSubMatch[2];

    if (resource === 'tasks') {
      if (method === 'get') {
        const pTasks = store.tasks.filter((t) => t.project_id === projId);
        return Promise.resolve({ success: true, data: pTasks });
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
        return Promise.resolve({ success: true, data: newTask });
      }
    }

    if (resource === 'issues') {
      if (method === 'get') {
        const pIssues = store.issues.filter((i) => i.project_id === projId);
        return Promise.resolve({ success: true, data: pIssues });
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
        return Promise.resolve({ success: true, data: newIssue });
      }
    }

    if (resource === 'reviews') {
      if (method === 'get') {
        const pReviews = store.reviews.filter((r) => r.project_id === projId);
        return Promise.resolve({ success: true, data: pReviews });
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
        return Promise.resolve({ success: true, data: newRev });
      }
    }

    if (resource === 'members') {
      return Promise.resolve({ success: true, data: store.users });
    }

    if (resource === 'documents') {
      return Promise.resolve({ success: true, data: [] });
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
        return Promise.resolve({
          success: true,
          data: {
            ...project,
            tasks: projectTasks,
            issues: projectIssues,
            members: store.users,
          },
        });
      }
      return Promise.resolve({ success: true, data: store.projects });
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
      return Promise.resolve({ success: true, data: newProj });
    }
  }

  // 6. Tasks
  if (url.includes('/tasks')) {
    if (method === 'get') {
      return Promise.resolve({ success: true, data: store.tasks });
    }
    if (method === 'put' || method === 'patch') {
      const match = url.match(/\/tasks\/(\d+)/);
      if (match) {
        const id = parseInt(match[1]);
        const task = store.tasks.find((t) => t.id === id);
        if (task) {
          Object.assign(task, body);
          saveLocalStore(store);
          return Promise.resolve({ success: true, data: task });
        }
      }
      return Promise.resolve({ success: true });
    }
  }

  // 7. Issues
  if (url.includes('/issues')) {
    const match = url.match(/\/issues\/(\d+)/);
    if (match) {
      const id = parseInt(match[1]);
      const issue = store.issues.find((i) => i.id === id) || store.issues[0];
      if (method === 'get') {
        return Promise.resolve({
          success: true,
          data: {
            ...issue,
            comments: [
              {
                id: 1,
                user_id: 1,
                user_name: 'Goutham Reddy',
                comment: 'Inspecting connection pool configuration.',
                created_at: '2026-09-06T18:20:12.000Z'
              }
            ]
          }
        });
      }
      if (method === 'put' || method === 'patch') {
        Object.assign(issue, body);
        saveLocalStore(store);
        return Promise.resolve({ success: true, data: issue });
      }
      if (url.includes('/comments') && method === 'post') {
        return Promise.resolve({
          success: true,
          data: {
            id: Date.now(),
            user_id: 1,
            user_name: 'Goutham Reddy',
            comment: body.comment || '',
            created_at: new Date().toISOString()
          }
        });
      }
    }
    return Promise.resolve({ success: true, data: store.issues });
  }

  // 8. Reviews
  if (url.includes('/reviews')) {
    const match = url.match(/\/reviews\/(\d+)/);
    if (match) {
      const id = parseInt(match[1]);
      const rev = store.reviews.find((r) => r.id === id) || store.reviews[0];
      if (method === 'get') {
        return Promise.resolve({
          success: true,
          data: {
            ...rev,
            comments: [
              {
                id: 1,
                user_id: 1,
                user_name: 'Goutham Reddy',
                comment: 'Looks clean! Make sure stack traces are only included in development mode.',
                created_at: '2026-09-06T18:20:26.000Z'
              }
            ]
          }
        });
      }
      if (method === 'put') {
        Object.assign(rev, body);
        saveLocalStore(store);
        return Promise.resolve({ success: true, data: rev });
      }
    }
    return Promise.resolve({ success: true, data: store.reviews });
  }

  // 9. Users
  if (url.includes('/users')) {
    return Promise.resolve({ success: true, data: store.users });
  }

  // 10. Notifications
  if (url.includes('/notifications')) {
    if (method === 'get') {
      const unread = store.notifications.filter((n) => !n.is_read).length;
      return Promise.resolve({ success: true, data: store.notifications, unreadCount: unread });
    }
    if (method === 'put') {
      store.notifications.forEach((n) => {
        n.is_read = 1;
      });
      saveLocalStore(store);
      return Promise.resolve({ success: true });
    }
    if (method === 'delete') {
      return Promise.resolve({ success: true });
    }
  }

  // 11. Profile & Auth
  if (url.includes('/auth/profile')) {
    return Promise.resolve({
      success: true,
      data: store.users[0]
    });
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
    return Promise.resolve({
      success: true,
      data: {
        user,
        token: 'demo-jwt-token-online-sync',
      },
    });
  }

  // 12. GitHub Integration fallback
  if (url.includes('/github')) {
    return Promise.resolve({
      success: true,
      data: {
        account: {
          username: 'tembarenigoutham',
          avatar_url: 'https://github.com/tembarenigoutham.png',
          repos_count: 12
        },
        repos: [
          {
            id: 1,
            name: 'Developer-Collaboration-Platform',
            full_name: 'tembarenigoutham/Developer-Collaboration-Platform',
            stars: 1,
            forks: 0,
            open_issues: 0,
            default_branch: 'main'
          }
        ]
      }
    });
  }

  // 13. AI Docs synthesis fallback
  if (url.includes('/ai') || url.includes('/generate-doc')) {
    return Promise.resolve({
      success: true,
      data: {
        document: {
          id: Date.now(),
          title: body.title || 'Technical Documentation',
          content: `# ${body.title || 'Project Documentation'}\n\nAutomated synthesis generated for ${body.project_name || 'Cloud Storage Microservice'}.\n\n### System Overview\nHigh-availability distributed developer collaboration platform.\n\n### Architecture & Security\n- Stateless JWT bearer token authentication\n- Parameterized SQL schema\n- Real-time sprint task synchronization`,
          document_type: body.document_type || 'README'
        }
      }
    });
  }

  return null;
};

// Response interceptor with automatic fallback
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status = error.response?.status;
    const isOfflineOrStatic =
      !error.response || status === 404 || status === 405 || status === 502 || status === 503;

    if (isOfflineOrStatic) {
      try {
        const fallbackRes = handleFallback(error);
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
