# DevCollab — Full-Stack Developer Collaboration Platform

> A production-grade, full-stack developer workspace and team collaboration platform built with React, Vite, Node.js, Express, and MySQL.

[![Deploy to GitHub Pages](https://github.com/tembarenigoutham/Developer-Collaboration-Platform/actions/workflows/deploy.yml/badge.svg)](https://github.com/tembarenigoutham/Developer-Collaboration-Platform/actions/workflows/deploy.yml)
[![CI Build & Test](https://github.com/tembarenigoutham/Developer-Collaboration-Platform/actions/workflows/ci.yml/badge.svg)](https://github.com/tembarenigoutham/Developer-Collaboration-Platform/actions/workflows/ci.yml)

🌐 **Live Demo (GitHub Pages):** [https://tembarenigoutham.github.io/Developer-Collaboration-Platform/](https://tembarenigoutham.github.io/Developer-Collaboration-Platform/)

---

## 1. Project Overview

**DevCollab** is an all-in-one developer productivity and collaboration platform designed for modern engineering teams. It brings together sprint task management, defect tracking, pull request code reviews, GitHub repository insights, and AI-assisted technical documentation synthesis into a unified, responsive developer interface.

---

## 2. Key Features

- 🔐 **Authentication & RBAC**:
  - Secure registration and login with bcrypt password hashing (10 salt rounds).
  - Stateless JSON Web Tokens (JWT) with authorization middleware.
  - Role-based permissions across project workspaces (`OWNER`, `ADMIN`, `DEVELOPER`, `VIEWER`).
- 📁 **Project Management**:
  - Multi-tenant project workspaces with member management and role delegation.
  - Project overview tab with live completion statistics and GitHub repository linking.
- 📋 **Kanban Task Board**:
  - Visual milestone tracking across `TODO`, `IN_PROGRESS`, `REVIEW`, and `DONE` lanes.
  - Priority levels (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`) and assignee indicators.
- 🐛 **Issue Tracker**:
  - Defect and enhancement ticket tracking with real-time comments and discussion threads.
  - Status management (`OPEN`, `IN_PROGRESS`, `RESOLVED`, `CLOSED`) and priority filters.
- 🔍 **Peer Code Reviews**:
  - GitHub Pull Request submission, assignment of reviewers, and status workflows (`PENDING`, `APPROVED`, `CHANGES_REQUESTED`).
  - Discussion and feedback thread on code changes.
- 🐙 **GitHub Integration**:
  - Direct integration with the official GitHub REST API.
  - Real-time inspection of repository stars, forks, open issues, default branches, recent commit streams, and pull requests.
  - Personal access token support for authenticated rate limit ceilings (5,000 req/hr).
- ✨ **AI-Assisted Documentation**:
  - Automated Markdown technical documentation synthesizer.
  - One-click generators for `README.md`, `API Documentation`, `Developer Setup Guide`, and `Project Architecture Summary`.
  - In-browser Markdown editor with clipboard copy, local file download, and workspace database persistence.
- 🔔 **Activity Notifications**:
  - In-app notification alerts for task assignments, issue reporting, review requests, and approvals.
  - Sticky navbar unread counter with real-time pollers and mark-as-read actions.

---

## 3. Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, React Router 6, Axios, Lucide Icons, Modern CSS3 SaaS Design System |
| **Backend** | Node.js (v24 LTS), Express.js, JWT (`jsonwebtoken`), `bcryptjs`, CORS, `dotenv` |
| **Database** | MySQL 8.0, `mysql2/promise` with Connection Pooling, Prepared Statements |
| **Integrations**| GitHub REST API v3, Google Gemini AI API / Smart Technical Synthesizer |

---

## 4. Architecture

```mermaid
flowchart TD
    subgraph Client["Frontend Client (React 18 + Vite : Port 5173)"]
        UI[SaaS Design System & Dark UI]
        Router[React Router (15 Pages)]
        AuthContext[Auth Context & State]
        Axios[Axios Client with Bearer Interceptors]
    end

    subgraph Backend["REST API Service (Express.js : Port 5000)"]
        Server[server.js & CORS]
        AuthMW[JWT Auth & RBAC Middleware]
        ErrorMW[Centralized Error Handler]
        AuthCtrl[/api/auth]
        ProjCtrl[/api/projects]
        TaskCtrl[/api/tasks]
        IssueCtrl[/api/issues]
        RevCtrl[/api/reviews]
        DocCtrl[/api/ai]
        GHCtrl[/api/github]
        NotifCtrl[/api/notifications]
    end

    subgraph Storage["Database Layer (MySQL 8.0 : Port 3306)"]
        DB[(developer_platform Database)]
    end

    subgraph External["External Services"]
        GitHubAPI[GitHub REST API]
        GeminiAPI[Google Gemini API]
    end

    Axios -->|HTTP + Bearer Token| Server
    Server --> AuthMW
    AuthMW --> AuthCtrl & ProjCtrl & TaskCtrl & IssueCtrl & RevCtrl & DocCtrl & GHCtrl & NotifCtrl
    AuthCtrl & ProjCtrl & TaskCtrl & IssueCtrl & RevCtrl & DocCtrl & NotifCtrl -->|mysql2 pool| DB
    GHCtrl --> GitHubAPI
    DocCtrl --> GeminiAPI
```

---

## 5. Database Schema

The relational schema is defined in `database/schema.sql` and consists of 11 normalized tables:

1. **`users`**: `id`, `name`, `email` (unique), `password`, `profile_image`, `created_at`.
2. **`projects`**: `id`, `name`, `description`, `owner_id`, `github_repo`, `created_at`, `updated_at`.
3. **`project_members`**: `id`, `project_id`, `user_id`, `role` (`OWNER`, `ADMIN`, `DEVELOPER`, `VIEWER`), `joined_at`.
4. **`tasks`**: `id`, `project_id`, `title`, `description`, `assigned_to`, `created_by`, `status`, `priority`, `due_date`, `created_at`, `updated_at`.
5. **`issues`**: `id`, `project_id`, `title`, `description`, `reported_by`, `assigned_to`, `priority`, `status`, `created_at`, `updated_at`.
6. **`issue_comments`**: `id`, `issue_id`, `user_id`, `comment`, `created_at`.
7. **`code_reviews`**: `id`, `project_id`, `pull_request_url`, `title`, `description`, `submitted_by`, `reviewer_id`, `status`, `created_at`, `updated_at`.
8. **`review_comments`**: `id`, `review_id`, `user_id`, `comment`, `created_at`.
9. **`documents`**: `id`, `project_id`, `title`, `content`, `document_type`, `created_by`, `created_at`, `updated_at`.
10. **`github_accounts`**: `id`, `user_id`, `github_username`, `access_token`, `created_at`.
11. **`notifications`**: `id`, `user_id`, `type`, `message`, `is_read`, `created_at`.

All tables implement foreign keys with cascade deletions, indexing on foreign keys and lookup columns, and prepared parameterized queries to eliminate SQL injection vulnerabilities.

---

## 6. REST API Endpoints

### Authentication
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register new user | No |
| `POST` | `/api/auth/login` | Login and obtain JWT token | No |
| `GET` | `/api/auth/profile` | Get current user profile & metrics | Yes |
| `PUT` | `/api/auth/profile` | Update profile settings | Yes |

### Dashboard & Analytics
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/dashboard/stats` | Aggregated metrics, recent projects, activity | Yes |

### Projects
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/projects` | List projects user belongs to | Yes |
| `POST` | `/api/projects` | Create new project workspace | Yes |
| `GET` | `/api/projects/:id` | Get project details & team members | Yes |
| `PUT` | `/api/projects/:id` | Update project details (OWNER / ADMIN) | Yes |
| `DELETE`| `/api/projects/:id` | Delete project workspace (OWNER only) | Yes |
| `POST` | `/api/projects/:id/members` | Invite new team member by email | Yes |
| `PUT` | `/api/projects/:id/members/:userId` | Update member role | Yes |
| `DELETE`| `/api/projects/:id/members/:userId` | Remove member from project | Yes |

### Tasks
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/projects/:id/tasks` | Get project tasks with filters | Yes |
| `POST` | `/api/projects/:id/tasks` | Create task in project | Yes |
| `PUT` | `/api/tasks/:id` | Update task status, priority, assignee | Yes |
| `DELETE`| `/api/tasks/:id` | Delete task | Yes |

### Issues & Comments
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/projects/:id/issues` | Get project issues | Yes |
| `POST` | `/api/projects/:id/issues` | Report new issue | Yes |
| `GET` | `/api/issues/:id` | Get issue details with comments | Yes |
| `PUT` | `/api/issues/:id` | Update issue status/priority | Yes |
| `DELETE`| `/api/issues/:id` | Delete issue | Yes |
| `POST` | `/api/issues/:id/comments` | Post comment on issue | Yes |

### Code Reviews
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/projects/:id/reviews` | Get project code reviews | Yes |
| `POST` | `/api/projects/:id/reviews` | Submit pull request for review | Yes |
| `GET` | `/api/reviews/:id` | Get review details with feedback comments | Yes |
| `PUT` | `/api/reviews/:id` | Approve review or request changes | Yes |
| `POST` | `/api/reviews/:id/comments` | Post comment on review | Yes |

### AI Documentation
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/ai/generate-readme` | Synthesize project README.md | Yes |
| `POST` | `/api/ai/generate-documentation` | Synthesize API docs or setup guide | Yes |
| `POST` | `/api/ai/generate-summary` | Synthesize technical summary | Yes |
| `GET` | `/api/projects/:id/documents` | List saved documents | Yes |
| `POST` | `/api/projects/:id/documents` | Save document to project | Yes |
| `PUT` | `/api/ai/documents/:id` | Update saved document | Yes |
| `DELETE`| `/api/ai/documents/:id` | Delete saved document | Yes |

### GitHub Integration
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/github/account` | Get user connected GitHub account | Yes |
| `POST` | `/api/github/connect` | Connect GitHub username/token | Yes |
| `GET` | `/api/github/repos` | List connected/suggested repositories | Yes |
| `GET` | `/api/github/repos/:owner/:repo` | Get repository metadata | Yes |
| `GET` | `/api/github/repos/:owner/:repo/commits` | Get repository commit history | Yes |
| `GET` | `/api/github/repos/:owner/:repo/branches`| Get repository branches | Yes |
| `GET` | `/api/github/repos/:owner/:repo/pulls` | Get repository pull requests | Yes |

### Notifications
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/notifications` | Get user notifications & unread count | Yes |
| `PUT` | `/api/notifications/:id/read` | Mark notification as read | Yes |
| `PUT` | `/api/notifications/read-all` | Mark all notifications as read | Yes |
| `DELETE`| `/api/notifications/:id` | Delete notification | Yes |

---

## 7. Installation & Running Locally

### Prerequisites
- **Node.js**: v18.0.0 or higher (v24 LTS recommended)
- **npm**: v9.0.0 or higher
- **MySQL**: 8.0 or higher

### Step 1: Clone Repository
```bash
git clone https://github.com/your-username/Developer-Collaboration-Platform.git
cd Developer-Collaboration-Platform
```

### Step 2: Database Initialization
Log in to MySQL and run the schema and seed scripts:
```bash
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql
```

### Step 3: Backend Setup
```bash
cd backend
cp .env.example .env
# Edit .env with your MySQL password and JWT secret
npm install
npm start
```
*Backend runs at `http://localhost:5000` with health check at `http://localhost:5000/api/health`.*

### Step 4: Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
```
*Frontend runs at `http://localhost:5173` with automatic proxy to the backend API.*

---

## 8. Demo Credentials

Pre-configured seed accounts for immediate testing:

| Email | Password | Role | Project Assigned |
| :--- | :--- | :--- | :--- |
| `alex@example.com` | `password123` | Lead Architect (OWNER) | Cloud Storage Microservice, DevCollab Web Client |
| `sarah@example.com` | `password123` | Senior Backend Dev (DEVELOPER) | Cloud Storage Microservice |
| `david@example.com` | `password123` | Frontend Specialist (ADMIN) | DevCollab Web Client |

---

## 9. Environment Variables

Template provided in `.env.example`:

```env
# Server
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Database (MySQL)
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=developer_platform

# Authentication
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=7d

# GitHub Integration
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GITHUB_PERSONAL_TOKEN=

# AI Documentation Assistant
AI_API_KEY=
GEMINI_MODEL=gemini-1.5-flash
```

---

## 10. Contributors & License

Built as an enterprise-grade developer collaboration platform.
Licensed under the [MIT License](LICENSE).
