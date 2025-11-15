import { Router } from 'express';
import {
  getAllUsers,
  getUserById,
  updateUser,
  deactivateUser,
  activateUser,
  getUserStats,
  createUser,
  banUser,
  unbanUser,
  getBannedUsers,
  deleteUser,
  updateAvatar,
  updateEmail,
  updatePassword,
} from '../controllers/userController';
import { authenticate, isAdmin, isAdminOrGerente } from '../middlewares/auth';

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

/**
 * @route   POST /api/users
 * @desc    Crea un nuevo usuario
 * @access  Private/Admin or Gerente
 */
router.post('/', authenticate, isAdminOrGerente, createUser);

/**
 * @route   POST /api/users/:id/ban
 * @desc    Banea un usuario
 * @access  Private/Admin or Gerente
 */
router.post('/:id/ban', authenticate, isAdminOrGerente, banUser);

/**
 * @route   POST /api/users/:id/unban
 * @desc    Desbanea/Restaura un usuario
 * @access  Private/Admin or Gerente
 */
router.post('/:id/unban', authenticate, isAdminOrGerente, unbanUser);

/**
 * @route   GET /api/users/banned/list
 * @desc    Obtiene todos los usuarios baneados
 * @access  Private/Admin or Gerente
 */
router.get('/banned/list', authenticate, isAdminOrGerente, getBannedUsers);

/**
 * @route   DELETE /api/users/:id
 * @desc    Elimina un usuario permanentemente
 * @access  Private/Admin
 */
router.delete('/:id', authenticate, isAdmin, deleteUser);

/**
 * @route   PUT /api/users/:id/avatar
 * @desc    Actualiza el avatar de un usuario
 * @access  Private
 */
router.put('/:id/avatar', authenticate, updateAvatar);

/**
 * @route   PUT /api/users/:id/email
 * @desc    Actualiza el email de un usuario
 * @access  Private
 */
router.put('/:id/email', authenticate, updateEmail);

/**
 * @route   PUT /api/users/:id/password
 * @desc    Actualiza la contraseña de un usuario
 * @access  Private
 */
router.put('/:id/password', authenticate, updatePassword);

export default router;
