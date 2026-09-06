import express from 'express';
import {
  getIssueById,
  updateIssue,
  deleteIssue,
  addIssueComment
} from '../controllers/issueController.js';
import { authenticateUser } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticateUser);

router.get('/:id', getIssueById);
router.put('/:id', updateIssue);
router.delete('/:id', deleteIssue);
router.post('/:id/comments', addIssueComment);

export default router;
