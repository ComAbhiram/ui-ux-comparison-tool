import express from 'express';
import { getActivitiesByProject, createActivity } from '../controllers/activityController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/project/:projectId', authenticateToken, getActivitiesByProject);
router.post('/', authenticateToken, createActivity);

export default router;
