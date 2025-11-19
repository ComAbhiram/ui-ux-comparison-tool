import express from 'express';
import {
  getAllIssues,
  getIssueById,
  createIssue,
  updateIssue,
  deleteIssue
} from '../controllers/issueController.js';
import { authenticateToken } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.get('/', authenticateToken, getAllIssues);
router.get('/:id', authenticateToken, getIssueById);
router.post('/', authenticateToken, upload.array('attachments', 10), createIssue);
router.put('/:id', authenticateToken, upload.array('attachments', 10), updateIssue);
router.delete('/:id', authenticateToken, deleteIssue);

export default router;
