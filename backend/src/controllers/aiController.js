import { query } from '../config/db.js';
import * as aiService from '../services/aiService.js';
import { AppError } from '../middleware/errorMiddleware.js';

/**
 * Generate README for a project
 * POST /api/ai/generate-readme
 */
export const generateReadme = async (req, res, next) => {
  try {
    const { project_id } = req.body;
    if (!project_id) throw new AppError('project_id is required.', 400);

    const [project] = await query('SELECT * FROM projects WHERE id = ?', [project_id]);
    if (!project) throw new AppError('Project not found.', 404);

    const tasks = await query('SELECT title FROM tasks WHERE project_id = ? LIMIT 10', [project_id]);
    const issues = await query('SELECT title FROM issues WHERE project_id = ? LIMIT 10', [project_id]);

    const markdown = await aiService.generateDocumentation('readme', {
      name: project.name,
      description: project.description,
      github_repo: project.github_repo,
      tasks,
      issues
    });

    res.status(200).json({
      success: true,
      data: {
        documentType: 'README',
        content: markdown
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Generate API documentation or Setup Guide
 * POST /api/ai/generate-documentation
 */
export const generateDocumentation = async (req, res, next) => {
  try {
    const { project_id, type = 'api_docs' } = req.body;
    if (!project_id) throw new AppError('project_id is required.', 400);

    const [project] = await query('SELECT * FROM projects WHERE id = ?', [project_id]);
    if (!project) throw new AppError('Project not found.', 404);

    const docType = type === 'setup_guide' ? 'setup_guide' : 'api_docs';
    const markdown = await aiService.generateDocumentation(docType, {
      name: project.name,
      description: project.description,
      github_repo: project.github_repo
    });

    res.status(200).json({
      success: true,
      data: {
        documentType: docType.toUpperCase(),
        content: markdown
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Generate project executive summary
 * POST /api/ai/generate-summary
 */
export const generateSummary = async (req, res, next) => {
  try {
    const { project_id } = req.body;
    if (!project_id) throw new AppError('project_id is required.', 400);

    const [project] = await query('SELECT * FROM projects WHERE id = ?', [project_id]);
    if (!project) throw new AppError('Project not found.', 404);

    const markdown = await aiService.generateDocumentation('summary', {
      name: project.name,
      description: project.description,
      github_repo: project.github_repo
    });

    res.status(200).json({
      success: true,
      data: {
        documentType: 'SUMMARY',
        content: markdown
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all saved documents for a project
 * GET /api/projects/:id/documents
 */
export const getProjectDocuments = async (req, res, next) => {
  try {
    const projectId = req.params.id;
    const docs = await query(
      `SELECT d.*, u.name as creator_name 
       FROM documents d
       JOIN users u ON d.created_by = u.id
       WHERE d.project_id = ?
       ORDER BY d.updated_at DESC`,
      [projectId]
    );

    res.status(200).json({
      success: true,
      data: docs
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Save new document
 * POST /api/projects/:id/documents
 */
export const createDocument = async (req, res, next) => {
  try {
    const projectId = req.params.id;
    const userId = req.user.id;
    const { title, content, document_type = 'README' } = req.body;

    if (!title || !title.trim()) throw new AppError('Document title is required.', 400);
    if (!content || !content.trim()) throw new AppError('Document content is required.', 400);

    const result = await query(
      'INSERT INTO documents (project_id, title, content, document_type, created_by) VALUES (?, ?, ?, ?, ?)',
      [projectId, title.trim(), content, document_type, userId]
    );

    const docId = result.insertId;
    const [newDoc] = await query('SELECT * FROM documents WHERE id = ?', [docId]);

    res.status(201).json({
      success: true,
      message: 'Document saved successfully',
      data: newDoc
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update document
 * PUT /api/documents/:id
 */
export const updateDocument = async (req, res, next) => {
  try {
    const docId = req.params.id;
    const { title, content, document_type } = req.body;

    const [existing] = await query('SELECT * FROM documents WHERE id = ?', [docId]);
    if (!existing) throw new AppError('Document not found.', 404);

    const updatedTitle = title !== undefined ? title.trim() : existing.title;
    const updatedContent = content !== undefined ? content : existing.content;
    const updatedType = document_type !== undefined ? document_type : existing.document_type;

    await query(
      'UPDATE documents SET title = ?, content = ?, document_type = ? WHERE id = ?',
      [updatedTitle, updatedContent, updatedType, docId]
    );

    const [updated] = await query('SELECT * FROM documents WHERE id = ?', [docId]);

    res.status(200).json({
      success: true,
      message: 'Document updated successfully',
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete document
 * DELETE /api/documents/:id
 */
export const deleteDocument = async (req, res, next) => {
  try {
    const docId = req.params.id;
    const [existing] = await query('SELECT * FROM documents WHERE id = ?', [docId]);
    if (!existing) throw new AppError('Document not found.', 404);

    await query('DELETE FROM documents WHERE id = ?', [docId]);

    res.status(200).json({
      success: true,
      message: 'Document deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};
