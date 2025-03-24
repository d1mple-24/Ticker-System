import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { admin } from '../middleware/admin.js';
import {
  getUsers,
  getUserById,
  updateUser,
  deleteUser
} from '../controllers/userController.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// User routes
router.get('/me', getUserById);

// Admin routes
router.use(admin);
router.get('/', getUsers);
router.get('/:id', getUserById);
router.patch('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router; 