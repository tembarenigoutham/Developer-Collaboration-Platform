import express from 'express';
import {
  getProjects,
  createProject,
  getProjectById,
  updateProject,
  deleteProject,
  addProjectMember,
  updateMemberRole,
  removeProjectMember,
  getProjectMessages,
  createProjectMessage
} from '../controllers/projectController.js';
import { getProjectTasks, createTask } from '../controllers/taskController.js';
import { getProjectIssues, createIssue } from '../controllers/issueController.js';
import { getProjectReviews, createReview } from '../controllers/reviewController.js';
import { getProjectDocuments, createDocument } from '../controllers/aiController.js';
import { authenticateUser } from '../middleware/authMiddleware.js';

const router = express.Router();

// All project routes require authentication
router.use(authenticateUser);

router.get('/', getProjects);
router.post('/', createProject);
router.get('/:id', getProjectById);
router.put('/:id', updateProject);
router.delete('/:id', deleteProject);

// Tasks subroutes
router.get('/:id/tasks', getProjectTasks);
router.post('/:id/tasks', createTask);

// Issues subroutes
router.get('/:id/issues', getProjectIssues);
router.post('/:id/issues', createIssue);

// Reviews subroutes
router.get('/:id/reviews', getProjectReviews);
router.post('/:id/reviews', createReview);

// Documents subroutes
router.get('/:id/documents', getProjectDocuments);
router.post('/:id/documents', createDocument);

// Team Chat subroutes
router.get('/:id/messages', getProjectMessages);
router.post('/:id/messages', createProjectMessage);

// Project members routes
router.post('/:id/members', addProjectMember);
router.put('/:id/members/:userId', updateMemberRole);
router.delete('/:id/members/:userId', removeProjectMember);

export default router;
