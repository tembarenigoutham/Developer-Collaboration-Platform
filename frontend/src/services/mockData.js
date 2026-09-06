// Pre-populated data synchronized from local database
export const INITIAL_MOCK_DATA = {
  users: [
    {
      id: 1,
      name: "Goutham Reddy",
      email: "rgoutham079@gmail.com",
      role: "Project Leader",
      system_role: "OWNER",
      profile_image: "https://github.com/tembarenigoutham.png",
      assigned_tasks_count: 1,
      reported_issues_count: 0,
      workspaces_count: 2,
      created_at: "2026-09-06T16:49:17.000Z"
    },
    {
      id: 2,
      name: "Sarah Connor",
      email: "sarah@example.com",
      role: "Software Engineer",
      system_role: "USER",
      profile_image: null,
      assigned_tasks_count: 2,
      reported_issues_count: 1,
      workspaces_count: 2,
      created_at: "2026-09-06T16:49:17.000Z"
    },
    {
      id: 3,
      name: "David Miller",
      email: "david@example.com",
      role: "Software Engineer",
      system_role: "USER",
      profile_image: null,
      assigned_tasks_count: 1,
      reported_issues_count: 1,
      workspaces_count: 2,
      created_at: "2026-09-06T16:49:17.000Z"
    },
    {
      id: 4,
      name: "Sharuu",
      email: "2303a510j7@sru.edu.in",
      role: "Software Engineer",
      system_role: "USER",
      profile_image: null,
      assigned_tasks_count: 0,
      reported_issues_count: 0,
      workspaces_count: 3,
      created_at: "2026-09-06T16:56:57.000Z"
    }
  ],

  projects: [
    {
      id: 1,
      name: "Cloud Storage Microservice",
      description: "High-throughput S3-compatible multi-cloud distributed storage microservice with chunked encryption and async multipart uploads.",
      owner_id: 1,
      owner_name: "Goutham Reddy",
      user_role: "OWNER",
      github_repo: "expressjs/express",
      tasks_total: 4,
      tasks_done: 1,
      completion_percentage: 25,
      members_count: 4,
      created_at: "2026-09-06T16:49:17.000Z",
      updated_at: "2026-09-06T16:49:17.000Z"
    },
    {
      id: 2,
      name: "DevCollab Web Client",
      description: "Production-ready React.js developer collaboration frontend dashboard with real-time Kanban and GitHub integration.",
      owner_id: 1,
      owner_name: "Goutham Reddy",
      user_role: "OWNER",
      github_repo: "facebook/react",
      tasks_total: 0,
      tasks_done: 0,
      completion_percentage: 0,
      members_count: 3,
      created_at: "2026-09-06T16:49:17.000Z",
      updated_at: "2026-09-06T16:49:17.000Z"
    },
    {
      id: 3,
      name: "capstone",
      description: "to do something",
      owner_id: 4,
      owner_name: "Sharuu",
      user_role: "DEVELOPER",
      github_repo: null,
      tasks_total: 1,
      tasks_done: 0,
      completion_percentage: 0,
      members_count: 1,
      created_at: "2026-09-06T17:38:15.000Z",
      updated_at: "2026-09-06T17:38:15.000Z"
    }
  ],

  tasks: [
    {
      id: 1,
      project_id: 1,
      project_name: "Cloud Storage Microservice",
      title: "Configure MySQL connection pool & migrations",
      description: "Set up pool connection limits, error handlers, and auto schema verification.",
      assigned_to: 2,
      assignee_name: "Sarah Connor",
      created_by: 1,
      status: "DONE",
      priority: "HIGH",
      due_date: "2026-09-10",
      created_at: "2026-09-06T16:49:17.000Z"
    },
    {
      id: 2,
      project_id: 1,
      project_name: "Cloud Storage Microservice",
      title: "Implement JWT authentication & refresh tokens",
      description: "Secure endpoints with Bearer token authentication and bcrypt hashed passwords.",
      assigned_to: 2,
      assignee_name: "Sarah Connor",
      created_by: 1,
      status: "REVIEW",
      priority: "CRITICAL",
      due_date: "2026-09-12",
      created_at: "2026-09-06T16:49:17.000Z"
    },
    {
      id: 3,
      project_id: 1,
      project_name: "Cloud Storage Microservice",
      title: "Integrate GitHub REST API endpoints",
      description: "Add commit, branch, pull request, and repository stats proxy handlers.",
      assigned_to: 3,
      assignee_name: "David Miller",
      created_by: 1,
      status: "TODO",
      priority: "MEDIUM",
      due_date: "2026-09-14",
      created_at: "2026-09-06T16:49:17.000Z"
    },
    {
      id: 4,
      project_id: 1,
      project_name: "Cloud Storage Microservice",
      title: "Build AI Documentation synthesis module",
      description: "Integrate prompt engineering for README, architecture summary, and API docs.",
      assigned_to: 1,
      assignee_name: "Goutham Reddy",
      created_by: 1,
      status: "IN_PROGRESS",
      priority: "HIGH",
      due_date: "2026-09-18",
      created_at: "2026-09-06T16:49:17.000Z"
    },
    {
      id: 5,
      project_id: 3,
      project_name: "capstone",
      title: "error",
      description: "some mistake",
      assigned_to: 4,
      assignee_name: "Sharuu",
      created_by: 4,
      status: "IN_PROGRESS",
      priority: "MEDIUM",
      due_date: "2026-09-20",
      created_at: "2026-09-06T17:38:41.000Z"
    }
  ],

  issues: [
    {
      id: 1,
      project_id: 1,
      project_name: "Cloud Storage Microservice",
      title: "Database pool timeout on concurrent batch requests",
      description: "Under high volume load, connection pool triggers timeout when queries take longer than 10s.",
      reported_by: 2,
      reporter_name: "Sarah Connor",
      assigned_to: 1,
      assignee_name: "Goutham Reddy",
      priority: "HIGH",
      status: "OPEN",
      comments_count: 2,
      created_at: "2026-09-06T16:49:17.000Z"
    },
    {
      id: 2,
      project_id: 1,
      project_name: "Cloud Storage Microservice",
      title: "Missing CORS headers on preflight OPTIONS in production",
      description: "Need to ensure Access-Control-Allow-Origin header is properly reflected on preflight.",
      reported_by: 3,
      reporter_name: "David Miller",
      assigned_to: 2,
      assignee_name: "Sarah Connor",
      priority: "MEDIUM",
      status: "RESOLVED",
      comments_count: 0,
      created_at: "2026-09-06T16:49:17.000Z"
    }
  ],

  reviews: [
    {
      id: 1,
      project_id: 1,
      project_name: "Cloud Storage Microservice",
      pull_request_url: "https://github.com/expressjs/express/pull/5432",
      title: "Feature: Centralized error handling and API health probe",
      description: "Adds unified error middleware covering 400, 401, 403, 404, 409, and 500 status codes.",
      submitted_by: 2,
      author_name: "Sarah Connor",
      reviewer_id: 1,
      reviewer_name: "Goutham Reddy",
      status: "APPROVED",
      created_at: "2026-09-06T16:49:17.000Z"
    }
  ],

  recentActivity: [
    {
      id: 1,
      type: "task",
      title: "Integrate GitHub REST API endpoints",
      user: "Goutham Reddy",
      project: "Cloud Storage Microservice",
      status: "TODO",
      date: "9/6/2026"
    },
    {
      id: 2,
      type: "task",
      title: "Build AI Documentation synthesis module",
      user: "Goutham Reddy",
      project: "Cloud Storage Microservice",
      status: "IN_PROGRESS",
      date: "9/6/2026"
    },
    {
      id: 3,
      type: "task",
      title: "Configure MySQL connection pool & migrations",
      user: "Goutham Reddy",
      project: "Cloud Storage Microservice",
      status: "DONE",
      date: "9/6/2026"
    },
    {
      id: 4,
      type: "task",
      title: "Implement JWT authentication & refresh tokens",
      user: "Goutham Reddy",
      project: "Cloud Storage Microservice",
      status: "REVIEW",
      date: "9/6/2026"
    },
    {
      id: 5,
      type: "issue",
      title: "Missing CORS headers on preflight OPTIONS in production",
      user: "David Miller",
      project: "Cloud Storage Microservice",
      status: "RESOLVED",
      date: "9/6/2026"
    },
    {
      id: 6,
      type: "issue",
      title: "Database pool timeout on concurrent batch requests",
      user: "Sarah Connor",
      project: "Cloud Storage Microservice",
      status: "OPEN",
      date: "9/6/2026"
    }
  ],

  leaderboard: [
    {
      id: 1,
      name: "Goutham Reddy",
      role: "Software Engineer",
      points: 20,
      done_count: 0,
      tasks_count: 4,
      issues_count: 0
    },
    {
      id: 2,
      name: "Sarah Connor",
      role: "Software Engineer",
      points: 15,
      done_count: 1,
      tasks_count: 0,
      issues_count: 1
    },
    {
      id: 4,
      name: "Sharuu",
      role: "Software Engineer",
      points: 5,
      done_count: 0,
      tasks_count: 1,
      issues_count: 0
    },
    {
      id: 3,
      name: "David Miller",
      role: "Software Engineer",
      points: 3,
      done_count: 0,
      tasks_count: 0,
      issues_count: 1
    }
  ],

  notifications: [
    { id: 1, type: "CODE_REVIEW", message: "Sarah submitted code review: Feature: Centralized error handling", is_read: 1, created_at: "2026-09-06T16:49:17.000Z" },
    { id: 2, type: "ISSUE_REPORTED", message: "Sarah reported issue: Database pool timeout on concurrent batch requests", is_read: 1, created_at: "2026-09-06T16:49:17.000Z" },
    { id: 3, type: "TASK_ASSIGNED", message: "You were assigned task: Configure MySQL connection pool & migrations", is_read: 1, created_at: "2026-09-06T16:49:17.000Z" },
    { id: 4, type: "REVIEW_APPROVED", message: 'Goutham Reddy approved your code review "Feature: Centralized error handling and API health probe".', is_read: 0, created_at: "2026-09-06T17:36:40.000Z" }
  ]
};

// Helper to get synced storage
export const getLocalStore = () => {
  try {
    const data = localStorage.getItem('devcollab_mock_db');
    if (data) return JSON.parse(data);
  } catch (e) {
    console.warn('LocalStorage unavailable', e);
  }
  return INITIAL_MOCK_DATA;
};

export const saveLocalStore = (data) => {
  try {
    localStorage.setItem('devcollab_mock_db', JSON.stringify(data));
  } catch (e) {
    console.warn('LocalStorage save failed', e);
  }
};
