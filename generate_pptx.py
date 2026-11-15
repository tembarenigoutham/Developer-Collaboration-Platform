import os
import sys
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.enum.text import PP_ALIGN
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE

def create_presentation(output_path):
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6]  # Blank slide

    # Color Palette - Modern Dark SaaS Theme
    BG_DARK = RGBColor(11, 15, 25)         # Deep Obsidian Slate
    CARD_BG = RGBColor(22, 30, 49)         # Elevated Slate Card
    CARD_BORDER = RGBColor(38, 52, 83)     # Border highlight
    TEXT_LIGHT = RGBColor(241, 245, 249)   # Heading / High-contrast text
    TEXT_MUTED = RGBColor(148, 163, 184)   # Subtitle / Body text
    TEXT_DIM = RGBColor(100, 116, 139)     # Footer / Hint text
    CYAN = RGBColor(56, 189, 248)          # Accent Cyan / Tech highlight
    INDIGO = RGBColor(129, 140, 248)       # Accent Indigo
    EMERALD = RGBColor(52, 211, 153)       # Accent Emerald / Success
    AMBER = RGBColor(251, 191, 36)         # Accent Amber / Warning
    ROSE = RGBColor(244, 63, 94)           # Accent Rose / Critical
    PURPLE = RGBColor(192, 132, 252)       # Accent Purple / AI

    def apply_bg(slide):
        bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(7.5))
        bg.fill.solid()
        bg.fill.fore_color.rgb = BG_DARK
        bg.line.fill.background()
        return bg

    def add_header(slide, title, category="DEVCOLLAB • DEVELOPER COLLABORATION PLATFORM", slide_num=None):
        cat_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.45), Inches(10), Inches(0.35))
        tf = cat_box.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
        p = tf.paragraphs[0]
        p.text = category.upper()
        p.font.name = 'Segoe UI'
        p.font.size = Pt(9.5)
        p.font.bold = True
        p.font.color.rgb = CYAN

        title_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.8), Inches(11.5), Inches(0.6))
        tf2 = title_box.text_frame
        tf2.word_wrap = True
        tf2.margin_left = tf2.margin_top = tf2.margin_right = tf2.margin_bottom = 0
        p2 = tf2.paragraphs[0]
        p2.text = title
        p2.font.name = 'Segoe UI'
        p2.font.size = Pt(22)
        p2.font.bold = True
        p2.font.color.rgb = TEXT_LIGHT

        bar = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.8), Inches(1.48), Inches(2.2), Inches(0.04))
        bar.fill.solid()
        bar.fill.fore_color.rgb = CYAN
        bar.line.fill.background()

        if slide_num:
            ft_box = slide.shapes.add_textbox(Inches(0.8), Inches(7.05), Inches(11.733), Inches(0.3))
            ft_tf = ft_box.text_frame
            ft_tf.margin_left = ft_tf.margin_top = ft_tf.margin_right = ft_tf.margin_bottom = 0
            p_ft = ft_tf.paragraphs[0]
            p_ft.text = f"DevCollab Architecture & Technical Deck  |  Slide {slide_num} of 16"
            p_ft.font.name = 'Segoe UI'
            p_ft.font.size = Pt(9)
            p_ft.font.color.rgb = TEXT_DIM

    def add_card(slide, left, top, width, height, title, items, tag=None, accent=CYAN):
        card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(left), Inches(top), Inches(width), Inches(height))
        card.fill.solid()
        card.fill.fore_color.rgb = CARD_BG
        card.line.color.rgb = CARD_BORDER
        card.line.width = Pt(1)

        accent_strip = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(left + 0.15), Inches(top + 0.12), Inches(0.6), Inches(0.05))
        accent_strip.fill.solid()
        accent_strip.fill.fore_color.rgb = accent
        accent_strip.line.fill.background()

        tb = slide.shapes.add_textbox(Inches(left + 0.22), Inches(top + 0.22), Inches(width - 0.44), Inches(height - 0.4))
        tf = tb.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0

        p_title = tf.paragraphs[0]
        p_title.text = title
        p_title.font.name = 'Segoe UI'
        p_title.font.size = Pt(13.5)
        p_title.font.bold = True
        p_title.font.color.rgb = TEXT_LIGHT
        p_title.space_after = Pt(8)

        if tag:
            p_tag = tf.add_paragraph()
            p_tag.text = f"[{tag.upper()}]"
            p_tag.font.name = 'Segoe UI'
            p_tag.font.size = Pt(8.5)
            p_tag.font.bold = True
            p_tag.font.color.rgb = accent
            p_tag.space_after = Pt(6)

        for item in items:
            p = tf.add_paragraph()
            p.text = f"•  {item}"
            p.font.name = 'Segoe UI'
            p.font.size = Pt(10)
            p.font.color.rgb = TEXT_MUTED
            p.space_after = Pt(4)

    def set_notes(slide, notes_content):
        notes_slide = slide.notes_slide
        tf = notes_slide.notes_text_frame
        tf.text = notes_content

    # SLIDE 1: TITLE SLIDE
    s1 = prs.slides.add_slide(blank_layout)
    apply_bg(s1)

    badge = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.9), Inches(1.2), Inches(3.2), Inches(0.42))
    badge.fill.solid()
    badge.fill.fore_color.rgb = CARD_BG
    badge.line.color.rgb = CYAN
    badge.line.width = Pt(1)
    b_tf = badge.text_frame
    b_tf.margin_top = Inches(0.08)
    b_p = b_tf.paragraphs[0]
    b_p.text = "ENTERPRISE DEVELOPER SUITE"
    b_p.font.name = 'Segoe UI'
    b_p.font.size = Pt(10)
    b_p.font.bold = True
    b_p.font.color.rgb = CYAN
    b_p.alignment = PP_ALIGN.CENTER

    t_box = s1.shapes.add_textbox(Inches(0.9), Inches(1.8), Inches(11.5), Inches(2.2))
    t_tf = t_box.text_frame
    t_tf.word_wrap = True
    t_p1 = t_tf.paragraphs[0]
    t_p1.text = "DevCollab"
    t_p1.font.name = 'Segoe UI'
    t_p1.font.size = Pt(44)
    t_p1.font.bold = True
    t_p1.font.color.rgb = TEXT_LIGHT

    t_p2 = t_tf.add_paragraph()
    t_p2.text = "Full-Stack Developer Collaboration & Workspace Platform"
    t_p2.font.name = 'Segoe UI'
    t_p2.font.size = Pt(20)
    t_p2.font.color.rgb = CYAN
    t_p2.space_before = Pt(8)

    t_p3 = t_tf.add_paragraph()
    t_p3.text = "Unifying Agile Sprints, Issue Tracking, Peer Code Reviews, GitHub Telemetry & AI Documentation"
    t_p3.font.name = 'Segoe UI'
    t_p3.font.size = Pt(12)
    t_p3.font.color.rgb = TEXT_MUTED
    t_p3.space_before = Pt(8)

    pills = [
        ("React 18 + Vite", CYAN),
        ("Node.js & Express", INDIGO),
        ("MySQL 8.0 Relational DB", EMERALD),
        ("GitHub REST API v3", AMBER),
        ("Google Gemini AI Engine", PURPLE),
        ("Docker & CI/CD", ROSE)
    ]
    pill_left = 0.9
    for name, col in pills:
        p_shape = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(pill_left), Inches(4.5), Inches(1.9), Inches(0.4))
        p_shape.fill.solid()
        p_shape.fill.fore_color.rgb = CARD_BG
        p_shape.line.color.rgb = col
        p_shape.line.width = Pt(1)
        p_tf = p_shape.text_frame
        p_tf.margin_top = Inches(0.08)
        p_para = p_tf.paragraphs[0]
        p_para.text = name
        p_para.font.name = 'Segoe UI'
        p_para.font.size = Pt(9)
        p_para.font.bold = True
        p_para.font.color.rgb = col
        p_para.alignment = PP_ALIGN.CENTER
        pill_left += 2.0

    meta_box = s1.shapes.add_textbox(Inches(0.9), Inches(5.3), Inches(11.5), Inches(1.2))
    m_tf = meta_box.text_frame
    m_p = m_tf.paragraphs[0]
    m_p.text = "Presenter: Temba Reni Goutham  |  Repository: Developer-Collaboration-Platform  |  Status: Production-Grade"
    m_p.font.name = 'Segoe UI'
    m_p.font.size = Pt(11)
    m_p.font.color.rgb = TEXT_MUTED

    m_p2 = m_tf.add_paragraph()
    m_p2.text = "Live Demo: https://tembarenigoutham.github.io/Developer-Collaboration-Platform/"
    m_p2.font.name = 'Segoe UI'
    m_p2.font.size = Pt(10.5)
    m_p2.font.bold = True
    m_p2.font.color.rgb = CYAN
    m_p2.space_before = Pt(4)

    set_notes(s1, "Welcome everyone. Today I am presenting DevCollab, an enterprise-ready, full-stack developer workspace and team collaboration platform. Modern software engineering teams frequently struggle with context switching between multiple isolated tools like Jira, GitHub, Notion, and Slack. DevCollab provides an integrated single-pane-of-glass solution built with React 18, Node.js, Express, MySQL 8, GitHub APIs, and Google Gemini AI.")

    # SLIDE 2: PROBLEM STATEMENT
    s2 = prs.slides.add_slide(blank_layout)
    apply_bg(s2)
    add_header(s2, "The Problem: Fragmented Developer Ecosystems", "CHALLENGE & INDUSTRY MOTIVATION", 2)

    add_card(s2, 0.8, 1.8, 3.7, 4.9, "1. Severe Tool Sprawl", [
        "Dev teams use 5-8 disparate SaaS tools daily: Jira, GitHub, Slack, Notion, Datadog.",
        "Constant context switching wastes ~20% of engineering productive time.",
        "Data silos prevent holistic sprint and project visibility."
    ], "Inefficiency", ROSE)

    add_card(s2, 4.8, 1.8, 3.7, 4.9, "2. Code & Sprint Disconnect", [
        "Task boards are decoupled from pull requests and actual code commits.",
        "Status tracking relies on manual dev updates, leading to outdated boards.",
        "Code review bottlenecks go unnoticed until release day."
    ], "Friction", AMBER)

    add_card(s2, 8.8, 1.8, 3.7, 4.9, "3. Documentation Debt", [
        "Engineers dread writing setup guides, READMEs, and technical documentation.",
        "Docs quickly become obsolete as APIs evolve.",
        "Onboarding new engineers takes weeks due to missing architectural documentation."
    ], "Quality Deficit", CYAN)

    set_notes(s2, "In software engineering teams today, developer fragmentation is a major productivity killer. Developers spend hours hopping between task trackers like Jira, code hosts like GitHub, internal wikis like Confluence, and chat tools like Slack. This leads to documentation debt, out-of-sync task boards, and uncoordinated peer code reviews. DevCollab is built specifically to address these friction points.")

    # SLIDE 3: SOLUTION OVERVIEW
    s3 = prs.slides.add_slide(blank_layout)
    apply_bg(s3)
    add_header(s3, "The Solution: A Unified Developer Cockpit", "VALUE PROPOSITION & PRODUCT VISION", 3)

    add_card(s3, 0.8, 1.8, 3.7, 4.9, "Unified Workspace", [
        "Single application housing projects, sprints, tasks, issues, and peer reviews.",
        "Role-Based Access Control (RBAC) ensuring enterprise security.",
        "Team members collaborate within multi-tenant project sandboxes."
    ], "Workspace", CYAN)

    add_card(s3, 4.8, 1.8, 3.7, 4.9, "Real-Time Git Telemetry", [
        "Direct GitHub REST API integration brings repository insights into the dashboard.",
        "Live branch tracking, pull requests, commits, and star/fork metrics.",
        "Zero-latency visibility without switching browser tabs."
    ], "Integration", INDIGO)

    add_card(s3, 8.8, 1.8, 3.7, 4.9, "AI-Assisted Synthesis", [
        "Powered by Google Gemini Generative AI for automated documentation.",
        "Generate READMEs, API specifications, and architectural summaries in seconds.",
        "Live in-browser markdown editor with direct database persistence."
    ], "AI Automation", EMERALD)

    set_notes(s3, "DevCollab eliminates tool sprawl by providing a unified developer cockpit. It brings together agile sprint management, issue defect tracking, peer code review assignment, live GitHub repository telemetry, and instant AI-assisted technical documentation synthesis into one lightning-fast, cohesive developer experience.")

    # SLIDE 4: SYSTEM ARCHITECTURE
    s4 = prs.slides.add_slide(blank_layout)
    apply_bg(s4)
    add_header(s4, "System Architecture & End-to-End Data Flow", "TECHNICAL ARCHITECTURE", 4)

    add_card(s4, 0.8, 1.8, 2.7, 4.9, "Presentation Tier", [
        "React 18 Single Page App (SPA)",
        "Vite High-Speed Bundler",
        "React Router v6 (15+ View Pages)",
        "Axios HTTP Client with Bearer Token Interceptors",
        "Modern SaaS Dark UI Design System"
    ], "Client Layer", CYAN)

    add_card(s4, 3.8, 1.8, 2.7, 4.9, "Application API Tier", [
        "Node.js (v24 LTS) & Express.js",
        "Stateless JWT Authentication",
        "Granular RBAC Authorization",
        "Centralized Error Handler",
        "Clean Controller-Service-Route Architecture"
    ], "REST API", INDIGO)

    add_card(s4, 6.8, 1.8, 2.7, 4.9, "Data Persistence Tier", [
        "MySQL 8.0 Relational Database",
        "mysql2/promise with Connection Pool",
        "11 Normalized Tables (3NF)",
        "Foreign Key Cascade Constraints",
        "Prepared Parameterized Queries"
    ], "Database", EMERALD)

    add_card(s4, 9.8, 1.8, 2.7, 4.9, "External Services Tier", [
        "GitHub REST API v3 (Repo, Commits, PRs, Branches)",
        "Google Gemini 1.5 Flash AI API (Automated Tech Docs)",
        "Docker Containerization",
        "GitHub Actions CI/CD Pipeline"
    ], "Cloud & Services", PURPLE)

    set_notes(s4, "Here is our 3-tier enterprise architecture. At the top is the Presentation Tier: a modern React 18 SPA powered by Vite, offering 15+ pages with a dark-mode SaaS UI. The Application Tier runs Node.js 24 LTS and Express.js, featuring stateless JWT auth and RBAC middleware. The Data Tier uses MySQL 8.0 with normalized relational schemas and connection pooling. Finally, the External Services Tier interfaces directly with the GitHub REST API and Google's Gemini AI engine.")

    # SLIDE 5: TECH STACK TABLE
    s5 = prs.slides.add_slide(blank_layout)
    apply_bg(s5)
    add_header(s5, "Technology Stack & Engineering Decisions", "TECH STACK SPECIFICATIONS", 5)

    table_shape = s5.shapes.add_table(5, 4, Inches(0.8), Inches(1.8), Inches(11.733), Inches(4.8))
    table = table_shape.table
    table.columns[0].width = Inches(2.2)
    table.columns[1].width = Inches(3.2)
    table.columns[2].width = Inches(3.5)
    table.columns[3].width = Inches(2.833)

    headers = ["Layer / Domain", "Technologies Used", "Key Responsibilities", "Why Selected?"]
    for col_idx, text in enumerate(headers):
        cell = table.cell(0, col_idx)
        cell.fill.solid()
        cell.fill.fore_color.rgb = CARD_BORDER
        p = cell.text_frame.paragraphs[0]
        p.text = text
        p.font.name = 'Segoe UI'
        p.font.size = Pt(11)
        p.font.bold = True
        p.font.color.rgb = CYAN

    data = [
        ("Frontend Client", "React 18, Vite, React Router 6, Axios, Lucide Icons", "Component UI, interactive Kanban, markdown editor, client routing", "High rendering performance, component reusability, sub-second HMR"),
        ("Backend Services", "Node.js v24 LTS, Express.js, JWT, bcryptjs, CORS", "REST endpoints, auth middleware, request validation, business logic", "Event-driven asynchronous I/O, lightweight execution, rapid scalability"),
        ("Database Engine", "MySQL 8.0, mysql2/promise, Connection Pooling", "Normalized relational storage, transactional safety, index indexing", "Strong ACID compliance, relational integrity, zero data corruption"),
        ("Cloud & External", "GitHub REST API v3, Google Gemini API, Docker, Render", "Repository data sync, AI documentation, containerized deployment", "Industry standard REST APIs, state-of-the-art LLM capabilities, portable containers")
    ]

    for row_idx, row_data in enumerate(data, start=1):
        for col_idx, cell_value in enumerate(row_data):
            cell = table.cell(row_idx, col_idx)
            cell.fill.solid()
            cell.fill.fore_color.rgb = CARD_BG
            p = cell.text_frame.paragraphs[0]
            p.text = cell_value
            p.font.name = 'Segoe UI'
            p.font.size = Pt(9.5)
            p.font.color.rgb = TEXT_LIGHT if col_idx == 0 else TEXT_MUTED
            if col_idx == 0:
                p.font.bold = True

    set_notes(s5, "Let's examine the tech stack rationale. We selected React 18 with Vite because Vite provides sub-second Hot Module Replacement and optimized rollups. On the backend, Node.js and Express handle concurrent REST requests with minimal overhead. MySQL 8.0 provides rock-solid ACID transactions with foreign keys, preventing orphan records. Docker ensures identical execution across local dev and production clouds like Render.")

    # SLIDE 6: DATABASE DESIGN
    s6 = prs.slides.add_slide(blank_layout)
    apply_bg(s6)
    add_header(s6, "Relational Database Schema & Data Modeling", "DATABASE DESIGN & INTEGRITY", 6)

    add_card(s6, 0.8, 1.8, 3.7, 4.9, "User & Workspace Entities", [
        "users: id, name, email (unique), password (hash), system_role.",
        "projects: id, name, description, owner_id (FK), github_repo.",
        "project_members: id, project_id, user_id, role (OWNER, ADMIN, DEVELOPER, VIEWER).",
        "Unique constraint prevents duplicate team memberships."
    ], "Auth & Members", CYAN)

    add_card(s6, 4.8, 1.8, 3.7, 4.9, "Sprint & Defect Entities", [
        "tasks: project_id, assigned_to, created_by, status (TODO, IN_PROGRESS, REVIEW, DONE), priority.",
        "issues: project_id, reported_by, assigned_to, priority, status (OPEN, IN_PROGRESS, RESOLVED, CLOSED).",
        "issue_comments: relational discussion thread per defect."
    ], "Agile Tracking", AMBER)

    add_card(s6, 8.8, 1.8, 3.7, 4.9, "Reviews, AI Docs & Alerts", [
        "code_reviews: project_id, pull_request_url, submitted_by, reviewer_id, status.",
        "review_comments: threaded peer review feedback.",
        "documents: generated & custom markdown documentation.",
        "github_accounts: secure tokens & GitHub mappings.",
        "notifications: user alert queues & unread counters."
    ], "Collaboration", EMERALD)

    set_notes(s6, "DevCollab's database is structured into 11 normalized tables following Third Normal Form (3NF). Every relationship enforces ON DELETE CASCADE constraints so that removing a project cleanly cleans up associated tasks, issues, and documents. We've placed targeted indexes on foreign keys, email lookups, and status filters to achieve millisecond query latencies even with thousands of records.")

    # SLIDE 7: SECURITY & RBAC
    s7 = prs.slides.add_slide(blank_layout)
    apply_bg(s7)
    add_header(s7, "Enterprise Security, Authentication & RBAC", "APPLICATION SECURITY", 7)

    add_card(s7, 0.8, 1.8, 3.7, 4.9, "Cryptographic Authentication", [
        "Passwords hashed using bcryptjs with 10 salt rounds.",
        "Stateless JSON Web Tokens (JWT) signed with HMAC-SHA256.",
        "Configurable token expiry (7 days default).",
        "Bearers transmitted via Authorization header on all protected endpoints."
    ], "Auth Protocol", CYAN)

    add_card(s7, 4.8, 1.8, 3.7, 4.9, "Granular Role-Based Access", [
        "OWNER: Full project lifecycle, deletion, and member administration.",
        "ADMIN: Member invitations, role modifications, settings management.",
        "DEVELOPER: Create & update tasks, report issues, submit code reviews.",
        "VIEWER: Read-only access to sprint boards, docs, and repositories."
    ], "Access Control", INDIGO)

    add_card(s7, 8.8, 1.8, 3.7, 4.9, "Application Hardening", [
        "Parameterized SQL Queries: Zero vulnerability to SQL Injection.",
        "CORS Whitelisting: Configurable origin controls preventing CSRF.",
        "Centralized Error Handler: Prevents leaking stack traces in production.",
        "Token verification middleware rejecting tampered/expired tokens."
    ], "Defensive Security", ROSE)

    set_notes(s7, "Security is built-in by design. We use bcrypt password hashing with 10 rounds of salt to resist brute force and rainbow table attacks. Authentication uses stateless JWT tokens. Our Role-Based Access Control differentiates between Owners, Admins, Developers, and Viewers. In addition, all database transactions use prepared statements, eliminating SQL injection attacks entirely.")

    # SLIDE 8: KANBAN SPRINT
    s8 = prs.slides.add_slide(blank_layout)
    apply_bg(s8)
    add_header(s8, "Feature Deep Dive: Agile Sprint & Kanban Board", "CORE FEATURE #1", 8)

    add_card(s8, 0.8, 1.8, 3.7, 4.9, "4-Lane Workflow State", [
        "TODO: Backlog items ready for sprint execution.",
        "IN_PROGRESS: Active development tasks currently being worked on.",
        "REVIEW: Completed code undergoing peer review or QA testing.",
        "DONE: Validated milestones deployed to production."
    ], "Visual Board", CYAN)

    add_card(s8, 4.8, 1.8, 3.7, 4.9, "Rich Task Metadata", [
        "Four-tier priority badges: LOW, MEDIUM, HIGH, CRITICAL.",
        "Assignee avatars and creator tracking.",
        "Due dates with automatic visual overdue indicators.",
        "Rich text descriptions detailing acceptance criteria."
    ], "Task Metadata", AMBER)

    add_card(s8, 8.8, 1.8, 3.7, 4.9, "Interactive Controls", [
        "Dynamic drag/drop and one-click status transitions.",
        "Filter tasks by assignee, priority, or keyword search in real-time.",
        "Instant completion progress bars displayed on project dashboard.",
        "Instant task creation modal with member dropdown selectors."
    ], "Productivity", EMERALD)

    set_notes(s8, "Our Kanban Task Board provides real-time sprint visibility. It uses a 4-lane pipeline: TODO, In Progress, Review, and Done. Tasks feature four priority tiers, due date warnings, assignee avatars, and instant search/filtering. On the project dashboard, overall milestone completion rates update dynamically as tasks transition to Done.")

    # SLIDE 9: ISSUE TRACKER
    s9 = prs.slides.add_slide(blank_layout)
    apply_bg(s9)
    add_header(s9, "Feature Deep Dive: Defect & Bug Tracking", "CORE FEATURE #2", 9)

    add_card(s9, 0.8, 1.8, 3.7, 4.9, "Issue Lifecycle Management", [
        "Standardized states: OPEN, IN_PROGRESS, RESOLVED, CLOSED.",
        "Severity triage: LOW, MEDIUM, HIGH, CRITICAL.",
        "Clear reporter vs. assigned developer attribution.",
        "Creation timestamps and automated last-modified tracking."
    ], "Defect Lifecycle", ROSE)

    add_card(s9, 4.8, 1.8, 3.7, 4.9, "Threaded Discussion Engine", [
        "Dedicated conversation streams for every reported issue.",
        "Team members can ask for reproduction steps or share stack traces.",
        "Relational comment schema linking users and timestamps.",
        "Auto-scroll and real-time response rendering."
    ], "Collaboration", INDIGO)

    add_card(s9, 8.8, 1.8, 3.7, 4.9, "Filter & Resolution Metrics", [
        "Instant filtering by open/resolved status and severity level.",
        "Search bar across issue titles and descriptions.",
        "Project-level bug resolution velocity analytics.",
        "Automatic notifications sent to assignees when bugs are logged."
    ], "Analytics", CYAN)

    set_notes(s9, "The Defect Tracking system guarantees that no bug falls through the cracks. It captures issues with explicit priority ratings and assigns them to developers. Each ticket includes an interactive discussion thread where engineers can post reproduction logs and debug findings, creating an auditable history for every defect.")

    # SLIDE 10: CODE REVIEWS
    s10 = prs.slides.add_slide(blank_layout)
    apply_bg(s10)
    add_header(s10, "Feature Deep Dive: Peer Code Reviews", "CORE FEATURE #3", 10)

    add_card(s10, 0.8, 1.8, 3.7, 4.9, "Pull Request Bridge", [
        "Submit GitHub PR URLs directly into DevCollab workspace.",
        "Title, description, and branch context captured upfront.",
        "Assign designated senior engineers or peers as primary reviewers.",
        "Direct link back to GitHub diff views."
    ], "PR Submission", CYAN)

    add_card(s10, 4.8, 1.8, 3.7, 4.9, "Review Decision States", [
        "PENDING: Awaiting reviewer evaluation.",
        "APPROVED: Changes verified and approved for merge.",
        "CHANGES_REQUESTED: Reviewer flags issues requiring fixes.",
        "Clear color-coded badges indicating PR health at a glance."
    ], "Approval Workflow", EMERALD)

    add_card(s10, 8.8, 1.8, 3.7, 4.9, "Inline Feedback Threads", [
        "Reviewers post granular feedback and architectural notes.",
        "Submitting developer receives instant notification of decisions.",
        "Prevents unreviewed code from entering production pipelines.",
        "Fosters team knowledge sharing and code quality standards."
    ], "Code Quality", INDIGO)

    set_notes(s10, "Peer code reviews are fundamental to engineering excellence. DevCollab integrates pull request management directly into project sprints. Authors submit their PR URLs, assign reviewers, and track decisions across Pending, Approved, and Changes Requested states. Threaded discussions provide clear architectural feedback.")

    # SLIDE 11: GITHUB API INTEGRATION
    s11 = prs.slides.add_slide(blank_layout)
    apply_bg(s11)
    add_header(s11, "Feature Deep Dive: Live GitHub REST API Integration", "CORE FEATURE #4", 11)

    add_card(s11, 0.8, 1.8, 3.7, 4.9, "Live Repository Telemetry", [
        "Real-time extraction of GitHub repository metadata.",
        "Live Star count, Fork count, Watchers, and Open Issue metrics.",
        "Default branch detection and repository language breakdown.",
        "Direct one-click link to official GitHub repository."
    ], "Repository Health", AMBER)

    add_card(s11, 4.8, 1.8, 3.7, 4.9, "Commit Stream & Branches", [
        "Real-time commit feed showing author avatars, SHA hashes, and messages.",
        "Track active remote branches across feature and release lines.",
        "Inspect open Pull Requests with live status and author data.",
        "Backend proxy caching to ensure snappy dashboard loads."
    ], "Git Activity", CYAN)

    add_card(s11, 8.8, 1.8, 3.7, 4.9, "Token & Rate Limit Resilience", [
        "Supports user GitHub Personal Access Tokens (PAT).",
        "Elevates API rate limits from 60 to 5,000 requests per hour.",
        "Graceful offline fallbacks if external GitHub API experiences downtime.",
        "Safe encrypted storage of user access tokens."
    ], "Enterprise Resilience", INDIGO)

    set_notes(s11, "DevCollab connects directly to GitHub's REST API v3. It fetches live repository telemetry including stars, forks, active branches, pull requests, and the latest commit stream. By allowing users to attach Personal Access Tokens, we lift GitHub's rate limit ceiling from 60 to 5,000 calls an hour with resilient fallback handling.")

    # SLIDE 12: AI DOCUMENTATION
    s12 = prs.slides.add_slide(blank_layout)
    apply_bg(s12)
    add_header(s12, "Feature Deep Dive: AI-Assisted Documentation Synthesizer", "CORE FEATURE #5", 12)

    add_card(s12, 0.8, 1.8, 3.7, 4.9, "Google Gemini AI Engine", [
        "Integrates Google Gemini 1.5 Flash LLM for smart synthesis.",
        "Context-aware prompt engineering incorporating project name, description, and tech stack.",
        "Generates production-grade Markdown in under 3 seconds.",
        "Includes smart fallback synthesizer for offline resilience."
    ], "AI Synthesis", PURPLE)

    add_card(s12, 4.8, 1.8, 3.7, 4.9, "One-Click Documentation Types", [
        "README.md: Installation, badges, scripts, usage, and architecture overview.",
        "API Documentation: REST endpoints, request/response payloads, auth schemas.",
        "Developer Setup Guide: Prerequisites, environment variables, DB setup.",
        "Architecture Summary: Component diagrams and data flow blueprints."
    ], "Doc Formats", CYAN)

    add_card(s12, 8.8, 1.8, 3.7, 4.9, "In-Browser Markdown Studio", [
        "Split-screen live Markdown preview with syntax highlighting.",
        "One-click 'Copy to Clipboard' and 'Download .md File'.",
        "Direct persistence into MySQL documents table for team sharing.",
        "Full versioned edit history for technical documentation."
    ], "Studio Editor", EMERALD)

    set_notes(s12, "One of DevCollab's most innovative capabilities is AI-Assisted Documentation. Using Google's Gemini 1.5 Flash model, developers can generate comprehensive READMEs, REST API docs, and developer onboarding guides with a single click. The in-browser markdown editor allows instant previewing, editing, downloading, and database saving.")

    # SLIDE 13: NOTIFICATIONS
    s13 = prs.slides.add_slide(blank_layout)
    apply_bg(s13)
    add_header(s13, "Feature Deep Dive: Notification & Alert Engine", "CORE FEATURE #6", 13)

    add_card(s13, 0.8, 1.8, 3.7, 4.9, "Event-Driven Alert Triggers", [
        "Task Assignment: Alerts developer when assigned a new sprint ticket.",
        "Issue Logged: Notifies team when a high/critical defect is created.",
        "Review Requested: Alerts senior engineers to inspect a submitted PR.",
        "Review Approved / Changes: Alerts author of code review verdict."
    ], "Event Triggers", CYAN)

    add_card(s13, 4.8, 1.8, 3.7, 4.9, "Interactive User Experience", [
        "Persistent notification bell in navbar with real-time unread counter badge.",
        "Dedicated Notifications page with full chronological history.",
        "One-click 'Mark as Read' and 'Mark All as Read' bulk actions.",
        "Quick delete action to dismiss completed notifications."
    ], "User Experience", INDIGO)

    add_card(s13, 8.8, 1.8, 3.7, 4.9, "Database Persistence & Sync", [
        "Stored in dedicated notifications table with user foreign key.",
        "Indexed on (user_id, is_read) for instant count(*) execution.",
        "Lightweight pollers keep notification state synchronised across tabs.",
        "Zero notification loss even across user logout and re-login."
    ], "Reliability", EMERALD)

    set_notes(s13, "Our activity notification engine keeps developers aligned. Triggered by task assignments, issue reports, and code reviews, notifications appear in a sticky navbar counter and dedicated inbox. Backed by relational database persistence with optimized composite indexes, users never miss critical project events.")

    # SLIDE 14: DEVOPS & CI/CD
    s14 = prs.slides.add_slide(blank_layout)
    apply_bg(s14)
    add_header(s14, "DevOps, Containerization & CI/CD Pipeline", "DEPLOYMENT ARCHITECTURE", 14)

    add_card(s14, 0.8, 1.8, 3.7, 4.9, "Multi-Container Docker", [
        "docker-compose.yml orchestrates 3 isolated services:",
        "1. devcollab-mysql: MySQL 8.0 with auto-seeded schema & volumes.",
        "2. devcollab-backend: Node.js 24 Alpine container on Port 5000.",
        "3. devcollab-frontend: Production Nginx web server on Port 80.",
        "Health checks guarantee backend starts only after DB is ready."
    ], "Containerization", CYAN)

    add_card(s14, 4.8, 1.8, 3.7, 4.9, "Automated GitHub Actions CI/CD", [
        "Continuous Integration: Validates code, runs linting, executes builds.",
        "Continuous Deployment: Deploys React client to GitHub Pages automatically on push to main.",
        "Automated secret management for API keys and database credentials."
    ], "Pipelines", INDIGO)

    add_card(s14, 8.8, 1.8, 3.7, 4.9, "Multi-Cloud Production Hosting", [
        "Frontend: Hosted on GitHub Pages & Vercel edge CDN for sub-50ms latency.",
        "Backend: Configured for Render.com Web Services via render.yaml.",
        "Database: Managed MySQL cluster with SSL and persistent volumes.",
        "Production-ready CORS, environment configuration, and health check endpoints."
    ], "Cloud Hosting", EMERALD)

    set_notes(s14, "DevCollab is built for enterprise deployment. Using Docker Compose, developers spin up the entire 3-tier stack—database, Express backend, and Nginx frontend—with a single command: docker-compose up. Our CI/CD pipeline on GitHub Actions builds and validates every commit, deploying the frontend to GitHub Pages and the backend to Render.")

    # SLIDE 15: RESULTS & ROADMAP
    s15 = prs.slides.add_slide(blank_layout)
    apply_bg(s15)
    add_header(s15, "Project Impact & Future Enhancements", "IMPACT & ROADMAP", 15)

    add_card(s15, 0.8, 1.8, 3.7, 4.9, "Quantifiable Project Impact", [
        "Centralized 5 developer tools into 1 unified web interface.",
        "Reduced documentation creation time by 85% via Gemini AI synthesis.",
        "Zero-configuration Docker onboarding in under 2 minutes.",
        "Sub-100ms API response times via prepared SQL queries & connection pooling."
    ], "Measured Metrics", EMERALD)

    add_card(s15, 4.8, 1.8, 3.7, 4.9, "Phase 2 Roadmap (Q3-Q4)", [
        "WebSocket / Socket.io: Real-time collaborative live cursor editing.",
        "AI Code Review Bot: Automatic automated code analysis directly on PR submissions.",
        "Slack & Discord Webhooks: Pushing sprint milestones to team chat channels.",
        "Kanban Swimlanes: Epics, custom workflow states, and burndown charts."
    ], "Upcoming Features", CYAN)

    add_card(s15, 8.8, 1.8, 3.7, 4.9, "Phase 3 Long-Term Vision", [
        "GitLab & Bitbucket Multi-VCS support.",
        "Self-hosted LLM support (Ollama / LLaMA 3) for on-premise air-gapped security.",
        "Native Mobile PWA (Progressive Web App) with offline caching.",
        "Single Sign-On (SSO): OAuth2 with GitHub, Google, and Okta SAML."
    ], "Long-Term Vision", PURPLE)

    set_notes(s15, "The results of DevCollab are clear: it cuts documentation time by 85% and consolidates fragmented toolchains. Looking forward, our roadmap includes real-time WebSockets for live collaborative editing, automated AI code review comments, Slack webhooks, and self-hosted LLM support for enterprise on-premise deployments.")

    # SLIDE 16: CONCLUSION & Q&A
    s16 = prs.slides.add_slide(blank_layout)
    apply_bg(s16)

    badge16 = s16.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.9), Inches(1.2), Inches(3.2), Inches(0.42))
    badge16.fill.solid()
    badge16.fill.fore_color.rgb = CARD_BG
    badge16.line.color.rgb = EMERALD
    badge16.line.width = Pt(1)
    b16_tf = badge16.text_frame
    b16_tf.margin_top = Inches(0.08)
    b16_p = b16_tf.paragraphs[0]
    b16_p.text = "SUMMARY & WRAP-UP"
    b16_p.font.name = 'Segoe UI'
    b16_p.font.size = Pt(10)
    b16_p.font.bold = True
    b16_p.font.color.rgb = EMERALD
    b16_p.alignment = PP_ALIGN.CENTER

    t16_box = s16.shapes.add_textbox(Inches(0.9), Inches(1.8), Inches(11.5), Inches(2.0))
    t16_tf = t16_box.text_frame
    t16_tf.word_wrap = True
    p16_1 = t16_tf.paragraphs[0]
    p16_1.text = "Thank You! Questions & Discussion"
    p16_1.font.name = 'Segoe UI'
    p16_1.font.size = Pt(36)
    p16_1.font.bold = True
    p16_1.font.color.rgb = TEXT_LIGHT

    p16_2 = t16_tf.add_paragraph()
    p16_2.text = "DevCollab — Empowering Engineering Teams to Build, Review, and Ship Better Software Faster."
    p16_2.font.name = 'Segoe UI'
    p16_2.font.size = Pt(16)
    p16_2.font.color.rgb = CYAN
    p16_2.space_before = Pt(8)

    add_card(s16, 0.9, 3.8, 3.6, 2.8, "Live Deployment", [
        "Hosted on GitHub Pages & Render",
        "URL: https://tembarenigoutham.github.io/Developer-Collaboration-Platform/",
        "Pre-seeded demo accounts ready for testing"
    ], "Live Web App", CYAN)

    add_card(s16, 4.8, 3.8, 3.6, 2.8, "Open Source Repository", [
        "GitHub: tembarenigoutham/Developer-Collaboration-Platform",
        "License: MIT Open Source",
        "Includes Docker Compose & Automated CI/CD"
    ], "Source Code", INDIGO)

    add_card(s16, 8.7, 3.8, 3.6, 2.8, "Key Takeaways", [
        "Modern React 18 + Node.js 24 + MySQL 8 stack",
        "Seamless GitHub REST API & Gemini AI integration",
        "Production-grade security with JWT and RBAC"
    ], "Highlights", EMERALD)

    set_notes(s16, "Thank you for your time and attention. DevCollab is fully open-source, deployed live, and backed by a comprehensive full-stack architecture. I would now love to open the floor to any questions, architecture discussions, or live demonstrations.")

    prs.save(output_path)
    print(f"Presentation successfully created at: {output_path}")

if __name__ == '__main__':
    target = sys.argv[1] if len(sys.argv) > 1 else 'DevCollab_Project_Presentation.pptx'
    create_presentation(target)
