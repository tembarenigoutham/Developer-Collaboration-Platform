import express from 'express';
import {
  generateReadme,
  generateDocumentation,
  generateSummary,
  updateDocument,
  deleteDocument
} from '../controllers/aiController.js';
import { authenticateUser } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticateUser);

router.post('/generate-readme', generateReadme);
router.post('/generate-documentation', generateDocumentation);
router.post('/generate-summary', generateSummary);

router.put('/documents/:id', updateDocument);
router.delete('/documents/:id', deleteDocument);

export default router;
