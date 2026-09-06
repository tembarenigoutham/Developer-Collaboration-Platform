import { query } from '../config/db.js';
import { AppError } from '../middleware/errorMiddleware.js';

/**
 * Get all code reviews for a project
 * GET /api/projects/:id/reviews
 */
export const getProjectReviews = async (req, res, next) => {
  try {
    const projectId = req.params.id;
    const { status } = req.query;

    let sql = `
      SELECT 
        r.*,
        submitter.name as submitter_name,
        submitter.email as submitter_email,
        reviewer.name as reviewer_name,
        reviewer.email as reviewer_email,
        (SELECT COUNT(*) FROM review_comments WHERE review_id = r.id) as comment_count
      FROM code_reviews r
      JOIN users submitter ON r.submitted_by = submitter.id
      LEFT JOIN users reviewer ON r.reviewer_id = reviewer.id
      WHERE r.project_id = ?
    `;
    const params = [projectId];

    if (status && status !== 'ALL') {
      sql += ' AND r.status = ?';
      params.push(status);
    }

    sql += ' ORDER BY FIELD(r.status, "PENDING", "CHANGES_REQUESTED", "APPROVED"), r.updated_at DESC';

    const reviews = await query(sql, params);

    res.status(200).json({
      success: true,
      data: reviews
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get code review details with comments
 * GET /api/reviews/:id
 */
export const getReviewById = async (req, res, next) => {
  try {
    const reviewId = req.params.id;

    const [review] = await query(
      `SELECT 
        r.*,
        p.name as project_name,
        submitter.name as submitter_name,
        submitter.email as submitter_email,
        reviewer.name as reviewer_name,
        reviewer.email as reviewer_email
      FROM code_reviews r
      JOIN projects p ON r.project_id = p.id
      JOIN users submitter ON r.submitted_by = submitter.id
      LEFT JOIN users reviewer ON r.reviewer_id = reviewer.id
      WHERE r.id = ?`,
      [reviewId]
    );

    if (!review) {
      throw new AppError('Code review not found.', 404);
    }

    // Fetch review comments
    const comments = await query(
      `SELECT 
        rc.*,
        u.name as author_name,
        u.email as author_email,
        u.profile_image
      FROM review_comments rc
      JOIN users u ON rc.user_id = u.id
      WHERE rc.review_id = ?
      ORDER BY rc.created_at ASC`,
      [reviewId]
    );

    res.status(200).json({
      success: true,
      data: {
        ...review,
        comments
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Submit code review
 * POST /api/projects/:id/reviews
 */
export const createReview = async (req, res, next) => {
  try {
    const projectId = req.params.id;
    const submitterId = req.user.id;
    const { title, pull_request_url, description, reviewer_id } = req.body;

    if (!title || !title.trim()) {
      throw new AppError('Review title is required.', 400);
    }
    if (!pull_request_url || !pull_request_url.trim()) {
      throw new AppError('Pull request URL is required.', 400);
    }

    const result = await query(
      `INSERT INTO code_reviews 
        (project_id, pull_request_url, title, description, submitted_by, reviewer_id, status)
       VALUES (?, ?, ?, ?, ?, ?, 'PENDING')`,
      [
        projectId,
        pull_request_url.trim(),
        title.trim(),
        description ? description.trim() : null,
        submitterId,
        reviewer_id || null
      ]
    );

    const reviewId = result.insertId;

    // Send notification if reviewer assigned
    if (reviewer_id && reviewer_id !== submitterId) {
      const [proj] = await query('SELECT name FROM projects WHERE id = ?', [projectId]);
      await query(
        'INSERT INTO notifications (user_id, type, message) VALUES (?, ?, ?)',
        [reviewer_id, 'REVIEW_REQUESTED', `${req.user.name} requested your review on PR: "${title.trim()}" in ${proj?.name || 'project'}.`]
      );
    }

    const newReview = await query(
      `SELECT r.*, submitter.name as submitter_name, reviewer.name as reviewer_name
       FROM code_reviews r
       JOIN users submitter ON r.submitted_by = submitter.id
       LEFT JOIN users reviewer ON r.reviewer_id = reviewer.id
       WHERE r.id = ?`,
      [reviewId]
    );

    res.status(201).json({
      success: true,
      message: 'Code review submitted successfully',
      data: newReview[0]
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update code review status / details
 * PUT /api/reviews/:id
 */
export const updateReview = async (req, res, next) => {
  try {
    const reviewId = req.params.id;
    const userId = req.user.id;
    const { status, reviewer_id, description, title } = req.body;

    const [existing] = await query('SELECT * FROM code_reviews WHERE id = ?', [reviewId]);
    if (!existing) {
      throw new AppError('Code review not found.', 404);
    }

    const validStatuses = ['PENDING', 'APPROVED', 'CHANGES_REQUESTED'];
    const updatedStatus = (status && validStatuses.includes(status)) ? status : existing.status;
    const updatedReviewer = reviewer_id !== undefined ? (reviewer_id ? parseInt(reviewer_id, 10) : null) : existing.reviewer_id;
    const updatedTitle = title !== undefined ? title.trim() : existing.title;
    const updatedDesc = description !== undefined ? (description ? description.trim() : null) : existing.description;

    await query(
      `UPDATE code_reviews 
       SET status = ?, reviewer_id = ?, title = ?, description = ?
       WHERE id = ?`,
      [updatedStatus, updatedReviewer, updatedTitle, updatedDesc, reviewId]
    );

    // Send notification to submitter on status change
    if (status && status !== existing.status && existing.submitted_by !== userId) {
      const msg = status === 'APPROVED' 
        ? `${req.user.name} approved your code review "${existing.title}".`
        : `${req.user.name} requested changes on your code review "${existing.title}".`;

      await query(
        'INSERT INTO notifications (user_id, type, message) VALUES (?, ?, ?)',
        [existing.submitted_by, status === 'APPROVED' ? 'REVIEW_APPROVED' : 'CHANGES_REQUESTED', msg]
      );
    }

    const updated = await query(
      `SELECT r.*, submitter.name as submitter_name, reviewer.name as reviewer_name
       FROM code_reviews r
       JOIN users submitter ON r.submitted_by = submitter.id
       LEFT JOIN users reviewer ON r.reviewer_id = reviewer.id
       WHERE r.id = ?`,
      [reviewId]
    );

    res.status(200).json({
      success: true,
      message: 'Code review updated successfully',
      data: updated[0]
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add comment to code review
 * POST /api/reviews/:id/comments
 */
export const addReviewComment = async (req, res, next) => {
  try {
    const reviewId = req.params.id;
    const userId = req.user.id;
    const { comment } = req.body;

    if (!comment || !comment.trim()) {
      throw new AppError('Comment text cannot be empty.', 400);
    }

    const [review] = await query('SELECT submitted_by, title FROM code_reviews WHERE id = ?', [reviewId]);
    if (!review) {
      throw new AppError('Code review not found.', 404);
    }

    const result = await query(
      'INSERT INTO review_comments (review_id, user_id, comment) VALUES (?, ?, ?)',
      [reviewId, userId, comment.trim()]
    );

    const commentId = result.insertId;

    // Send notification to submitter if commenter is someone else
    if (review.submitted_by && review.submitted_by !== userId) {
      await query(
        'INSERT INTO notifications (user_id, type, message) VALUES (?, ?, ?)',
        [review.submitted_by, 'REVIEW_COMMENT', `${req.user.name} commented on your code review "${review.title}".`]
      );
    }

    const newComment = await query(
      `SELECT rc.*, u.name as author_name, u.email as author_email, u.profile_image
       FROM review_comments rc
       JOIN users u ON rc.user_id = u.id
       WHERE rc.id = ?`,
      [commentId]
    );

    res.status(201).json({
      success: true,
      message: 'Review comment added successfully',
      data: newComment[0]
    });
  } catch (error) {
    next(error);
  }
};
