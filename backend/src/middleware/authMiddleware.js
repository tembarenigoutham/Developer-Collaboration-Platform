import { verifyToken } from '../utils/token.js';
import { query } from '../config/db.js';
import { AppError } from './errorMiddleware.js';

/**
 * Authentication Middleware: Validates JWT Bearer token and attaches user to req
 */
export const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Authentication required. Missing Bearer token.', 401);
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new AppError('Authentication token missing.', 401);
    }

    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        throw new AppError('Session expired. Please log in again.', 401);
      }
      throw new AppError('Invalid authentication token.', 401);
    }

    // Retrieve user from DB to ensure user is active and exists
    const users = await query(
      'SELECT id, name, email, profile_image, system_role, created_at FROM users WHERE id = ?',
      [decoded.id]
    );

    if (!users || users.length === 0) {
      throw new AppError('User belonging to this token no longer exists.', 401);
    }

    req.user = users[0];
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Project Member Role Authorization Middleware
 * Verifies if the authenticated user has one of the allowed roles in the project
 * @param {Array<string>} allowedRoles e.g. ['OWNER', 'ADMIN']
 */
export const requireProjectRole = (allowedRoles = []) => {
  return async (req, res, next) => {
    try {
      const projectId = req.params.id || req.params.projectId || req.body.project_id;
      if (!projectId) {
        throw new AppError('Project ID is required for authorization check.', 400);
      }

      const members = await query(
        'SELECT role FROM project_members WHERE project_id = ? AND user_id = ?',
        [projectId, req.user.id]
      );

      if (!members || members.length === 0) {
        throw new AppError('Access denied. You are not a member of this project.', 403);
      }

      const userRole = members[0].role;
      req.projectRole = userRole;

      if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
        throw new AppError(
          `Access denied. Requires one of [${allowedRoles.join(', ')}] role. Your role: ${userRole}.`,
          403
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
