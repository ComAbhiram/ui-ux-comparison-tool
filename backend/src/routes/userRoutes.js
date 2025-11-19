import express from 'express';
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  updateProfilePicture
} from '../controllers/userController.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.get('/', authenticateToken, getAllUsers);
router.get('/:id', authenticateToken, getUserById);
router.post('/', authenticateToken, authorizeRole('Admin'), createUser);
router.put('/:id', authenticateToken, authorizeRole('Admin'), updateUser);
router.put('/:id/profile-picture', authenticateToken, upload.single('profilePicture'), updateProfilePicture);
router.delete('/:id', authenticateToken, authorizeRole('Admin'), deleteUser);

export default router;
