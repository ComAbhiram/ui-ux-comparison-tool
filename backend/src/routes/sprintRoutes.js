import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import {
  getSprintsByProject,
  getSprintById,
  createSprint,
  updateSprint,
  deleteSprint
} from '../controllers/sprintController.js';

const router = express.Router();

// All sprint routes require authentication
router.use(authenticateToken);

router.get('/project/:projectId', getSprintsByProject);
router.get('/:id', getSprintById);
router.post('/', createSprint);
router.put('/:id', updateSprint);
router.delete('/:id', deleteSprint);

export default router;
