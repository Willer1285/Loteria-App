import { Router } from 'express';
import {
  getAllUsers,
  getUserById,
  updateUser,
  deactivateUser,
  activateUser,
  getUserStats,
} from '../controllers/userController';
import { authenticate, isAdmin } from '../middlewares/auth';

const router = Router();

/**
 * @route   GET /api/users
 * @desc    Obtiene todos los usuarios
 * @access  Private/Admin
 */
router.get('/', authenticate, isAdmin, getAllUsers);

/**
 * @route   GET /api/users/:id
 * @desc    Obtiene un usuario por ID
 * @access  Private/Admin
 */
router.get('/:id', authenticate, isAdmin, getUserById);

/**
 * @route   PUT /api/users/:id
 * @desc    Actualiza un usuario
 * @access  Private
 */
router.put('/:id', authenticate, updateUser);

/**
 * @route   POST /api/users/:id/deactivate
 * @desc    Desactiva un usuario
 * @access  Private/Admin
 */
router.post('/:id/deactivate', authenticate, isAdmin, deactivateUser);

/**
 * @route   POST /api/users/:id/activate
 * @desc    Activa un usuario
 * @access  Private/Admin
 */
router.post('/:id/activate', authenticate, isAdmin, activateUser);

/**
 * @route   GET /api/users/:id/stats
 * @desc    Obtiene estadísticas de un usuario
 * @access  Private
 */
router.get('/:id/stats', authenticate, getUserStats);

export default router;
