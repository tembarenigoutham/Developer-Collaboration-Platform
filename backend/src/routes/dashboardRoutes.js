import express from 'express';
import {
  getDashboardStats,
  getAllUsers,
  updateUserStatus,
  assignUserToProject,
  getUserActivity
} from '../controllers/dashboardController.js';
import { authenticateUser } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticateUser);

router.get('/stats', getDashboardStats);
router.get('/users', getAllUsers);
router.put('/users/:id/status', updateUserStatus);
router.post('/users/:id/assign-project', assignUserToProject);
router.get('/users/:id/activity', getUserActivity);

export default router;
