import express from 'express';
import {
  getReviewById,
  updateReview,
  addReviewComment
} from '../controllers/reviewController.js';
import { authenticateUser } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticateUser);

router.get('/:id', getReviewById);
router.put('/:id', updateReview);
router.post('/:id/comments', addReviewComment);

export default router;
