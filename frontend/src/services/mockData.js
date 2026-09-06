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
  ],

  documents: [
    {
      id: 1,
      project_id: 1,
      title: "Architecture Design Document",
      content: "# Cloud Storage Microservice\n\n## Overview\nThis service provides distributed chunked uploads and high-availability storage orchestration.\n\n## Security\nAll endpoints require JWT Bearer authentication.",
      document_type: "SUMMARY",
      created_by: 1,
      created_at: "2026-09-06T16:49:17.000Z",
      updated_at: "2026-09-06T16:49:17.000Z"
    }
  ]
};

export const generateDocTemplate = (type, project) => {
  const name = project?.name || 'Cloud Storage Microservice';
  const description = project?.description || 'High-throughput S3-compatible multi-cloud distributed storage microservice with chunked encryption and async multipart uploads.';
  const repo = project?.github_repo || 'expressjs/express';

  if (type === 'readme' || type === 'README') {
    return `# ${name}

## Overview
${description}

DevCollab is an enterprise-grade developer collaboration workspace providing Kanban task management, issue tracking, peer code reviews, GitHub synchronization, and AI-assisted technical documentation.

## Features
- **Project Workspaces**: Multi-tenant project workspace management with role-based member permissions (\`OWNER\`, \`ADMIN\`, \`DEVELOPER\`, \`VIEWER\`).
- **Kanban Task Board**: Visual sprint workflow supporting \`TODO\`, \`IN_PROGRESS\`, \`REVIEW\`, and \`DONE\` statuses with priority classification.
- **Issue Tracker**: Full defect lifecycle management with comments, priority weighting, and real-time resolution status.
- **Code Reviews**: Pull request tracking with inline reviews, approval status, and change requests.
- **GitHub Integration**: Direct connection to GitHub REST APIs to inspect live branches, commits, and pull requests.
- **AI Documentation**: Automated technical specification synthesis.

## Technologies
- **Frontend**: React 18, Vite, React Router 6, Axios, Lucide Icons
- **Backend**: Node.js, Express.js, REST APIs, JWT (JSON Web Tokens), bcryptjs
- **Database**: MySQL 8.0, mysql2 connection pooling, normalized schema
- **APIs**: GitHub REST API, Google Gemini AI API

## Architecture
\`\`\`
Client (React + Vite) 
    ⬇ REST / Bearer JWT 
API Gateway (Express Router + Auth Middleware)
    ⬇ Parameterized SQL (mysql2)
Database (MySQL Normalized Tables)
\`\`\`

## Installation
\`\`\`bash
# 1. Clone repository
git clone https://github.com/${repo}.git
cd ${repo.split('/')[1] || 'project'}

# 2. Install backend dependencies
cd backend && npm install

# 3. Install frontend dependencies
cd ../frontend && npm install
\`\`\`

## Environment Variables
Create a \`.env\` file in the backend root:
\`\`\`env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=developer_platform
JWT_SECRET=your_jwt_secret
GITHUB_CLIENT_ID=your_id
\`\`\`

## API Endpoints
- \`POST /api/auth/register\` - Create account
- \`POST /api/auth/login\` - Login and receive JWT
- \`GET /api/projects\` - Retrieve projects
- \`POST /api/projects/:id/tasks\` - Create project task
- \`GET /api/projects/:id/reviews\` - Retrieve pull request reviews

## Usage
\`\`\`bash
# Run backend
cd backend && npm start

# Run frontend dev server
cd frontend && npm run dev
\`\`\`

## Future Improvements
- Webhook-based live GitHub status synchronization
- Real-time WebSockets notification broadcast
- Redis caching for frequent repository metadata
`;
  }

  if (type === 'api_docs') {
    return `# API Reference: ${name}

## Base URL
\`http://localhost:5000/api\`

## Authentication
All protected routes require an HTTP Bearer Header:
\`Authorization: Bearer <token>\`

---

### 1. Authentication Endpoints
#### \`POST /auth/register\`
Create a new developer user.

#### \`POST /auth/login\`
Authenticate and receive JWT Bearer token.

---

### 2. Project Endpoints
#### \`GET /projects\`
List all workspaces where the current user is a member.

#### \`POST /projects\`
Create a new project workspace.

---

### 3. Task Management Endpoints
#### \`GET /projects/:id/tasks\`
List all tasks filtered by status or priority.

#### \`POST /projects/:id/tasks\`
Create task in project.
`;
  }

  if (type === 'setup_guide') {
    return `# Developer Setup & Onboarding Guide

## Project: ${name}

### System Requirements
- Node.js LTS (v18+ or v20+)
- MySQL Server 8.0+
- Git CLI

### 1. Database Setup
1. Open MySQL CLI or MySQL Workbench.
2. Execute the schema script:
\`\`\`bash
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql
\`\`\`

### 2. Environment Configuration
Copy \`.env.example\` to \`.env\` in the backend folder and configure database credentials.

### 3. Start Development Servers
\`\`\`bash
cd backend && npm run dev
cd ../frontend && npm run dev
\`\`\`
`;
  }

  return `# Technical Project Summary: ${name}

## Executive Summary
${description}

### Repository
Linked GitHub repository: \`${repo}\`

### Core Pillars
1. High-availability sprint backlog management
2. Code review workflows and reviewer approvals
3. Real-time developer contribution metrics
4. Defect and incident tracking
`;
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
