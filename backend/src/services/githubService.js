import { config } from '../config/env.js';
import { query } from '../config/db.js';

const GITHUB_API_BASE = 'https://api.github.com';

/**
 * Get headers for GitHub API request
 * @param {number} userId
 */
export const getGitHubHeaders = async (userId = null) => {
  const headers = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'DevCollab-Platform-App'
  };

  // 1. Check user-connected account
  if (userId) {
    const [account] = await query(
      'SELECT access_token FROM github_accounts WHERE user_id = ?',
      [userId]
    );
    if (account && account.access_token) {
      headers['Authorization'] = `token ${account.access_token}`;
      return headers;
    }
  }

  // 2. Check global token from env
  if (config.github.personalToken) {
    headers['Authorization'] = `token ${config.github.personalToken}`;
  }

  return headers;
};

/**
 * Fetch GitHub Repository Details
 */
export const fetchRepoDetails = async (owner, repo, userId = null) => {
  const headers = await getGitHubHeaders(userId);
  const response = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}`, { headers });
  
  if (!response.ok) {
    const errText = await response.text();
    let parsed;
    try { parsed = JSON.parse(errText); } catch (_) { parsed = { message: errText }; }
    throw new Error(parsed.message || `GitHub API error (${response.status})`);
  }

  const data = await response.json();
  return {
    id: data.id,
    name: data.name,
    full_name: data.full_name,
    description: data.description,
    stars: data.stargazers_count,
    forks: data.forks_count,
    open_issues: data.open_issues_count,
    default_branch: data.default_branch,
    html_url: data.html_url,
    language: data.language,
    created_at: data.created_at,
    updated_at: data.updated_at
  };
};

/**
 * Fetch Repository Commits
 */
export const fetchRepoCommits = async (owner, repo, userId = null) => {
  const headers = await getGitHubHeaders(userId);
  const response = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}/commits?per_page=15`, { headers });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch commits (${response.status})`);
  }

  const list = await response.json();
  return list.map((c) => ({
    sha: c.sha.substring(0, 7),
    full_sha: c.sha,
    message: c.commit.message,
    author: c.commit.author.name,
    date: c.commit.author.date,
    html_url: c.html_url
  }));
};

/**
 * Fetch Repository Branches
 */
export const fetchRepoBranches = async (owner, repo, userId = null) => {
  const headers = await getGitHubHeaders(userId);
  const response = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}/branches?per_page=20`, { headers });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch branches (${response.status})`);
  }

  const list = await response.json();
  return list.map((b) => ({
    name: b.name,
    commit_sha: b.commit.sha.substring(0, 7),
    protected: b.protected
  }));
};

/**
 * Fetch Repository Pull Requests
 */
export const fetchRepoPulls = async (owner, repo, userId = null) => {
  const headers = await getGitHubHeaders(userId);
  const response = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}/pulls?state=all&per_page=15`, { headers });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch pull requests (${response.status})`);
  }

  const list = await response.json();
  return list.map((pr) => ({
    id: pr.id,
    number: pr.number,
    title: pr.title,
    state: pr.state,
    user: pr.user.login,
    html_url: pr.html_url,
    created_at: pr.created_at,
    updated_at: pr.updated_at
  }));
};

/**
 * Fetch Repository Issues
 */
export const fetchRepoIssues = async (owner, repo, userId = null) => {
  const headers = await getGitHubHeaders(userId);
  const response = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}/issues?state=all&per_page=15`, { headers });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch GitHub issues (${response.status})`);
  }

  const list = await response.json();
  // Filter out PRs which GitHub includes in issues endpoint
  return list.filter((item) => !item.pull_request).map((issue) => ({
    id: issue.id,
    number: issue.number,
    title: issue.title,
    state: issue.state,
    user: issue.user.login,
    comments: issue.comments,
    html_url: issue.html_url,
    created_at: issue.created_at
  }));
};
