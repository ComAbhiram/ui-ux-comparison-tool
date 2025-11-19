import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import {
  getCommentsByIssue,
  createComment,
  updateComment,
  deleteComment
} from '../controllers/commentController.js';

const router = express.Router();

// All comment routes require authentication
router.use(authenticateToken);

router.get('/issue/:issueId', getCommentsByIssue);
router.post('/', createComment);
router.put('/:id', updateComment);
router.delete('/:id', deleteComment);

export default router;
