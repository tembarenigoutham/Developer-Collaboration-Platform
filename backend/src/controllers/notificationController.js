import { query } from '../config/db.js';
import { AppError } from '../middleware/errorMiddleware.js';

/**
 * Get all notifications for authenticated user
 * GET /api/notifications
 */
export const getNotifications = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const notifications = await query(
      `SELECT * FROM notifications 
       WHERE user_id = ? 
       ORDER BY created_at DESC 
       LIMIT 50`,
      [userId]
    );

    const [unread] = await query(
      'SELECT COUNT(*) as unread_count FROM notifications WHERE user_id = ? AND is_read = 0',
      [userId]
    );

    res.status(200).json({
      success: true,
      data: notifications,
      unreadCount: unread?.unread_count || 0
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mark a notification as read
 * PUT /api/notifications/:id/read
 */
export const markNotificationRead = async (req, res, next) => {
  try {
    const notifId = req.params.id;
    const userId = req.user.id;

    await query(
      'UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?',
      [notifId, userId]
    );

    res.status(200).json({
      success: true,
      message: 'Notification marked as read.'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mark all user notifications as read
 * PUT /api/notifications/read-all
 */
export const markAllNotificationsRead = async (req, res, next) => {
  try {
    const userId = req.user.id;

    await query(
      'UPDATE notifications SET is_read = 1 WHERE user_id = ?',
      [userId]
    );

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read.'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a notification
 * DELETE /api/notifications/:id
 */
export const deleteNotification = async (req, res, next) => {
  try {
    const notifId = req.params.id;
    const userId = req.user.id;

    await query(
      'DELETE FROM notifications WHERE id = ? AND user_id = ?',
      [notifId, userId]
    );

    res.status(200).json({
      success: true,
      message: 'Notification deleted.'
    });
  } catch (error) {
    next(error);
  }
};
