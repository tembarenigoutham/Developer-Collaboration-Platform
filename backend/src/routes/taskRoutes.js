import express from 'express';
import { updateTask, deleteTask } from '../controllers/taskController.js';
import { authenticateUser } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticateUser);

router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

export default router;
