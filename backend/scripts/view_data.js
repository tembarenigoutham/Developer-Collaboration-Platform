import { query } from '../src/config/db.js';

async function showAllData() {
  console.log('\n=============================================================');
  console.log('📊 DEVCOLLAB PLATFORM — LIVE DATABASE INSPECTION');
  console.log('=============================================================\n');

  try {
    // 1. Users
    console.log('👤 REGISTERED USERS:');
    const users = await query('SELECT id, name, email, system_role, title, created_at FROM users');
    console.table(users);

    // 2. Projects
    console.log('\n📁 PROJECT WORKSPACES:');
    const projects = await query('SELECT id, name, github_repo, owner_id, created_at FROM projects');
    console.table(projects);

    // 3. Tasks
    console.log('\n📋 KANBAN TASKS:');
    const tasks = await query('SELECT id, project_id, title, status, priority, assigned_to FROM tasks');
    console.table(tasks);

    // 4. Issues
    console.log('\n🐛 DEFECT & ISSUE TICKETS:');
    const issues = await query('SELECT id, project_id, title, status, priority, reported_by FROM issues');
    console.table(issues);

    // 5. Code Reviews
    console.log('\n🔍 PULL REQUEST CODE REVIEWS:');
    const reviews = await query('SELECT id, project_id, title, status, submitted_by FROM code_reviews');
    console.table(reviews);

    // 6. Project Messages (Team Chat)
    console.log('\n💬 TEAM CHAT MESSAGES:');
    const msgs = await query(`
      SELECT m.id, p.name as project, u.name as user, m.message, m.created_at 
      FROM project_messages m
      JOIN projects p ON m.project_id = p.id
      JOIN users u ON m.user_id = u.id
    `);
    console.table(msgs);

    console.log('\n=============================================================');
    console.log('✅ Connected to database: developer_platform');
    console.log('=============================================================\n');
    process.exit(0);
  } catch (err) {
    console.error('Error querying database:', err.message);
    process.exit(1);
  }
}

showAllData();
