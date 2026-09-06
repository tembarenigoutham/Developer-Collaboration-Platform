import { query } from '../config/db.js';
import { AppError } from '../middleware/errorMiddleware.js';

/**
 * Get all tasks for a project
 * GET /api/projects/:id/tasks
 */
export const getProjectTasks = async (req, res, next) => {
  try {
    const projectId = req.params.id;
    const { status, priority, search } = req.query;

    let sql = `
      SELECT 
        t.*,
        assignee.name as assignee_name,
        assignee.email as assignee_email,
        creator.name as creator_name
      FROM tasks t
      LEFT JOIN users assignee ON t.assigned_to = assignee.id
      JOIN users creator ON t.created_by = creator.id
      WHERE t.project_id = ?
    `;
    const params = [projectId];

    if (status && status !== 'ALL') {
      sql += ' AND t.status = ?';
      params.push(status);
    }

    if (priority && priority !== 'ALL') {
      sql += ' AND t.priority = ?';
      params.push(priority);
    }

    if (search) {
      sql += ' AND (t.title LIKE ? OR t.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    sql += ' ORDER BY FIELD(t.priority, "CRITICAL", "HIGH", "MEDIUM", "LOW"), t.created_at DESC';

    const tasks = await query(sql, params);

    res.status(200).json({
      success: true,
      data: tasks
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new task in a project
 * POST /api/projects/:id/tasks
 */
export const createTask = async (req, res, next) => {
  try {
    const projectId = req.params.id;
    const creatorId = req.user.id;
    const { title, description, assigned_to, status = 'TODO', priority = 'MEDIUM', due_date } = req.body;

    if (!title || !title.trim()) {
      throw new AppError('Task title is required.', 400);
    }

    const validStatuses = ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'];
    const taskStatus = validStatuses.includes(status) ? status : 'TODO';

    const validPriorities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
    const taskPriority = validPriorities.includes(priority) ? priority : 'MEDIUM';

    const result = await query(
      `INSERT INTO tasks 
        (project_id, title, description, assigned_to, created_by, status, priority, due_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        projectId,
        title.trim(),
        description ? description.trim() : null,
        assigned_to || null,
        creatorId,
        taskStatus,
        taskPriority,
        due_date || null
      ]
    );

    const taskId = result.insertId;

    // Send notification if assigned to another user
    if (assigned_to && assigned_to !== creatorId) {
      const [proj] = await query('SELECT name FROM projects WHERE id = ?', [projectId]);
      await query(
        'INSERT INTO notifications (user_id, type, message) VALUES (?, ?, ?)',
        [assigned_to, 'TASK_ASSIGNED', `You were assigned task "${title.trim()}" in ${proj?.name || 'project'}.`]
      );
    }

    const newTask = await query(
      `SELECT t.*, assignee.name as assignee_name, creator.name as creator_name
       FROM tasks t
       LEFT JOIN users assignee ON t.assigned_to = assignee.id
       JOIN users creator ON t.created_by = creator.id
       WHERE t.id = ?`,
      [taskId]
    );

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: newTask[0]
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update an existing task
 * PUT /api/tasks/:id
 */
export const updateTask = async (req, res, next) => {
  try {
    const taskId = req.params.id;
    const userId = req.user.id;
    const { title, description, assigned_to, status, priority, due_date } = req.body;

    const [existingTask] = await query('SELECT * FROM tasks WHERE id = ?', [taskId]);
    if (!existingTask) {
      throw new AppError('Task not found.', 404);
    }

    // Prepare update parameters
    const updatedTitle = title !== undefined ? title.trim() : existingTask.title;
    const updatedDesc = description !== undefined ? (description ? description.trim() : null) : existingTask.description;
    const updatedAssigned = assigned_to !== undefined ? (assigned_to ? parseInt(assigned_to, 10) : null) : existingTask.assigned_to;
    const updatedStatus = status !== undefined ? status : existingTask.status;
    const updatedPriority = priority !== undefined ? priority : existingTask.priority;
    const updatedDueDate = due_date !== undefined ? (due_date || null) : existingTask.due_date;

    await query(
      `UPDATE tasks 
       SET title = ?, description = ?, assigned_to = ?, status = ?, priority = ?, due_date = ?
       WHERE id = ?`,
      [updatedTitle, updatedDesc, updatedAssigned, updatedStatus, updatedPriority, updatedDueDate, taskId]
    );

    // Notify assignee if newly assigned
    if (updatedAssigned && updatedAssigned !== existingTask.assigned_to && updatedAssigned !== userId) {
      await query(
        'INSERT INTO notifications (user_id, type, message) VALUES (?, ?, ?)',
        [updatedAssigned, 'TASK_ASSIGNED', `You were assigned task "${updatedTitle}".`]
      );
    }

    const updated = await query(
      `SELECT t.*, assignee.name as assignee_name, creator.name as creator_name
       FROM tasks t
       LEFT JOIN users assignee ON t.assigned_to = assignee.id
       JOIN users creator ON t.created_by = creator.id
       WHERE t.id = ?`,
      [taskId]
    );

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: updated[0]
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a task
 * DELETE /api/tasks/:id
 */
export const deleteTask = async (req, res, next) => {
  try {
    const taskId = req.params.id;
    const [existingTask] = await query('SELECT * FROM tasks WHERE id = ?', [taskId]);
    if (!existingTask) {
      throw new AppError('Task not found.', 404);
    }

    await query('DELETE FROM tasks WHERE id = ?', [taskId]);

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};
