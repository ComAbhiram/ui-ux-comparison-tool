import express from 'express';
import {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  addProjectMember,
  removeProjectMember
} from '../controllers/projectController.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateToken, getAllProjects);
router.get('/:id', authenticateToken, getProjectById);
router.post('/', authenticateToken, authorizeRole('Admin', 'QA'), createProject);
router.put('/:id', authenticateToken, authorizeRole('Admin', 'QA'), updateProject);
router.delete('/:id', authenticateToken, authorizeRole('Admin'), deleteProject);
router.post('/:id/members', authenticateToken, authorizeRole('Admin', 'QA'), addProjectMember);
router.delete('/:id/members/:userId', authenticateToken, authorizeRole('Admin', 'QA'), removeProjectMember);

export default router;
