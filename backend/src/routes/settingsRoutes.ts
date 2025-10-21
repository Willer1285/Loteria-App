import { Router } from 'express';
import {
  getSettings,
  updateSettings,
  updateLogo,
  addPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod,
} from '../controllers/settingsController';
import { authenticate, isAdmin } from '../middlewares/auth';

const router = Router();

/**
 * @route   GET /api/settings
 * @desc    Obtiene la configuración de la aplicación
 * @access  Public
 */
router.get('/', getSettings);

/**
 * @route   PUT /api/settings
 * @desc    Actualiza la configuración de la aplicación
 * @access  Private/Admin
 */
router.put('/', authenticate, isAdmin, updateSettings);

/**
 * @route   PUT /api/settings/logo
 * @desc    Actualiza el logo de la aplicación
 * @access  Private/Admin
 */
router.put('/logo', authenticate, isAdmin, updateLogo);

/**
 * @route   POST /api/settings/payment-methods
 * @desc    Agrega un método de pago
 * @access  Private/Admin
 */
router.post('/payment-methods', authenticate, isAdmin, addPaymentMethod);

/**
 * @route   PUT /api/settings/payment-methods/:index
 * @desc    Actualiza un método de pago
 * @access  Private/Admin
 */
router.put('/payment-methods/:index', authenticate, isAdmin, updatePaymentMethod);

/**
 * @route   DELETE /api/settings/payment-methods/:index
 * @desc    Elimina un método de pago
 * @access  Private/Admin
 */
router.delete('/payment-methods/:index', authenticate, isAdmin, deletePaymentMethod);

export default router;
