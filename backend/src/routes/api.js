import express from 'express';
import { pool } from '../config/db.js';
import authRoutes from './authRoutes.js';
import projectRoutes from './projectRoutes.js';
import dashboardRoutes from './dashboardRoutes.js';
import taskRoutes from './taskRoutes.js';
import issueRoutes from './issueRoutes.js';
import reviewRoutes from './reviewRoutes.js';
import githubRoutes from './githubRoutes.js';
import aiRoutes from './aiRoutes.js';
import notificationRoutes from './notificationRoutes.js';

const router = express.Router();

// Mount Sub-routers
router.use('/auth', authRoutes);
router.use('/projects', projectRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/tasks', taskRoutes);
router.use('/issues', issueRoutes);
router.use('/reviews', reviewRoutes);
router.use('/github', githubRoutes);
router.use('/ai', aiRoutes);
router.use('/notifications', notificationRoutes);

// Health check endpoint
router.get('/health', async (req, res) => {
  let dbStatus = 'disconnected';
  try {
    const [rows] = await pool.query('SELECT 1 AS ok');
    if (rows && rows[0]?.ok === 1) dbStatus = 'connected';
  } catch (err) {
    dbStatus = 'error: ' + err.message;
  }

  res.status(200).json({
    success: true,
    status: 'ok',
    database: dbStatus,
    message: 'Developer Collaboration Platform API is operating normally',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0'
  });
});

export default router;
