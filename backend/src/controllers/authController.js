import bcrypt from 'bcryptjs';
import { query } from '../config/db.js';
import { signToken } from '../utils/token.js';
import { AppError } from '../middleware/errorMiddleware.js';

// Email regex validator
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Register a new user
 * POST /api/auth/register
 */
export const register = async (req, res, next) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    // 1. Validation
    if (!name || !name.trim()) {
      throw new AppError('Name is required.', 400);
    }
    if (!email || !EMAIL_REGEX.test(email.trim())) {
      throw new AppError('Valid email address is required.', 400);
    }
    if (!password || password.length < 6) {
      throw new AppError('Password must be at least 6 characters long.', 400);
    }
    if (password !== confirmPassword) {
      throw new AppError('Passwords do not match.', 400);
    }

    const cleanEmail = email.trim().toLowerCase();

    // 2. Check if user already exists
    const existing = await query('SELECT id FROM users WHERE email = ?', [cleanEmail]);
    if (existing && existing.length > 0) {
      throw new AppError('An account with this email address already exists.', 409);
    }

    // 3. Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 4. Insert into database (Only rgoutham079@gmail.com is OWNER, all others are USER)
    const systemRole = cleanEmail === 'rgoutham079@gmail.com' ? 'OWNER' : 'USER';
    const result = await query(
      'INSERT INTO users (name, email, password, profile_image, system_role) VALUES (?, ?, ?, NULL, ?)',
      [name.trim(), cleanEmail, hashedPassword, systemRole]
    );

    const userId = result.insertId;

    // 5. Generate JWT token
    const token = signToken({ id: userId, email: cleanEmail, name: name.trim(), system_role: systemRole });

    const newUser = {
      id: userId,
      name: name.trim(),
      email: cleanEmail,
      profile_image: null,
      system_role: systemRole,
      created_at: new Date().toISOString()
    };

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: newUser,
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login existing user
 * POST /api/auth/login
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new AppError('Please provide email and password.', 400);
    }

    const cleanEmail = email.trim().toLowerCase();

    // Query user
    const users = await query(
      'SELECT id, name, email, password, profile_image, system_role, created_at FROM users WHERE email = ?',
      [cleanEmail]
    );

    // If user does not exist in database
    if (!users || users.length === 0) {
      throw new AppError('No user found. Please create an account first.', 404);
    }

    const user = users[0];

    // Check password
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      throw new AppError('Incorrect password. Please try again.', 401);
    }

    const userRole = user.system_role || (user.email === 'rgoutham079@gmail.com' ? 'OWNER' : 'USER');

    // Generate JWT token
    const token = signToken({ id: user.id, email: user.email, name: user.name, system_role: userRole });

    // Safe user object
    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      profile_image: user.profile_image,
      system_role: userRole,
      created_at: user.created_at
    };

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: safeUser,
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get authenticated user profile
 * GET /api/auth/profile
 */
export const getProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Fetch user details with activity counts
    const users = await query(
      'SELECT id, name, email, profile_image, system_role, status, title, bio, skills, github_url, linkedin_url, created_at FROM users WHERE id = ?',
      [userId]
    );

    if (!users || users.length === 0) {
      throw new AppError('User not found.', 404);
    }

    const user = users[0];
    const userRole = user.system_role || (user.email === 'rgoutham079@gmail.com' ? 'OWNER' : 'USER');

    // Fetch counts
    const [projectCount] = await query(
      'SELECT COUNT(*) as count FROM project_members WHERE user_id = ?',
      [userId]
    );
    const [taskCount] = await query(
      'SELECT COUNT(*) as count FROM tasks WHERE assigned_to = ? AND status != "DONE"',
      [userId]
    );
    const [issueCount] = await query(
      'SELECT COUNT(*) as count FROM issues WHERE assigned_to = ? AND status != "CLOSED"',
      [userId]
    );

    res.status(200).json({
      success: true,
      data: {
        ...user,
        system_role: userRole,
        stats: {
          projects: projectCount?.count || 0,
          activeTasks: taskCount?.count || 0,
          assignedIssues: issueCount?.count || 0
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update authenticated user profile
 * PUT /api/auth/profile
 */
export const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { name, profile_image, title, bio, skills, github_url, linkedin_url } = req.body;

    if (!name || !name.trim()) {
      throw new AppError('Name cannot be empty.', 400);
    }

    await query(
      `UPDATE users 
       SET name = ?, 
           profile_image = ?, 
           title = ?, 
           bio = ?, 
           skills = ?, 
           github_url = ?, 
           linkedin_url = ? 
       WHERE id = ?`,
      [
        name.trim(),
        profile_image || null,
        title ? title.trim() : 'Software Engineer',
        bio ? bio.trim() : null,
        skills ? skills.trim() : 'React, Node.js, JavaScript',
        github_url ? github_url.trim() : null,
        linkedin_url ? linkedin_url.trim() : null,
        userId
      ]
    );

    const updated = await query(
      'SELECT id, name, email, profile_image, system_role, status, title, bio, skills, github_url, linkedin_url, created_at FROM users WHERE id = ?',
      [userId]
    );

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: updated[0]
    });
  } catch (error) {
    next(error);
  }
};
