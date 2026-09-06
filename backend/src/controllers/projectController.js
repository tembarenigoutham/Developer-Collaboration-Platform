import { query } from '../config/db.js';
import { AppError } from '../middleware/errorMiddleware.js';

/**
 * Get all projects that the authenticated user owns or is a member of
 * GET /api/projects
 */
export const getProjects = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const search = req.query.search ? `%${req.query.search}%` : null;

    let sql = `
      SELECT 
        p.id,
        p.name,
        p.description,
        p.github_repo,
        p.owner_id,
        p.created_at,
        p.updated_at,
        pm.role AS user_role,
        u.name AS owner_name,
        (SELECT COUNT(*) FROM project_members WHERE project_id = p.id) AS member_count,
        (SELECT COUNT(*) FROM tasks WHERE project_id = p.id) AS task_count,
        (SELECT COUNT(*) FROM issues WHERE project_id = p.id AND status != 'CLOSED') AS open_issue_count
      FROM projects p
      INNER JOIN project_members pm ON p.id = pm.project_id
      INNER JOIN users u ON p.owner_id = u.id
      WHERE pm.user_id = ?
    `;
    const params = [userId];

    if (search) {
      sql += ' AND (p.name LIKE ? OR p.description LIKE ? OR p.github_repo LIKE ?)';
      params.push(search, search, search);
    }

    sql += ' ORDER BY p.updated_at DESC';

    const projects = await query(sql, params);

    res.status(200).json({
      success: true,
      data: projects
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new project
 * POST /api/projects
 */
export const createProject = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { name, description, github_repo } = req.body;

    if (!name || !name.trim()) {
      throw new AppError('Project name is required.', 400);
    }

    // Clean github repo (e.g. facebook/react)
    const cleanRepo = github_repo ? github_repo.trim().replace(/^https?:\/\/github\.com\//, '') : null;

    // 1. Insert Project
    const projectResult = await query(
      'INSERT INTO projects (name, description, owner_id, github_repo) VALUES (?, ?, ?, ?)',
      [name.trim(), description ? description.trim() : null, userId, cleanRepo]
    );

    const projectId = projectResult.insertId;

    // 2. Add creator as OWNER member
    await query(
      'INSERT INTO project_members (project_id, user_id, role) VALUES (?, ?, ?)',
      [projectId, userId, 'OWNER']
    );

    // 3. Record creation notification
    await query(
      'INSERT INTO notifications (user_id, type, message) VALUES (?, ?, ?)',
      [userId, 'PROJECT_CREATED', `Project "${name.trim()}" workspace created successfully.`]
    );

    // Fetch created project
    const newProject = await query(
      `SELECT p.*, 'OWNER' as user_role, u.name as owner_name 
       FROM projects p 
       JOIN users u ON p.owner_id = u.id 
       WHERE p.id = ?`,
      [projectId]
    );

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: newProject[0]
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get project details by ID
 * GET /api/projects/:id
 */
export const getProjectById = async (req, res, next) => {
  try {
    const projectId = req.params.id;
    const userId = req.user.id;

    // Verify user is member of project
    const memberCheck = await query(
      'SELECT role FROM project_members WHERE project_id = ? AND user_id = ?',
      [projectId, userId]
    );

    if (!memberCheck || memberCheck.length === 0) {
      throw new AppError('Project not found or access denied.', 404);
    }

    const userRole = memberCheck[0].role;

    // Fetch project info
    const projects = await query(
      `SELECT 
        p.*,
        u.name AS owner_name,
        u.email AS owner_email,
        (SELECT COUNT(*) FROM project_members WHERE project_id = p.id) AS member_count,
        (SELECT COUNT(*) FROM tasks WHERE project_id = p.id) AS total_tasks,
        (SELECT COUNT(*) FROM tasks WHERE project_id = p.id AND status = 'DONE') AS completed_tasks,
        (SELECT COUNT(*) FROM issues WHERE project_id = p.id AND status != 'CLOSED') AS open_issues,
        (SELECT COUNT(*) FROM code_reviews WHERE project_id = p.id AND status = 'PENDING') AS pending_reviews
      FROM projects p
      JOIN users u ON p.owner_id = u.id
      WHERE p.id = ?`,
      [projectId]
    );

    if (!projects || projects.length === 0) {
      throw new AppError('Project not found.', 404);
    }

    // Fetch members
    const members = await query(
      `SELECT 
        pm.id,
        pm.user_id,
        pm.role,
        pm.joined_at,
        u.name,
        u.email,
        u.profile_image
      FROM project_members pm
      JOIN users u ON pm.user_id = u.id
      WHERE pm.project_id = ?
      ORDER BY FIELD(pm.role, 'OWNER', 'ADMIN', 'DEVELOPER', 'VIEWER'), u.name ASC`,
      [projectId]
    );

    res.status(200).json({
      success: true,
      data: {
        ...projects[0],
        userRole,
        members
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update project details
 * PUT /api/projects/:id
 */
export const updateProject = async (req, res, next) => {
  try {
    const projectId = req.params.id;
    const userId = req.user.id;
    const { name, description, github_repo } = req.body;

    // Check permissions: OWNER or ADMIN
    const memberCheck = await query(
      'SELECT role FROM project_members WHERE project_id = ? AND user_id = ?',
      [projectId, userId]
    );

    if (!memberCheck || memberCheck.length === 0) {
      throw new AppError('Project not found.', 404);
    }

    const role = memberCheck[0].role;
    if (role !== 'OWNER' && role !== 'ADMIN') {
      throw new AppError('Permission denied: Only OWNER or ADMIN can edit project settings.', 403);
    }

    if (!name || !name.trim()) {
      throw new AppError('Project name cannot be empty.', 400);
    }

    const cleanRepo = github_repo ? github_repo.trim().replace(/^https?:\/\/github\.com\//, '') : null;

    await query(
      'UPDATE projects SET name = ?, description = ?, github_repo = ? WHERE id = ?',
      [name.trim(), description ? description.trim() : null, cleanRepo, projectId]
    );

    const updated = await query('SELECT * FROM projects WHERE id = ?', [projectId]);

    res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      data: updated[0]
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a project
 * DELETE /api/projects/:id
 */
export const deleteProject = async (req, res, next) => {
  try {
    const projectId = req.params.id;
    const userId = req.user.id;

    // Only OWNER can delete project
    const project = await query('SELECT owner_id, name FROM projects WHERE id = ?', [projectId]);
    if (!project || project.length === 0) {
      throw new AppError('Project not found.', 404);
    }

    if (project[0].owner_id !== userId) {
      throw new AppError('Permission denied: Only the project OWNER can delete this project.', 403);
    }

    await query('DELETE FROM projects WHERE id = ?', [projectId]);

    res.status(200).json({
      success: true,
      message: `Project "${project[0].name}" and all associated data deleted successfully.`
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add a member to the project
 * POST /api/projects/:id/members
 */
export const addProjectMember = async (req, res, next) => {
  try {
    const projectId = req.params.id;
    const requesterId = req.user.id;
    const { email, role = 'DEVELOPER' } = req.body;

    // Check requester permissions
    const requesterMember = await query(
      'SELECT role FROM project_members WHERE project_id = ? AND user_id = ?',
      [projectId, requesterId]
    );

    if (!requesterMember || !['OWNER', 'ADMIN'].includes(requesterMember[0].role)) {
      throw new AppError('Permission denied: Only OWNER or ADMIN can add team members.', 403);
    }

    if (!email || !email.trim()) {
      throw new AppError('User email is required.', 400);
    }

    const cleanEmail = email.trim().toLowerCase();
    const users = await query('SELECT id, name FROM users WHERE email = ?', [cleanEmail]);
    if (!users || users.length === 0) {
      throw new AppError(`No user found with email "${cleanEmail}".`, 404);
    }

    const targetUser = users[0];

    // Check if already a member
    const existing = await query(
      'SELECT id, role FROM project_members WHERE project_id = ? AND user_id = ?',
      [projectId, targetUser.id]
    );

    if (existing && existing.length > 0) {
      throw new AppError('User is already a member of this project.', 409);
    }

    const validRoles = ['OWNER', 'ADMIN', 'DEVELOPER', 'VIEWER'];
    const assignedRole = validRoles.includes(role.toUpperCase()) ? role.toUpperCase() : 'DEVELOPER';

    await query(
      'INSERT INTO project_members (project_id, user_id, role) VALUES (?, ?, ?)',
      [projectId, targetUser.id, assignedRole]
    );

    // Send notification
    const [proj] = await query('SELECT name FROM projects WHERE id = ?', [projectId]);
    await query(
      'INSERT INTO notifications (user_id, type, message) VALUES (?, ?, ?)',
      [targetUser.id, 'PROJECT_INVITE', `You were added to project "${proj?.name}" as ${assignedRole}.`]
    );

    res.status(201).json({
      success: true,
      message: `Added ${targetUser.name} to project as ${assignedRole}.`,
      data: {
        userId: targetUser.id,
        name: targetUser.name,
        email: cleanEmail,
        role: assignedRole
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update member role
 * PUT /api/projects/:id/members/:userId
 */
export const updateMemberRole = async (req, res, next) => {
  try {
    const projectId = req.params.id;
    const targetUserId = req.params.userId;
    const requesterId = req.user.id;
    const { role } = req.body;

    const requesterMember = await query(
      'SELECT role FROM project_members WHERE project_id = ? AND user_id = ?',
      [projectId, requesterId]
    );

    if (!requesterMember || !['OWNER', 'ADMIN'].includes(requesterMember[0].role)) {
      throw new AppError('Permission denied: Only OWNER or ADMIN can change member roles.', 403);
    }

    const validRoles = ['OWNER', 'ADMIN', 'DEVELOPER', 'VIEWER'];
    if (!validRoles.includes(role)) {
      throw new AppError(`Invalid role. Must be one of: ${validRoles.join(', ')}`, 400);
    }

    await query(
      'UPDATE project_members SET role = ? WHERE project_id = ? AND user_id = ?',
      [role, projectId, targetUserId]
    );

    res.status(200).json({
      success: true,
      message: `Role updated to ${role}.`
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Remove a member from project
 * DELETE /api/projects/:id/members/:userId
 */
export const removeProjectMember = async (req, res, next) => {
  try {
    const projectId = req.params.id;
    const targetUserId = parseInt(req.params.userId, 10);
    const requesterId = req.user.id;

    // Check project owner
    const [project] = await query('SELECT owner_id FROM projects WHERE id = ?', [projectId]);
    if (!project) throw new AppError('Project not found.', 404);

    if (project.owner_id === targetUserId) {
      throw new AppError('Cannot remove project OWNER from the project.', 400);
    }

    // Requester can remove themselves (leave project), or OWNER/ADMIN can remove others
    if (requesterId !== targetUserId) {
      const [requester] = await query(
        'SELECT role FROM project_members WHERE project_id = ? AND user_id = ?',
        [projectId, requesterId]
      );
      if (!requester || !['OWNER', 'ADMIN'].includes(requester.role)) {
        throw new AppError('Permission denied: Only OWNER or ADMIN can remove members.', 403);
      }
    }

    await query(
      'DELETE FROM project_members WHERE project_id = ? AND user_id = ?',
      [projectId, targetUserId]
    );

    res.status(200).json({
      success: true,
      message: 'Member removed from project.'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get messages for a project
 * GET /api/projects/:id/messages
 */
export const getProjectMessages = async (req, res, next) => {
  try {
    const projectId = req.params.id;
    const userId = req.user.id;

    // Verify user is member of project or global owner
    const memberCheck = await query(
      'SELECT role FROM project_members WHERE project_id = ? AND user_id = ?',
      [projectId, userId]
    );

    if ((!memberCheck || memberCheck.length === 0) && req.user.role !== 'OWNER') {
      throw new AppError('Access denied: You are not a member of this project.', 403);
    }

    const messages = await query(
      `SELECT 
        pm.id,
        pm.project_id,
        pm.user_id,
        pm.message,
        pm.created_at,
        u.name AS user_name,
        u.email AS user_email,
        u.title AS user_title,
        u.profile_image
      FROM project_messages pm
      JOIN users u ON pm.user_id = u.id
      WHERE pm.project_id = ?
      ORDER BY pm.created_at ASC
      LIMIT 200`,
      [projectId]
    );

    res.status(200).json({
      success: true,
      data: messages
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Send a message in a project chat
 * POST /api/projects/:id/messages
 */
export const createProjectMessage = async (req, res, next) => {
  try {
    const projectId = req.params.id;
    const userId = req.user.id;
    const { message } = req.body;

    if (!message || !message.trim()) {
      throw new AppError('Message content is required.', 400);
    }

    // Verify user is member of project or global owner
    const memberCheck = await query(
      'SELECT role FROM project_members WHERE project_id = ? AND user_id = ?',
      [projectId, userId]
    );

    if ((!memberCheck || memberCheck.length === 0) && req.user.role !== 'OWNER') {
      throw new AppError('Access denied: You are not a member of this project.', 403);
    }

    const result = await query(
      'INSERT INTO project_messages (project_id, user_id, message) VALUES (?, ?, ?)',
      [projectId, userId, message.trim()]
    );

    const inserted = await query(
      `SELECT 
        pm.id,
        pm.project_id,
        pm.user_id,
        pm.message,
        pm.created_at,
        u.name AS user_name,
        u.email AS user_email,
        u.title AS user_title,
        u.profile_image
      FROM project_messages pm
      JOIN users u ON pm.user_id = u.id
      WHERE pm.id = ?`,
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: inserted[0]
    });
  } catch (error) {
    next(error);
  }
};

