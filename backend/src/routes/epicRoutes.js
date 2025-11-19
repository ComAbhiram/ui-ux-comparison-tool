import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import {
  getEpicsByProject,
  getEpicById,
  createEpic,
  updateEpic,
  deleteEpic
} from '../controllers/epicController.js';

const router = express.Router();

// All epic routes require authentication
router.use(authenticateToken);

router.get('/project/:projectId', getEpicsByProject);
router.get('/:id', getEpicById);
router.post('/', createEpic);
router.put('/:id', updateEpic);
router.delete('/:id', deleteEpic);

export default router;
