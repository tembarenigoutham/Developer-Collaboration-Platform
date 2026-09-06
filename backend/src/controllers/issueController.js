import { query } from '../config/db.js';
import { AppError } from '../middleware/errorMiddleware.js';

/**
 * Get all issues for a project
 * GET /api/projects/:id/issues
 */
export const getProjectIssues = async (req, res, next) => {
  try {
    const projectId = req.params.id;
    const { status, priority, search } = req.query;

    let sql = `
      SELECT 
        i.*,
        reporter.name as reporter_name,
        reporter.email as reporter_email,
        assignee.name as assignee_name,
        assignee.email as assignee_email,
        (SELECT COUNT(*) FROM issue_comments WHERE issue_id = i.id) as comment_count
      FROM issues i
      JOIN users reporter ON i.reported_by = reporter.id
      LEFT JOIN users assignee ON i.assigned_to = assignee.id
      WHERE i.project_id = ?
    `;
    const params = [projectId];

    if (status && status !== 'ALL') {
      sql += ' AND i.status = ?';
      params.push(status);
    }

    if (priority && priority !== 'ALL') {
      sql += ' AND i.priority = ?';
      params.push(priority);
    }

    if (search) {
      sql += ' AND (i.title LIKE ? OR i.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    sql += ' ORDER BY FIELD(i.status, "OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"), i.updated_at DESC';

    const issues = await query(sql, params);

    res.status(200).json({
      success: true,
      data: issues
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get issue details by ID with comments
 * GET /api/issues/:id
 */
export const getIssueById = async (req, res, next) => {
  try {
    const issueId = req.params.id;

    const [issue] = await query(
      `SELECT 
        i.*,
        p.name as project_name,
        reporter.name as reporter_name,
        reporter.email as reporter_email,
        assignee.name as assignee_name,
        assignee.email as assignee_email
      FROM issues i
      JOIN projects p ON i.project_id = p.id
      JOIN users reporter ON i.reported_by = reporter.id
      LEFT JOIN users assignee ON i.assigned_to = assignee.id
      WHERE i.id = ?`,
      [issueId]
    );

    if (!issue) {
      throw new AppError('Issue not found.', 404);
    }

    // Fetch comments
    const comments = await query(
      `SELECT 
        c.*,
        u.name as author_name,
        u.email as author_email,
        u.profile_image
      FROM issue_comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.issue_id = ?
      ORDER BY c.created_at ASC`,
      [issueId]
    );

    res.status(200).json({
      success: true,
      data: {
        ...issue,
        comments
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new issue
 * POST /api/projects/:id/issues
 */
export const createIssue = async (req, res, next) => {
  try {
    const projectId = req.params.id;
    const reporterId = req.user.id;
    const { title, description, assigned_to, priority = 'MEDIUM', status = 'OPEN' } = req.body;

    if (!title || !title.trim()) {
      throw new AppError('Issue title is required.', 400);
    }

    const validStatuses = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
    const issueStatus = validStatuses.includes(status) ? status : 'OPEN';

    const validPriorities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
    const issuePriority = validPriorities.includes(priority) ? priority : 'MEDIUM';

    const result = await query(
      `INSERT INTO issues (project_id, title, description, reported_by, assigned_to, priority, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        projectId,
        title.trim(),
        description ? description.trim() : null,
        reporterId,
        assigned_to || null,
        issuePriority,
        issueStatus
      ]
    );

    const issueId = result.insertId;

    // Send notification if assigned
    if (assigned_to && assigned_to !== reporterId) {
      const [proj] = await query('SELECT name FROM projects WHERE id = ?', [projectId]);
      await query(
        'INSERT INTO notifications (user_id, type, message) VALUES (?, ?, ?)',
        [assigned_to, 'ISSUE_ASSIGNED', `You were assigned issue "${title.trim()}" in ${proj?.name || 'project'}.`]
      );
    }

    const newIssue = await query(
      `SELECT i.*, reporter.name as reporter_name, assignee.name as assignee_name
       FROM issues i
       JOIN users reporter ON i.reported_by = reporter.id
       LEFT JOIN users assignee ON i.assigned_to = assignee.id
       WHERE i.id = ?`,
      [issueId]
    );

    res.status(201).json({
      success: true,
      message: 'Issue created successfully',
      data: newIssue[0]
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update issue
 * PUT /api/issues/:id
 */
export const updateIssue = async (req, res, next) => {
  try {
    const issueId = req.params.id;
    const { title, description, assigned_to, priority, status } = req.body;

    const [existing] = await query('SELECT * FROM issues WHERE id = ?', [issueId]);
    if (!existing) {
      throw new AppError('Issue not found.', 404);
    }

    const updatedTitle = title !== undefined ? title.trim() : existing.title;
    const updatedDesc = description !== undefined ? (description ? description.trim() : null) : existing.description;
    const updatedAssigned = assigned_to !== undefined ? (assigned_to ? parseInt(assigned_to, 10) : null) : existing.assigned_to;
    const updatedPriority = priority !== undefined ? priority : existing.priority;
    const updatedStatus = status !== undefined ? status : existing.status;

    await query(
      `UPDATE issues 
       SET title = ?, description = ?, assigned_to = ?, priority = ?, status = ?
       WHERE id = ?`,
      [updatedTitle, updatedDesc, updatedAssigned, updatedPriority, updatedStatus, issueId]
    );

    const updated = await query(
      `SELECT i.*, reporter.name as reporter_name, assignee.name as assignee_name
       FROM issues i
       JOIN users reporter ON i.reported_by = reporter.id
       LEFT JOIN users assignee ON i.assigned_to = assignee.id
       WHERE i.id = ?`,
      [issueId]
    );

    res.status(200).json({
      success: true,
      message: 'Issue updated successfully',
      data: updated[0]
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete issue
 * DELETE /api/issues/:id
 */
export const deleteIssue = async (req, res, next) => {
  try {
    const issueId = req.params.id;
    const [existing] = await query('SELECT * FROM issues WHERE id = ?', [issueId]);
    if (!existing) {
      throw new AppError('Issue not found.', 404);
    }

    await query('DELETE FROM issues WHERE id = ?', [issueId]);

    res.status(200).json({
      success: true,
      message: 'Issue deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add comment to issue
 * POST /api/issues/:id/comments
 */
export const addIssueComment = async (req, res, next) => {
  try {
    const issueId = req.params.id;
    const userId = req.user.id;
    const { comment } = req.body;

    if (!comment || !comment.trim()) {
      throw new AppError('Comment text cannot be empty.', 400);
    }

    const [issue] = await query('SELECT project_id, reported_by, assigned_to, title FROM issues WHERE id = ?', [issueId]);
    if (!issue) {
      throw new AppError('Issue not found.', 404);
    }

    const result = await query(
      'INSERT INTO issue_comments (issue_id, user_id, comment) VALUES (?, ?, ?)',
      [issueId, userId, comment.trim()]
    );

    const commentId = result.insertId;

    // Send notification to reporter if commenter is someone else
    if (issue.reported_by && issue.reported_by !== userId) {
      await query(
        'INSERT INTO notifications (user_id, type, message) VALUES (?, ?, ?)',
        [issue.reported_by, 'ISSUE_COMMENT', `${req.user.name} commented on your issue "${issue.title}".`]
      );
    }

    const newComment = await query(
      `SELECT c.*, u.name as author_name, u.email as author_email, u.profile_image
       FROM issue_comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.id = ?`,
      [commentId]
    );

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      data: newComment[0]
    });
  } catch (error) {
    next(error);
  }
};
