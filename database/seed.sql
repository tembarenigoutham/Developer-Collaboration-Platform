-- =============================================================================
-- Developer Collaboration Platform - Initial Seed Data
-- Demo Credentials:
--   Email: alex@example.com   | Password: password123 (Lead Architect / Owner)
--   Email: sarah@example.com  | Password: password123 (Senior Backend Dev)
--   Email: david@example.com  | Password: password123 (Frontend Specialist)
-- =============================================================================

USE `developer_platform`;

-- Disable FK checks for clean seeding
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE `notifications`;
TRUNCATE TABLE `github_accounts`;
TRUNCATE TABLE `documents`;
TRUNCATE TABLE `review_comments`;
TRUNCATE TABLE `code_reviews`;
TRUNCATE TABLE `issue_comments`;
TRUNCATE TABLE `issues`;
TRUNCATE TABLE `tasks`;
TRUNCATE TABLE `project_members`;
TRUNCATE TABLE `projects`;
TRUNCATE TABLE `users`;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. Seed Users
INSERT INTO `users` (`id`, `name`, `email`, `password`, `profile_image`, `system_role`, `created_at`) VALUES
(1, 'Goutham R', 'rgoutham079@gmail.com', '$2b$10$pnjOMn0ig8hxikWLO.dV2OPr9KlgG6miZ.A/3Mfv5gQgzLWdmFL0i', NULL, 'OWNER', NOW()),
(2, 'Sarah Connor', 'sarah@example.com', '$2b$10$pnjOMn0ig8hxikWLO.dV2OPr9KlgG6miZ.A/3Mfv5gQgzLWdmFL0i', NULL, 'USER', NOW()),
(3, 'David Miller', 'david@example.com', '$2b$10$pnjOMn0ig8hxikWLO.dV2OPr9KlgG6miZ.A/3Mfv5gQgzLWdmFL0i', NULL, 'USER', NOW());

-- 2. Seed Projects
INSERT INTO `projects` (`id`, `name`, `description`, `owner_id`, `github_repo`, `created_at`, `updated_at`) VALUES
(1, 'Cloud Storage Microservice', 'High-throughput S3-compatible multi-cloud distributed storage microservice with chunked encryption and async multipart uploads.', 1, 'expressjs/express', NOW(), NOW()),
(2, 'DevCollab Web Client', 'Production-ready React.js developer collaboration frontend dashboard with real-time Kanban and GitHub integration.', 1, 'facebook/react', NOW(), NOW());

-- 3. Seed Project Members
INSERT INTO `project_members` (`id`, `project_id`, `user_id`, `role`, `joined_at`) VALUES
(1, 1, 1, 'OWNER', NOW()),
(2, 1, 2, 'DEVELOPER', NOW()),
(3, 1, 3, 'DEVELOPER', NOW()),
(4, 2, 1, 'OWNER', NOW()),
(5, 2, 3, 'ADMIN', NOW());

-- 4. Seed Tasks
INSERT INTO `tasks` (`id`, `project_id`, `title`, `description`, `assigned_to`, `created_by`, `status`, `priority`, `due_date`, `created_at`, `updated_at`) VALUES
(1, 1, 'Configure MySQL connection pool & migrations', 'Set up pool connection limits, error handlers, and auto schema verification.', 2, 1, 'DONE', 'HIGH', DATE_ADD(CURRENT_DATE, INTERVAL 3 DAY), NOW(), NOW()),
(2, 1, 'Implement JWT authentication & refresh tokens', 'Secure endpoints with Bearer token authentication and bcrypt hashed passwords.', 2, 1, 'REVIEW', 'CRITICAL', DATE_ADD(CURRENT_DATE, INTERVAL 5 DAY), NOW(), NOW()),
(3, 1, 'Integrate GitHub REST API endpoints', 'Add commit, branch, pull request, and repository stats proxy handlers.', 3, 1, 'IN_PROGRESS', 'MEDIUM', DATE_ADD(CURRENT_DATE, INTERVAL 7 DAY), NOW(), NOW()),
(4, 1, 'Build AI Documentation synthesis module', 'Integrate prompt engineering for README, architecture summary, and API docs.', 1, 1, 'TODO', 'HIGH', DATE_ADD(CURRENT_DATE, INTERVAL 10 DAY), NOW(), NOW());

-- 5. Seed Issues
INSERT INTO `issues` (`id`, `project_id`, `title`, `description`, `reported_by`, `assigned_to`, `priority`, `status`, `created_at`, `updated_at`) VALUES
(1, 1, 'Database pool timeout on concurrent batch requests', 'Under high volume load, connection pool triggers timeout when queries take longer than 10s.', 2, 1, 'HIGH', 'OPEN', NOW(), NOW()),
(2, 1, 'Missing CORS headers on preflight OPTIONS in production', 'Need to ensure Access-Control-Allow-Origin header is properly reflected on preflight.', 3, 2, 'MEDIUM', 'RESOLVED', NOW(), NOW());

-- 6. Seed Issue Comments
INSERT INTO `issue_comments` (`id`, `issue_id`, `user_id`, `comment`, `created_at`) VALUES
(1, 1, 1, 'I inspected the pooling configuration; we should increase connectionLimit to 20 and enable keepAlive.', NOW()),
(2, 1, 2, 'Agreed, will test this change with the stress-test suite today.', NOW());

-- 7. Seed Code Reviews
INSERT INTO `code_reviews` (`id`, `project_id`, `pull_request_url`, `title`, `description`, `submitted_by`, `reviewer_id`, `status`, `created_at`, `updated_at`) VALUES
(1, 1, 'https://github.com/expressjs/express/pull/5432', 'Feature: Centralized error handling and API health probe', 'Adds unified error middleware covering 400, 401, 403, 404, 409, and 500 status codes.', 2, 1, 'PENDING', NOW(), NOW());

-- 8. Seed Review Comments
INSERT INTO `review_comments` (`id`, `review_id`, `user_id`, `comment`, `created_at`) VALUES
(1, 1, 1, 'Looks clean! Make sure stack traces are only included in development mode.', NOW());

-- 9. Seed Documents
INSERT INTO `documents` (`id`, `project_id`, `title`, `content`, `document_type`, `created_by`, `created_at`, `updated_at`) VALUES
(1, 1, 'Architecture Design Document', '# Cloud Storage Microservice\n\n## Overview\nThis service provides distributed chunked uploads and high-availability storage orchestration.\n\n## Security\nAll endpoints require JWT Bearer authentication.', 'SUMMARY', 1, NOW(), NOW());

-- 10. Seed Notifications
INSERT INTO `notifications` (`id`, `user_id`, `type`, `message`, `is_read`, `created_at`) VALUES
(1, 1, 'CODE_REVIEW', 'Sarah submitted code review: Feature: Centralized error handling', 0, NOW()),
(2, 1, 'ISSUE_REPORTED', 'Sarah reported issue: Database pool timeout on concurrent batch requests', 0, NOW()),
(3, 2, 'TASK_ASSIGNED', 'You were assigned task: Configure MySQL connection pool & migrations', 1, NOW());
