import { query } from '../config/db.js';

/**
 * Get dashboard overview metrics and recent activity for the authenticated user
 * GET /api/dashboard/stats
 */
export const getDashboardStats = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // 1. Metrics Counts
    const [projectCount] = await query(
      'SELECT COUNT(*) as count FROM project_members WHERE user_id = ?',
      [userId]
    );

    const [taskCount] = await query(
      `SELECT COUNT(*) as count 
       FROM tasks t
       JOIN project_members pm ON t.project_id = pm.project_id
       WHERE pm.user_id = ? AND t.status != 'DONE'`,
      [userId]
    );

    const [issueCount] = await query(
      `SELECT COUNT(*) as count 
       FROM issues i
       JOIN project_members pm ON i.project_id = pm.project_id
       WHERE pm.user_id = ? AND i.status != 'CLOSED'`,
      [userId]
    );

    const [reviewCount] = await query(
      `SELECT COUNT(*) as count 
       FROM code_reviews cr
       JOIN project_members pm ON cr.project_id = pm.project_id
       WHERE pm.user_id = ? AND cr.status = 'PENDING'`,
      [userId]
    );

    // 2. Recent Projects
    const recentProjects = await query(
      `SELECT 
        p.id,
        p.name,
        p.description,
        p.github_repo,
        p.updated_at,
        pm.role as user_role,
        (SELECT COUNT(*) FROM tasks WHERE project_id = p.id) as task_count,
        (SELECT COUNT(*) FROM tasks WHERE project_id = p.id AND status = 'DONE') as done_task_count
       FROM projects p
       JOIN project_members pm ON p.id = pm.project_id
       WHERE pm.user_id = ?
       ORDER BY p.updated_at DESC
       LIMIT 4`,
      [userId]
    );

    // 3. Recent Activity (synthesized from tasks, issues, and code reviews)
    const recentTasks = await query(
      `SELECT 
        'TASK' as type,
        t.title as item_title,
        t.status as item_status,
        t.updated_at as activity_date,
        p.name as project_name,
        u.name as actor_name
       FROM tasks t
       JOIN projects p ON t.project_id = p.id
       JOIN users u ON t.created_by = u.id
       JOIN project_members pm ON p.id = pm.project_id
       WHERE pm.user_id = ?
       ORDER BY t.updated_at DESC
       LIMIT 5`,
      [userId]
    );

    const recentIssues = await query(
      `SELECT 
        'ISSUE' as type,
        i.title as item_title,
        i.status as item_status,
        i.updated_at as activity_date,
        p.name as project_name,
        u.name as actor_name
       FROM issues i
       JOIN projects p ON i.project_id = p.id
       JOIN users u ON i.reported_by = u.id
       JOIN project_members pm ON p.id = pm.project_id
       WHERE pm.user_id = ?
       ORDER BY i.updated_at DESC
       LIMIT 5`,
      [userId]
    );

    // Combine and sort activities
    const combinedActivity = [...recentTasks, ...recentIssues]
      .sort((a, b) => new Date(b.activity_date) - new Date(a.activity_date))
      .slice(0, 6);

    // 4. Registered users list (all users who created accounts and entered details)
    const registeredUsers = await query(
      `SELECT 
        u.id,
        u.name,
        u.email,
        u.profile_image,
        u.system_role,
        u.status,
        u.title,
        u.bio,
        u.skills,
        u.github_url,
        u.linkedin_url,
        u.created_at,
        (SELECT COUNT(*) FROM tasks WHERE assigned_to = u.id) as assigned_tasks,
        (SELECT COUNT(*) FROM tasks WHERE created_by = u.id) as created_tasks,
        (SELECT COUNT(*) FROM tasks WHERE assigned_to = u.id AND status = 'DONE') as completed_tasks,
        (SELECT COUNT(*) FROM issues WHERE reported_by = u.id) as reported_issues,
        (SELECT COUNT(*) FROM project_members WHERE user_id = u.id) as project_count
       FROM users u
       ORDER BY u.created_at DESC`
    );

    // Compute contribution leaderboard
    const leaderboard = registeredUsers
      .map((u) => {
        const completed = parseInt(u.completed_tasks, 10) || 0;
        const created = parseInt(u.created_tasks, 10) || 0;
        const issues = parseInt(u.reported_issues, 10) || 0;
        const score = completed * 15 + created * 10 + issues * 8;
        return {
          id: u.id,
          name: u.name,
          email: u.email,
          title: u.title || 'Software Engineer',
          score,
          completed_tasks: completed,
          created_tasks: created,
          reported_issues: issues
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    res.status(200).json({
      success: true,
      data: {
        stats: {
          projects: projectCount?.count || 0,
          tasks: taskCount?.count || 0,
          issues: issueCount?.count || 0,
          reviews: reviewCount?.count || 0,
          users: registeredUsers.length
        },
        recentProjects,
        recentActivity: combinedActivity,
        registeredUsers,
        leaderboard
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all registered platform users with their details
 * GET /api/dashboard/users
 */
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await query(
      `SELECT 
        u.id,
        u.name,
        u.email,
        u.profile_image,
        u.system_role,
        u.status,
        u.title,
        u.bio,
        u.skills,
        u.github_url,
        u.linkedin_url,
        u.created_at,
        (SELECT COUNT(*) FROM tasks WHERE assigned_to = u.id) as assigned_tasks,
        (SELECT COUNT(*) FROM tasks WHERE created_by = u.id) as created_tasks,
        (SELECT COUNT(*) FROM tasks WHERE assigned_to = u.id AND status = 'DONE') as completed_tasks,
        (SELECT COUNT(*) FROM issues WHERE reported_by = u.id) as reported_issues,
        (SELECT COUNT(*) FROM project_members WHERE user_id = u.id) as project_count
       FROM users u
       ORDER BY u.created_at DESC`
    );

    res.status(200).json({
      success: true,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user status (Active / Suspended)
 * PUT /api/dashboard/users/:id/status
 */
export const updateUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const requestingUser = req.user;

    const isOwner = requestingUser?.system_role === 'OWNER' || requestingUser?.email === 'rgoutham079@gmail.com';
    if (!isOwner) {
      throw new AppError('Only the Platform Owner can update user account status.', 403);
    }

    const [targetUser] = await query('SELECT email, system_role FROM users WHERE id = ?', [id]);
    if (!targetUser) {
      throw new AppError('User not found.', 404);
    }
    if (targetUser.email === 'rgoutham079@gmail.com' || targetUser.system_role === 'OWNER') {
      throw new AppError('The Platform Owner account cannot be suspended.', 400);
    }

    const newStatus = status === 'SUSPENDED' ? 'SUSPENDED' : 'ACTIVE';
    await query('UPDATE users SET status = ? WHERE id = ?', [newStatus, id]);

    res.status(200).json({
      success: true,
      message: `User status successfully changed to ${newStatus}`,
      data: { id, status: newStatus }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Assign a platform user to a project with a role
 * POST /api/dashboard/users/:id/assign-project
 */
export const assignUserToProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { project_id, role = 'DEVELOPER' } = req.body;
    const requestingUser = req.user;

    const isOwner = requestingUser?.system_role === 'OWNER' || requestingUser?.email === 'rgoutham079@gmail.com';
    if (!isOwner) {
      throw new AppError('Only the Platform Owner can assign members to projects.', 403);
    }

    if (!project_id) {
      throw new AppError('Project ID is required.', 400);
    }

    const [existing] = await query(
      'SELECT * FROM project_members WHERE project_id = ? AND user_id = ?',
      [project_id, id]
    );

    if (existing) {
      await query(
        'UPDATE project_members SET role = ? WHERE project_id = ? AND user_id = ?',
        [role, project_id, id]
      );
    } else {
      await query(
        'INSERT INTO project_members (project_id, user_id, role) VALUES (?, ?, ?)',
        [project_id, id, role]
      );
    }

    res.status(200).json({
      success: true,
      message: 'User successfully assigned to project',
      data: { project_id, user_id: id, role }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get detailed activity timeline for a user
 * GET /api/dashboard/users/:id/activity
 */
export const getUserActivity = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [user] = await query(
      'SELECT id, name, email, title, bio, skills, github_url, linkedin_url, status, system_role, created_at FROM users WHERE id = ?',
      [id]
    );

    if (!user) {
      throw new AppError('User not found', 404);
    }

    const tasks = await query(
      `SELECT t.*, p.name as project_name 
       FROM tasks t 
       JOIN projects p ON t.project_id = p.id 
       WHERE t.assigned_to = ? OR t.created_by = ? 
       ORDER BY t.updated_at DESC LIMIT 10`,
      [id, id]
    );

    const issues = await query(
      `SELECT i.*, p.name as project_name 
       FROM issues i 
       JOIN projects p ON i.project_id = p.id 
       WHERE i.reported_by = ? OR i.assigned_to = ? 
       ORDER BY i.updated_at DESC LIMIT 10`,
      [id, id]
    );

    const projects = await query(
      `SELECT p.id, p.name, p.description, pm.role, pm.joined_at 
       FROM projects p 
       JOIN project_members pm ON p.id = pm.project_id 
       WHERE pm.user_id = ? 
       ORDER BY pm.joined_at DESC`,
      [id]
    );

    res.status(200).json({
      success: true,
      data: {
        user,
        tasks,
        issues,
        projects
      }
    });
  } catch (error) {
    next(error);
  }
};
