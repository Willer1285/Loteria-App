import { Router } from 'express';
import { body } from 'express-validator';
import { register, login, getProfile } from '../controllers/authController';
import {
  forgotPassword,
  resetPassword,
  verifyResetToken,
} from '../controllers/passwordResetController';
import { authenticate } from '../middlewares/auth';

const router = Router();

/**
 * @route   POST /api/auth/register
 * @desc    Registra un nuevo usuario
 * @access  Public
 */
router.post(
  '/register',
  [
    body('email').isEmail().withMessage('Email inválido'),
    body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
    body('firstName').notEmpty().withMessage('El nombre es requerido'),
    body('lastName').notEmpty().withMessage('El apellido es requerido'),
  ],
  register
);

/**
 * @route   POST /api/auth/login
 * @desc    Inicia sesión
 * @access  Public
 */
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Email inválido'),
    body('password').notEmpty().withMessage('La contraseña es requerida'),
  ],
  login
);

/**
 * @route   GET /api/auth/profile
 * @desc    Obtiene el perfil del usuario autenticado
 * @access  Private
 */
router.get('/profile', authenticate, getProfile);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Solicita reseteo de contraseña
 * @access  Public
 */
router.post(
  '/forgot-password',
  [body('email').isEmail().withMessage('Email inválido')],
  forgotPassword
);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Resetea la contraseña con token
 * @access  Public
 */
router.post(
  '/reset-password',
  [
    body('token').notEmpty().withMessage('Token requerido'),
    body('newPassword')
      .isLength({ min: 6 })
      .withMessage('La contraseña debe tener al menos 6 caracteres'),
  ],
  resetPassword
);

/**
 * @route   GET /api/auth/verify-reset-token/:token
 * @desc    Verifica si un token de reseteo es válido
 * @access  Public
 */
router.get('/verify-reset-token/:token', verifyResetToken);

export default router;
