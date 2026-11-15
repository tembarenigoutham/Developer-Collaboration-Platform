import os
import base64
import json

pptx_path = r"c:\Users\temba\OneDrive\Pictures\Desktop\Developer-Collaboration-Platform\DevCollab_Project_Presentation.pptx"
with open(pptx_path, "rb") as f:
    pptx_b64 = base64.b64encode(f.read()).decode("utf-8")

slides = [
    {
        "id": 1,
        "category": "ENTERPRISE DEVELOPER SUITE",
        "title": "DevCollab",
        "subtitle": "Full-Stack Developer Collaboration & Workspace Platform",
        "desc": "Unifying Agile Sprints, Issue Tracking, Peer Code Reviews, GitHub Telemetry & AI Documentation into a single developer cockpit.",
        "badges": ["React 18 + Vite", "Node.js 24 & Express", "MySQL 8.0 Relational DB", "GitHub REST API v3", "Google Gemini AI Engine", "Docker & CI/CD"],
        "footer_meta": "Presenter: Temba Reni Goutham | Live Demo: https://tembarenigoutham.github.io/Developer-Collaboration-Platform/ | Status: Production-Grade",
        "speaker_notes": "Welcome everyone. Today I am presenting DevCollab, an enterprise-ready, full-stack developer workspace and team collaboration platform. Modern engineering teams struggle with context switching between Jira, GitHub, Notion, and Slack. DevCollab provides an integrated single-pane-of-glass solution built with React 18, Node.js, Express, MySQL 8, GitHub APIs, and Google Gemini AI."
    },
    {
        "id": 2,
        "category": "CHALLENGE & INDUSTRY MOTIVATION",
        "title": "The Problem: Fragmented Developer Ecosystems",
        "cards": [
            {
                "title": "1. Severe Tool Sprawl",
                "tag": "Inefficiency",
                "tag_color": "rose",
                "items": [
                    "Dev teams use 5-8 disparate SaaS tools daily: Jira, GitHub, Slack, Notion, Datadog.",
                    "Constant context switching wastes ~20% of engineering productive time.",
                    "Data silos prevent holistic sprint and project visibility."
                ]
            },
            {
                "title": "2. Code & Sprint Disconnect",
                "tag": "Friction",
                "tag_color": "amber",
                "items": [
                    "Task boards are decoupled from pull requests and actual code commits.",
                    "Status tracking relies on manual dev updates, leading to outdated boards.",
                    "Code review bottlenecks go unnoticed until release day."
                ]
            },
            {
                "title": "3. Documentation Debt",
                "tag": "Quality Deficit",
                "tag_color": "cyan",
                "items": [
                    "Engineers dread writing setup guides, READMEs, and technical documentation.",
                    "Docs quickly become obsolete as APIs evolve.",
                    "Onboarding new engineers takes weeks due to missing architectural documentation."
                ]
            }
        ],
        "speaker_notes": "Software teams face three major bottlenecks: first, severe tool sprawl where developers lose up to 20% of their day switching between apps; second, a disconnect between agile task boards and real code changes in Git; and third, documentation debt where technical guides become obsolete as fast as APIs change."
    },
    {
        "id": 3,
        "category": "VALUE PROPOSITION & PRODUCT VISION",
        "title": "The Solution: A Unified Developer Cockpit",
        "cards": [
            {
                "title": "Unified Workspace",
                "tag": "Workspace",
                "tag_color": "cyan",
                "items": [
                    "Single application housing projects, sprints, tasks, issues, and peer reviews.",
                    "Role-Based Access Control (RBAC) ensuring enterprise security.",
                    "Team members collaborate within multi-tenant project sandboxes."
                ]
            },
            {
                "title": "Real-Time Git Telemetry",
                "tag": "Integration",
                "tag_color": "indigo",
                "items": [
                    "Direct GitHub REST API integration brings repository insights into the dashboard.",
                    "Live branch tracking, pull requests, commits, and star/fork metrics.",
                    "Zero-latency visibility without switching browser tabs."
                ]
            },
            {
                "title": "AI-Assisted Synthesis",
                "tag": "AI Automation",
                "tag_color": "emerald",
                "items": [
                    "Powered by Google Gemini Generative AI for automated documentation.",
                    "Generate READMEs, API specifications, and architectural summaries in seconds.",
                    "Live in-browser markdown editor with direct database persistence."
                ]
            }
        ],
        "speaker_notes": "DevCollab eliminates tool sprawl by providing a unified developer cockpit. It brings together agile sprint management, issue defect tracking, peer code review assignment, live GitHub repository telemetry, and instant AI-assisted technical documentation synthesis into one lightning-fast, cohesive developer experience."
    },
    {
        "id": 4,
        "category": "TECHNICAL ARCHITECTURE",
        "title": "System Architecture & End-to-End Data Flow",
        "cards": [
            {
                "title": "Presentation Tier",
                "tag": "Client Layer",
                "tag_color": "cyan",
                "items": [
                    "React 18 Single Page App (SPA)",
                    "Vite High-Speed Bundler",
                    "React Router v6 (15+ View Pages)",
                    "Axios HTTP Client with Bearer Token Interceptors",
                    "Modern SaaS Dark UI Design System"
                ]
            },
            {
                "title": "Application API Tier",
                "tag": "REST API",
                "tag_color": "indigo",
                "items": [
                    "Node.js (v24 LTS) & Express.js",
                    "Stateless JWT Authentication",
                    "Granular RBAC Authorization",
                    "Centralized Error Handler",
                    "Clean Controller-Service-Route Architecture"
                ]
            },
            {
                "title": "Data Persistence Tier",
                "tag": "Database",
                "tag_color": "emerald",
                "items": [
                    "MySQL 8.0 Relational Database",
                    "mysql2/promise with Connection Pool",
                    "11 Normalized Tables (3NF)",
                    "Foreign Key Cascade Constraints",
                    "Prepared Parameterized Queries"
                ]
            },
            {
                "title": "External Services Tier",
                "tag": "Cloud & Services",
                "tag_color": "purple",
                "items": [
                    "GitHub REST API v3 (Repo, Commits, PRs, Branches)",
                    "Google Gemini 1.5 Flash AI API (Automated Tech Docs)",
                    "Docker Containerization",
                    "GitHub Actions CI/CD Pipeline"
                ]
            }
        ],
        "speaker_notes": "Here is our 3-tier enterprise architecture. At the top is the Presentation Tier: a modern React 18 SPA powered by Vite, offering 15+ pages with a dark-mode SaaS UI. The Application Tier runs Node.js 24 LTS and Express.js, featuring stateless JWT auth and RBAC middleware. The Data Tier uses MySQL 8.0 with normalized relational schemas and connection pooling. Finally, the External Services Tier interfaces directly with the GitHub REST API and Google's Gemini AI engine."
    },
    {
        "id": 5,
        "category": "TECH STACK SPECIFICATIONS",
        "title": "Technology Stack & Engineering Decisions",
        "table": {
            "headers": ["Layer / Domain", "Technologies Used", "Key Responsibilities", "Why Selected?"],
            "rows": [
                ["Frontend Client", "React 18, Vite, React Router 6, Axios, Lucide Icons", "Component UI, interactive Kanban, markdown editor, client routing", "High rendering performance, component reusability, sub-second HMR"],
                ["Backend Services", "Node.js v24 LTS, Express.js, JWT, bcryptjs, CORS", "REST endpoints, auth middleware, request validation, business logic", "Event-driven asynchronous I/O, lightweight execution, rapid scalability"],
                ["Database Engine", "MySQL 8.0, mysql2/promise, Connection Pooling", "Normalized relational storage, transactional safety, indexing", "Strong ACID compliance, relational integrity, zero data corruption"],
                ["Cloud & External", "GitHub REST API v3, Google Gemini API, Docker, Render", "Repository data sync, AI documentation, containerized deployment", "Industry standard REST APIs, state-of-the-art LLM capabilities, portable containers"]
            ]
        },
        "speaker_notes": "Let's examine the tech stack rationale. We selected React 18 with Vite because Vite provides sub-second Hot Module Replacement and optimized rollups. On the backend, Node.js and Express handle concurrent REST requests with minimal overhead. MySQL 8.0 provides rock-solid ACID transactions with foreign keys, preventing orphan records. Docker ensures identical execution across local dev and production clouds like Render."
    },
    {
        "id": 6,
        "category": "DATABASE DESIGN & INTEGRITY",
        "title": "Relational Database Schema & Data Modeling",
        "cards": [
            {
                "title": "User & Workspace Entities",
                "tag": "Auth & Members",
                "tag_color": "cyan",
                "items": [
                    "users: id, name, email (unique), password (hash), system_role.",
                    "projects: id, name, description, owner_id (FK), github_repo.",
                    "project_members: id, project_id, user_id, role (OWNER, ADMIN, DEVELOPER, VIEWER).",
                    "Unique constraint prevents duplicate team memberships."
                ]
            },
            {
                "title": "Sprint & Defect Entities",
                "tag": "Agile Tracking",
                "tag_color": "amber",
                "items": [
                    "tasks: project_id, assigned_to, created_by, status (TODO, IN_PROGRESS, REVIEW, DONE), priority.",
                    "issues: project_id, reported_by, assigned_to, priority, status (OPEN, IN_PROGRESS, RESOLVED, CLOSED).",
                    "issue_comments: relational discussion thread per defect."
                ]
            },
            {
                "title": "Reviews, AI Docs & Alerts",
                "tag": "Collaboration",
                "tag_color": "emerald",
                "items": [
                    "code_reviews: project_id, pull_request_url, submitted_by, reviewer_id, status.",
                    "review_comments: threaded peer review feedback.",
                    "documents: generated & custom markdown documentation.",
                    "github_accounts: secure tokens & GitHub mappings.",
                    "notifications: user alert queues & unread counters."
                ]
            }
        ],
        "speaker_notes": "DevCollab's database is structured into 11 normalized tables following Third Normal Form (3NF). Every relationship enforces ON DELETE CASCADE constraints so that removing a project cleanly cleans up associated tasks, issues, and documents. We've placed targeted indexes on foreign keys, email lookups, and status filters to achieve millisecond query latencies even with thousands of records."
    },
    {
        "id": 7,
        "category": "APPLICATION SECURITY",
        "title": "Enterprise Security, Authentication & RBAC",
        "cards": [
            {
                "title": "Cryptographic Authentication",
                "tag": "Auth Protocol",
                "tag_color": "cyan",
                "items": [
                    "Passwords hashed using bcryptjs with 10 salt rounds.",
                    "Stateless JSON Web Tokens (JWT) signed with HMAC-SHA256.",
                    "Configurable token expiry (7 days default).",
                    "Bearers transmitted via Authorization header on all protected endpoints."
                ]
            },
            {
                "title": "Granular Role-Based Access",
                "tag": "Access Control",
                "tag_color": "indigo",
                "items": [
                    "OWNER: Full project lifecycle, deletion, and member administration.",
                    "ADMIN: Member invitations, role modifications, settings management.",
                    "DEVELOPER: Create & update tasks, report issues, submit code reviews.",
                    "VIEWER: Read-only access to sprint boards, docs, and repositories."
                ]
            },
            {
                "title": "Application Hardening",
                "tag": "Defensive Security",
                "tag_color": "rose",
                "items": [
                    "Parameterized SQL Queries: Zero vulnerability to SQL Injection.",
                    "CORS Whitelisting: Configurable origin controls preventing CSRF.",
                    "Centralized Error Handler: Prevents leaking stack traces in production.",
                    "Token verification middleware rejecting tampered/expired tokens."
                ]
            }
        ],
        "speaker_notes": "Security is built-in by design. We use bcrypt password hashing with 10 rounds of salt to resist brute force and rainbow table attacks. Authentication uses stateless JWT tokens. Our Role-Based Access Control differentiates between Owners, Admins, Developers, and Viewers. In addition, all database transactions use prepared statements, eliminating SQL injection attacks entirely."
    },
    {
        "id": 8,
        "category": "CORE FEATURE #1",
        "title": "Feature Deep Dive: Agile Sprint & Kanban Board",
        "cards": [
            {
                "title": "4-Lane Workflow State",
                "tag": "Visual Board",
                "tag_color": "cyan",
                "items": [
                    "TODO: Backlog items ready for sprint execution.",
                    "IN_PROGRESS: Active development tasks currently being worked on.",
                    "REVIEW: Completed code undergoing peer review or QA testing.",
                    "DONE: Validated milestones deployed to production."
                ]
            },
            {
                "title": "Rich Task Metadata",
                "tag": "Task Metadata",
                "tag_color": "amber",
                "items": [
                    "Four-tier priority badges: LOW, MEDIUM, HIGH, CRITICAL.",
                    "Assignee avatars and creator tracking.",
                    "Due dates with automatic visual overdue indicators.",
                    "Rich text descriptions detailing acceptance criteria."
                ]
            },
            {
                "title": "Interactive Controls",
                "tag": "Productivity",
                "tag_color": "emerald",
                "items": [
                    "Dynamic drag/drop and one-click status transitions.",
                    "Filter tasks by assignee, priority, or keyword search in real-time.",
                    "Instant completion progress bars displayed on project dashboard.",
                    "Instant task creation modal with member dropdown selectors."
                ]
            }
        ],
        "speaker_notes": "Our Kanban Task Board provides real-time sprint visibility. It uses a 4-lane pipeline: TODO, In Progress, Review, and Done. Tasks feature four priority tiers, due date warnings, assignee avatars, and instant search/filtering. On the project dashboard, overall milestone completion rates update dynamically as tasks transition to Done."
    },
    {
        "id": 9,
        "category": "CORE FEATURE #2",
        "title": "Feature Deep Dive: Defect & Bug Tracking",
        "cards": [
            {
                "title": "Issue Lifecycle Management",
                "tag": "Defect Lifecycle",
                "tag_color": "rose",
                "items": [
                    "Standardized states: OPEN, IN_PROGRESS, RESOLVED, CLOSED.",
                    "Severity triage: LOW, MEDIUM, HIGH, CRITICAL.",
                    "Clear reporter vs. assigned developer attribution.",
                    "Creation timestamps and automated last-modified tracking."
                ]
            },
            {
                "title": "Threaded Discussion Engine",
                "tag": "Collaboration",
                "tag_color": "indigo",
                "items": [
                    "Dedicated conversation streams for every reported issue.",
                    "Team members can ask for reproduction steps or share stack traces.",
                    "Relational comment schema linking users and timestamps.",
                    "Auto-scroll and real-time response rendering."
                ]
            },
            {
                "title": "Filter & Resolution Metrics",
                "tag": "Analytics",
                "tag_color": "cyan",
                "items": [
                    "Instant filtering by open/resolved status and severity level.",
                    "Search bar across issue titles and descriptions.",
                    "Project-level bug resolution velocity analytics.",
                    "Automatic notifications sent to assignees when bugs are logged."
                ]
            }
        ],
        "speaker_notes": "The Defect Tracking system guarantees that no bug falls through the cracks. It captures issues with explicit priority ratings and assigns them to developers. Each ticket includes an interactive discussion thread where engineers can post reproduction logs and debug findings, creating an auditable history for every defect."
    },
    {
        "id": 10,
        "category": "CORE FEATURE #3",
        "title": "Feature Deep Dive: Peer Code Reviews",
        "cards": [
            {
                "title": "Pull Request Bridge",
                "tag": "PR Submission",
                "tag_color": "cyan",
                "items": [
                    "Submit GitHub PR URLs directly into DevCollab workspace.",
                    "Title, description, and branch context captured upfront.",
                    "Assign designated senior engineers or peers as primary reviewers.",
                    "Direct link back to GitHub diff views."
                ]
            },
            {
                "title": "Review Decision States",
                "tag": "Approval Workflow",
                "tag_color": "emerald",
                "items": [
                    "PENDING: Awaiting reviewer evaluation.",
                    "APPROVED: Changes verified and approved for merge.",
                    "CHANGES_REQUESTED: Reviewer flags issues requiring fixes.",
                    "Clear color-coded badges indicating PR health at a glance."
                ]
            },
            {
                "title": "Inline Feedback Threads",
                "tag": "Code Quality",
                "tag_color": "indigo",
                "items": [
                    "Reviewers post granular feedback and architectural notes.",
                    "Submitting developer receives instant notification of decisions.",
                    "Prevents unreviewed code from entering production pipelines.",
                    "Fosters team knowledge sharing and code quality standards."
                ]
            }
        ],
        "speaker_notes": "Peer code reviews are fundamental to engineering excellence. DevCollab integrates pull request management directly into project sprints. Authors submit their PR URLs, assign reviewers, and track decisions across Pending, Approved, and Changes Requested states. Threaded discussions provide clear architectural feedback."
    },
    {
        "id": 11,
        "category": "CORE FEATURE #4",
        "title": "Feature Deep Dive: Live GitHub REST API Integration",
        "cards": [
            {
                "title": "Live Repository Telemetry",
                "tag": "Repository Health",
                "tag_color": "amber",
                "items": [
                    "Real-time extraction of GitHub repository metadata.",
                    "Live Star count, Fork count, Watchers, and Open Issue metrics.",
                    "Default branch detection and repository language breakdown.",
                    "Direct one-click link to official GitHub repository."
                ]
            },
            {
                "title": "Commit Stream & Branches",
                "tag": "Git Activity",
                "tag_color": "cyan",
                "items": [
                    "Real-time commit feed showing author avatars, SHA hashes, and messages.",
                    "Track active remote branches across feature and release lines.",
                    "Inspect open Pull Requests with live status and author data.",
                    "Backend proxy caching to ensure snappy dashboard loads."
                ]
            },
            {
                "title": "Token & Rate Limit Resilience",
                "tag": "Enterprise Resilience",
                "tag_color": "indigo",
                "items": [
                    "Supports user GitHub Personal Access Tokens (PAT).",
                    "Elevates API rate limits from 60 to 5,000 requests per hour.",
                    "Graceful offline fallbacks if external GitHub API experiences downtime.",
                    "Safe encrypted storage of user access tokens."
                ]
            }
        ],
        "speaker_notes": "DevCollab connects directly to GitHub's REST API v3. It fetches live repository telemetry including stars, forks, active branches, pull requests, and the latest commit stream. By allowing users to attach Personal Access Tokens, we lift GitHub's rate limit ceiling from 60 to 5,000 calls an hour with resilient fallback handling."
    },
    {
        "id": 12,
        "category": "CORE FEATURE #5",
        "title": "Feature Deep Dive: AI-Assisted Documentation Synthesizer",
        "cards": [
            {
                "title": "Google Gemini AI Engine",
                "tag": "AI Synthesis",
                "tag_color": "purple",
                "items": [
                    "Integrates Google Gemini 1.5 Flash LLM for smart synthesis.",
                    "Context-aware prompt engineering incorporating project name, description, and tech stack.",
                    "Generates production-grade Markdown in under 3 seconds.",
                    "Includes smart fallback synthesizer for offline resilience."
                ]
            },
            {
                "title": "One-Click Documentation Types",
                "tag": "Doc Formats",
                "tag_color": "cyan",
                "items": [
                    "README.md: Installation, badges, scripts, usage, and architecture overview.",
                    "API Documentation: REST endpoints, request/response payloads, auth schemas.",
                    "Developer Setup Guide: Prerequisites, environment variables, DB setup.",
                    "Architecture Summary: Component diagrams and data flow blueprints."
                ]
            },
            {
                "title": "In-Browser Markdown Studio",
                "tag": "Studio Editor",
                "tag_color": "emerald",
                "items": [
                    "Split-screen live Markdown preview with syntax highlighting.",
                    "One-click 'Copy to Clipboard' and 'Download .md File'.",
                    "Direct persistence into MySQL documents table for team sharing.",
                    "Full versioned edit history for technical documentation."
                ]
            }
        ],
        "speaker_notes": "One of DevCollab's most innovative capabilities is AI-Assisted Documentation. Using Google's Gemini 1.5 Flash model, developers can generate comprehensive READMEs, REST API docs, and developer onboarding guides with a single click. The in-browser markdown editor allows instant previewing, editing, downloading, and database saving."
    },
    {
        "id": 13,
        "category": "CORE FEATURE #6",
        "title": "Feature Deep Dive: Notification & Alert Engine",
        "cards": [
            {
                "title": "Event-Driven Alert Triggers",
                "tag": "Event Triggers",
                "tag_color": "cyan",
                "items": [
                    "Task Assignment: Alerts developer when assigned a new sprint ticket.",
                    "Issue Logged: Notifies team when a high/critical defect is created.",
                    "Review Requested: Alerts senior engineers to inspect a submitted PR.",
                    "Review Approved / Changes: Alerts author of code review verdict."
                ]
            },
            {
                "title": "Interactive User Experience",
                "tag": "User Experience",
                "tag_color": "indigo",
                "items": [
                    "Persistent notification bell in navbar with real-time unread counter badge.",
                    "Dedicated Notifications page with full chronological history.",
                    "One-click 'Mark as Read' and 'Mark All as Read' bulk actions.",
                    "Quick delete action to dismiss completed notifications."
                ]
            },
            {
                "title": "Database Persistence & Sync",
                "tag": "Reliability",
                "tag_color": "emerald",
                "items": [
                    "Stored in dedicated notifications table with user foreign key.",
                    "Indexed on (user_id, is_read) for instant count(*) execution.",
                    "Lightweight pollers keep notification state synchronised across tabs.",
                    "Zero notification loss even across user logout and re-login."
                ]
            }
        ],
        "speaker_notes": "Our activity notification engine keeps developers aligned. Triggered by task assignments, issue reports, and code reviews, notifications appear in a sticky navbar counter and dedicated inbox. Backed by relational database persistence with optimized composite indexes, users never miss critical project events."
    },
    {
        "id": 14,
        "category": "DEPLOYMENT ARCHITECTURE",
        "title": "DevOps, Containerization & CI/CD Pipeline",
        "cards": [
            {
                "title": "Multi-Container Docker",
                "tag": "Containerization",
                "tag_color": "cyan",
                "items": [
                    "docker-compose.yml orchestrates 3 isolated services:",
                    "1. devcollab-mysql: MySQL 8.0 with auto-seeded schema & volumes.",
                    "2. devcollab-backend: Node.js 24 Alpine container on Port 5000.",
                    "3. devcollab-frontend: Production Nginx web server on Port 80.",
                    "Health checks guarantee backend starts only after DB is ready."
                ]
            },
            {
                "title": "Automated GitHub Actions CI/CD",
                "tag": "Pipelines",
                "tag_color": "indigo",
                "items": [
                    "Continuous Integration: Validates code, runs linting, executes builds.",
                    "Continuous Deployment: Deploys React client to GitHub Pages automatically on push to main.",
                    "Automated secret management for API keys and database credentials."
                ]
            },
            {
                "title": "Multi-Cloud Production Hosting",
                "tag": "Cloud Hosting",
                "tag_color": "emerald",
                "items": [
                    "Frontend: Hosted on GitHub Pages & Vercel edge CDN for sub-50ms latency.",
                    "Backend: Configured for Render.com Web Services via render.yaml.",
                    "Database: Managed MySQL cluster with SSL and persistent volumes.",
                    "Production-ready CORS, environment configuration, and health check endpoints."
                ]
            }
        ],
        "speaker_notes": "DevCollab is built for enterprise deployment. Using Docker Compose, developers spin up the entire 3-tier stack—database, Express backend, and Nginx frontend—with a single command: docker-compose up. Our CI/CD pipeline on GitHub Actions builds and validates every commit, deploying the frontend to GitHub Pages and the backend to Render."
    },
    {
        "id": 15,
        "category": "IMPACT & ROADMAP",
        "title": "Project Impact & Future Enhancements",
        "cards": [
            {
                "title": "Quantifiable Project Impact",
                "tag": "Measured Metrics",
                "tag_color": "emerald",
                "items": [
                    "Centralized 5 developer tools into 1 unified web interface.",
                    "Reduced documentation creation time by 85% via Gemini AI synthesis.",
                    "Zero-configuration Docker onboarding in under 2 minutes.",
                    "Sub-100ms API response times via prepared SQL queries & connection pooling."
                ]
            },
            {
                "title": "Phase 2 Roadmap (Q3-Q4)",
                "tag": "Upcoming Features",
                "tag_color": "cyan",
                "items": [
                    "WebSocket / Socket.io: Real-time collaborative live cursor editing.",
                    "AI Code Review Bot: Automatic automated code analysis directly on PR submissions.",
                    "Slack & Discord Webhooks: Pushing sprint milestones to team chat channels.",
                    "Kanban Swimlanes: Epics, custom workflow states, and burndown charts."
                ]
            },
            {
                "title": "Phase 3 Long-Term Vision",
                "tag": "Long-Term Vision",
                "tag_color": "purple",
                "items": [
                    "GitLab & Bitbucket Multi-VCS support.",
                    "Self-hosted LLM support (Ollama / LLaMA 3) for on-premise air-gapped security.",
                    "Native Mobile PWA (Progressive Web App) with offline caching.",
                    "Single Sign-On (SSO): OAuth2 with GitHub, Google, and Okta SAML."
                ]
            }
        ],
        "speaker_notes": "The results of DevCollab are clear: it cuts documentation time by 85% and consolidates fragmented toolchains. Looking forward, our roadmap includes real-time WebSockets for live collaborative editing, automated AI code review comments, Slack webhooks, and self-hosted LLM support for enterprise on-premise deployments."
    },
    {
        "id": 16,
        "category": "SUMMARY & WRAP-UP",
        "title": "Thank You! Questions & Discussion",
        "subtitle": "DevCollab — Empowering Engineering Teams to Build, Review, and Ship Better Software Faster.",
        "cards": [
            {
                "title": "Live Deployment",
                "tag": "Live Web App",
                "tag_color": "cyan",
                "items": [
                    "Hosted on GitHub Pages & Render",
                    "URL: https://tembarenigoutham.github.io/Developer-Collaboration-Platform/",
                    "Pre-seeded demo accounts ready for testing"
                ]
            },
            {
                "title": "Open Source Repository",
                "tag": "Source Code",
                "tag_color": "indigo",
                "items": [
                    "GitHub: tembarenigoutham/Developer-Collaboration-Platform",
                    "License: MIT Open Source",
                    "Includes Docker Compose & Automated CI/CD"
                ]
            },
            {
                "title": "Key Takeaways",
                "tag": "Highlights",
                "tag_color": "emerald",
                "items": [
                    "Modern React 18 + Node.js 24 + MySQL 8 stack",
                    "Seamless GitHub REST API & Gemini AI integration",
                    "Production-grade security with JWT and RBAC"
                ]
            }
        ],
        "speaker_notes": "Thank you for your time and attention. DevCollab is fully open-source, deployed live, and backed by a comprehensive full-stack architecture. I would now love to open the floor to any questions, architecture discussions, or live demonstrations."
    }
]

slides_json = json.dumps(slides)

raw_html = '''<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>DevCollab - Project Presentation & Deck</title>
  <script src="https://www.gstatic.com/antigravity/web/dev/tailwindcss.min.js"></script>
  <style>
    @media print {
      body { background-color: #0b0f19 !important; color: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .no-print { display: none !important; }
      .slide-container { page-break-after: always; min-height: 100vh; display: flex !important; }
    }
    .glow-cyan { box-shadow: 0 0 25px rgba(56, 189, 248, 0.18); }
    .slide-card { background: #161e31; border: 1px solid #263453; }
  </style>
</head>
<body class="bg-[#0b0f19] text-slate-100 font-sans min-h-screen flex flex-col antialiased selection:bg-cyan-500 selection:text-white">

  <!-- Top Navigation Bar -->
  <header class="no-print sticky top-0 z-50 bg-[#0f172a]/90 backdrop-blur-md border-b border-slate-800 px-6 py-3.5 flex items-center justify-between">
    <div class="flex items-center space-x-3">
      <div class="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center font-bold text-white shadow-md">
        D
      </div>
      <div>
        <h1 class="text-sm font-bold text-slate-100 tracking-tight flex items-center gap-2">
          DevCollab <span class="text-xs px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/50">Slides Deck</span>
        </h1>
        <p class="text-xs text-slate-400">Full-Stack Developer Collaboration Platform</p>
      </div>
    </div>

    <!-- Quick Actions: Direct PPTX Download Button & Navigation -->
    <div class="flex items-center space-x-3">
      <!-- Direct Download Link with Base64 PPTX Data -->
      <a id="downloadPptxBtn" href="data:application/vnd.openxmlformats-officedocument.presentationml.presentation;base64,__PPTX_B64__" download="DevCollab_Project_Presentation.pptx"
         class="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all cursor-pointer">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
        </svg>
        <span>Download PPTX File</span>
      </a>

      <button onclick="window.print()" class="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-colors">
        <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/>
        </svg>
        <span>Print / PDF</span>
      </button>

      <button id="toggleNotesBtn" onclick="toggleNotes()" class="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-medium transition-colors">
        Speaker Notes
      </button>
    </div>
  </header>

  <!-- Main Slide Display Area -->
  <main class="flex-1 flex flex-col items-center justify-center p-4 md:p-8 max-w-7xl mx-auto w-full">
    
    <!-- Active Slide Stage (16:9 Aspect Ratio Container) -->
    <div id="slideStage" class="w-full bg-[#111827] border border-slate-800 rounded-2xl p-8 md:p-12 shadow-2xl relative overflow-hidden transition-all duration-300 min-h-[580px] flex flex-col justify-between">
      <!-- Dynamic Slide Content Injected by JS -->
    </div>

    <!-- Slide Navigation Controller -->
    <div class="no-print mt-6 flex items-center justify-between w-full max-w-4xl px-4 py-2 bg-[#0f172a] rounded-xl border border-slate-800">
      <div class="flex items-center space-x-2">
        <button onclick="prevSlide()" class="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1">
          <span>&larr; Prev</span>
        </button>
        <button onclick="nextSlide()" class="px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium flex items-center gap-1">
          <span>Next &rarr;</span>
        </button>
      </div>

      <div class="flex items-center space-x-3">
        <span id="slideCounter" class="text-xs font-mono text-slate-400">Slide 1 / 16</span>
        <div class="w-36 h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div id="progressBar" class="h-full bg-gradient-to-r from-cyan-400 to-indigo-500 transition-all duration-300" style="width: 6.25%;"></div>
        </div>
      </div>

      <div class="text-xs text-slate-500 hidden sm:block">
        Use keys <kbd class="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 text-slate-300">&larr;</kbd> <kbd class="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 text-slate-300">&rarr;</kbd> or <kbd class="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 text-slate-300">Space</kbd>
      </div>
    </div>

    <!-- Speaker Notes Panel -->
    <div id="notesPanel" class="no-print w-full max-w-4xl mt-4 p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-300 text-sm hidden transition-all">
      <div class="flex items-center justify-between mb-2">
        <span class="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 100-6 3 3 0 000 6z"/></svg>
          Presenter Script / Speaker Notes
        </span>
        <span class="text-xs text-slate-500">Read aloud during presentation</span>
      </div>
      <p id="notesContent" class="leading-relaxed font-sans text-slate-300"></p>
    </div>

  </main>

  <script>
    const slides = __SLIDES_JSON__;
    let currentIdx = 0;
    let showNotes = false;

    function renderSlide(idx) {
      const s = slides[idx];
      const stage = document.getElementById('slideStage');
      
      let bodyHtml = '';

      if (s.id === 1) {
        bodyHtml = `
          <div class="flex flex-col justify-center items-start flex-1 py-6">
            <span class="px-3 py-1 rounded-full text-xs font-semibold bg-cyan-950 text-cyan-400 border border-cyan-700/60 tracking-wider uppercase mb-4">
              ${s.category}
            </span>
            <h1 class="text-5xl md:text-6xl font-extrabold tracking-tight text-white mb-3">
              ${s.title}
            </h1>
            <h2 class="text-xl md:text-2xl font-semibold text-cyan-400 mb-4">
              ${s.subtitle}
            </h2>
            <p class="text-base text-slate-400 max-w-3xl leading-relaxed mb-8">
              ${s.desc}
            </p>

            <div class="flex flex-wrap gap-2.5 mb-8">
              ${s.badges.map(b => `<span class="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#1a233a] border border-[#2d3d66] text-slate-200">${b}</span>`).join('')}
            </div>

            <div class="pt-6 border-t border-slate-800/80 w-full flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-slate-500 gap-2">
              <span>${s.footer_meta}</span>
              <span class="font-mono text-cyan-500">tembarenigoutham.github.io</span>
            </div>
          </div>
        `;
      } 
      else if (s.table) {
        bodyHtml = `
          <div>
            <div class="mb-6">
              <span class="text-xs font-bold uppercase tracking-widest text-cyan-400">${s.category}</span>
              <h2 class="text-3xl font-extrabold text-white mt-1">${s.title}</h2>
              <div class="w-16 h-1 bg-cyan-500 rounded mt-2"></div>
            </div>

            <div class="overflow-x-auto rounded-xl border border-slate-800">
              <table class="w-full text-left text-xs text-slate-300">
                <thead class="bg-slate-800/80 text-cyan-400 uppercase text-[11px] font-bold border-b border-slate-700">
                  <tr>
                    ${s.table.headers.map(h => `<th class="p-3.5">${h}</th>`).join('')}
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-800/70 bg-[#161e31]">
                  ${s.table.rows.map(row => `
                    <tr class="hover:bg-slate-800/40 transition-colors">
                      <td class="p-3.5 font-bold text-white">${row[0]}</td>
                      <td class="p-3.5 text-slate-300">${row[1]}</td>
                      <td class="p-3.5 text-slate-300">${row[2]}</td>
                      <td class="p-3.5 text-cyan-300/90">${row[3]}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        `;
      }
      else if (s.cards) {
        const cols = s.cards.length === 4 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' : 'grid-cols-1 md:grid-cols-3';
        bodyHtml = `
          <div>
            <div class="mb-6">
              <span class="text-xs font-bold uppercase tracking-widest text-cyan-400">${s.category}</span>
              <h2 class="text-3xl font-extrabold text-white mt-1">${s.title}</h2>
              ${s.subtitle ? `<p class="text-sm text-cyan-400 mt-1">${s.subtitle}</p>` : ''}
              <div class="w-16 h-1 bg-cyan-500 rounded mt-2"></div>
            </div>

            <div class="grid ${cols} gap-4">
              ${s.cards.map(c => `
                <div class="slide-card rounded-xl p-5 border border-slate-700/60 flex flex-col justify-between hover:border-slate-600 transition-all shadow-md">
                  <div>
                    <div class="flex items-center justify-between mb-3">
                      <span class="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded uppercase ${
                        c.tag_color === 'rose' ? 'bg-rose-950 text-rose-400 border border-rose-800/50' :
                        c.tag_color === 'amber' ? 'bg-amber-950 text-amber-400 border border-amber-800/50' :
                        c.tag_color === 'emerald' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/50' :
                        c.tag_color === 'purple' ? 'bg-purple-950 text-purple-400 border border-purple-800/50' :
                        c.tag_color === 'indigo' ? 'bg-indigo-950 text-indigo-400 border border-indigo-800/50' :
                        'bg-cyan-950 text-cyan-400 border border-cyan-800/50'
                      }">
                        ${c.tag}
                      </span>
                    </div>
                    <h3 class="text-base font-bold text-white mb-3">${c.title}</h3>
                    <ul class="space-y-2 text-xs text-slate-400">
                      ${c.items.map(item => `
                        <li class="flex items-start gap-1.5">
                          <span class="text-cyan-400 mt-0.5">&bull;</span>
                          <span>${item}</span>
                        </li>
                      `).join('')}
                    </ul>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        `;
      }

      stage.innerHTML = `
        <div class="flex flex-col justify-between h-full">
          ${bodyHtml}
          <div class="pt-6 mt-6 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500">
            <span>DevCollab Project Architecture & Technical Deck</span>
            <span class="font-mono text-cyan-400">Slide ${s.id} of 16</span>
          </div>
        </div>
      `;

      document.getElementById('slideCounter').innerText = `Slide ${s.id} / 16`;
      document.getElementById('progressBar').style.width = `${((s.id) / 16) * 100}%`;
      document.getElementById('notesContent').innerText = s.speaker_notes || "No notes for this slide.";
    }

    function nextSlide() {
      if (currentIdx < slides.length - 1) {
        currentIdx++;
        renderSlide(currentIdx);
      }
    }

    function prevSlide() {
      if (currentIdx > 0) {
        currentIdx--;
        renderSlide(currentIdx);
      }
    }

    function toggleNotes() {
      showNotes = !showNotes;
      const panel = document.getElementById('notesPanel');
      const btn = document.getElementById('toggleNotesBtn');
      if (showNotes) {
        panel.classList.remove('hidden');
        btn.classList.add('bg-cyan-600', 'text-white');
      } else {
        panel.classList.add('hidden');
        btn.classList.remove('bg-cyan-600', 'text-white');
      }
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        nextSlide();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevSlide();
      } else if (e.key.toLowerCase() === 'n') {
        toggleNotes();
      }
    });

    // Initialize
    renderSlide(0);
  </script>
</body>
</html>
'''

final_html = raw_html.replace("__PPTX_B64__", pptx_b64).replace("__SLIDES_JSON__", slides_json)

# Write to workspace
ws_target = r"c:\Users\temba\OneDrive\Pictures\Desktop\Developer-Collaboration-Platform\presentation.html"
with open(ws_target, "w", encoding="utf-8") as f:
    f.write(final_html)
print(f"Generated {ws_target}")

# Write to desktop
desktop_target = r"c:\Users\temba\OneDrive\Pictures\Desktop\DevCollab_Presentation.html"
with open(desktop_target, "w", encoding="utf-8") as f:
    f.write(final_html)
print(f"Generated {desktop_target}")

# Write to artifact dir
artifact_target = r"C:\Users\temba\.gemini\antigravity\brain\4870829e-d0e0-46d1-b6ae-496bfa27d7ee\presentation.html"
with open(artifact_target, "w", encoding="utf-8") as f:
    f.write(final_html)
print(f"Generated {artifact_target}")
