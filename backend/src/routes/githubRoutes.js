import express from 'express';
import {
  getRepositories,
  getRepoDetails,
  getRepoCommits,
  getRepoBranches,
  getRepoIssues,
  getRepoPulls,
  getGitHubAccount,
  connectGitHubAccount
} from '../controllers/githubController.js';
import { authenticateUser } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticateUser);

router.get('/account', getGitHubAccount);
router.post('/connect', connectGitHubAccount);

router.get('/repos', getRepositories);
router.get('/repos/:owner/:repo', getRepoDetails);
router.get('/repos/:owner/:repo/commits', getRepoCommits);
router.get('/repos/:owner/:repo/branches', getRepoBranches);
router.get('/repos/:owner/:repo/issues', getRepoIssues);
router.get('/repos/:owner/:repo/pulls', getRepoPulls);

export default router;
