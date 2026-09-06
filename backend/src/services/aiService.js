import { config } from '../config/env.js';

/**
 * Generate technical documentation with AI or resilient fallback synthesizer
 * @param {string} promptType 'readme' | 'api_docs' | 'setup_guide' | 'summary'
 * @param {Object} projectData { name, description, github_repo, tasks, issues }
 */
export const generateDocumentation = async (promptType, projectData) => {
  const { name = 'Developer Project', description = '', github_repo = '', tasks = [], issues = [] } = projectData;

  const systemInstruction = `You are a Principal Software Architect generating production-grade Markdown technical documentation.`;
  
  let promptText = '';
  if (promptType === 'readme') {
    promptText = `Generate a comprehensive, production-ready README.md for the following project:
Project Name: ${name}
Description: ${description}
GitHub Repository: ${github_repo || 'N/A'}
Active Milestones: ${tasks.map(t => t.title).join(', ') || 'Core API & frontend features'}

Include the following exact sections:
# ${name}
## Overview
## Features
## Technologies
## Architecture
## Installation
## Environment Variables
## API Endpoints
## Usage
## Future Improvements`;
  } else if (promptType === 'api_docs') {
    promptText = `Generate complete REST API documentation for the project "${name}". Include Authentication, Request/Response payloads, HTTP status codes, and example curl commands.`;
  } else if (promptType === 'setup_guide') {
    promptText = `Generate an exhaustive Developer Setup & Onboarding Guide for "${name}". Include Prerequisites, Local Environment Setup, Database Initialization, Common Troubleshooting, and Testing Commands.`;
  } else {
    promptText = `Generate an Executive Technical Architecture and Project Summary for "${name}". Summarize key architectural decisions, data models, scalability, and security posture.`;
  }

  // 1. If Gemini API key is configured, attempt call
  if (config.ai.apiKey) {
    try {
      const model = config.ai.model || 'gemini-1.5-flash';
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${config.ai.apiKey}`;
      
      const payload = {
        contents: [
          {
            parts: [
              { text: `${systemInstruction}\n\n${promptText}` }
            ]
          }
        ]
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const result = await response.json();
        const text = result?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return text;
      }
    } catch (err) {
      console.warn('AI API call failed or rate-limited. Using built-in technical synthesizer:', err.message);
    }
  }

  // 2. High-quality structured fallback generator
  return generateIntelligentFallback(promptType, projectData);
};

/**
 * Intelligent Technical Documentation Generator
 */
function generateIntelligentFallback(promptType, projectData) {
  const name = projectData.name || 'Developer Project';
  const description = projectData.description || 'Enterprise-grade full-stack software application.';
  const repo = projectData.github_repo || 'developer-org/collaboration-platform';

  if (promptType === 'readme') {
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
AI_API_KEY=your_key
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

  if (promptType === 'api_docs') {
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

**Request Body:**
\`\`\`json
{
  "name": "Alex Johnson",
  "email": "alex@example.com",
  "password": "password123",
  "confirmPassword": "password123"
}
\`\`\`

**Response (201 Created):**
\`\`\`json
{
  "success": true,
  "data": {
    "user": { "id": 1, "name": "Alex Johnson", "email": "alex@example.com" },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
\`\`\`

---

### 2. Project Endpoints

#### \`GET /projects\`
List all workspaces where the current user is a member.

#### \`POST /projects\`
Create a new project workspace.

**Request Body:**
\`\`\`json
{
  "name": "${name}",
  "description": "${description}",
  "github_repo": "${repo}"
}
\`\`\`

---

### 3. Task Management Endpoints

#### \`GET /projects/:id/tasks\`
List all tasks filtered by status or priority.

#### \`POST /projects/:id/tasks\`
Create task in project.
`;
  }

  if (promptType === 'setup_guide') {
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

### 2. Backend Configuration
1. Navigate to \`backend/\`:
   \`\`\`bash
   cd backend
   cp .env.example .env
   \`\`\`
2. Update \`DB_PASSWORD\` and \`JWT_SECRET\`.
3. Install dependencies: \`npm install\`
4. Verify database connectivity:
   \`\`\`bash
   npm start
   \`\`\`

### 3. Frontend Configuration
1. Navigate to \`frontend/\`:
   \`\`\`bash
   cd frontend
   npm install
   \`\`\`
2. Launch Vite dev server:
   \`\`\`bash
   npm run dev
   \`\`\`
3. Access http://localhost:5173 in your browser.
`;
  }

  return `# Technical Architecture & Executive Summary

## Project: ${name}
**Description:** ${description}

### Executive Overview
${name} is an integrated development portal designed to unify task execution, peer reviews, issue tracking, and repository monitoring in a unified interface.

### Architectural Tenets
1. **Separation of Concerns**: Decoupled client (React 18 SPA) and REST API service (Express.js).
2. **Security by Design**: Parameterized SQL queries preventing injection, bcrypt salt rounds of 10, stateless JWT authentication.
3. **Data Integrity**: Relational foreign-key constraints cascading project-level lifecycles across tasks, issues, and code reviews.
4. **Resiliency**: Fault-tolerant external integration adapters with graceful degradation when third-party APIs are rate-limited.
`;
}
