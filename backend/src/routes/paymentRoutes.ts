import { Router } from 'express';
import { body } from 'express-validator';
import {
  deposit,
  withdraw,
  getPaymentHistory,
  getAllPayments,
} from '../controllers/paymentController';
import { authenticate, isAdmin } from '../middlewares/auth';

const router = Router();

/**
 * @route   POST /api/payments/deposit
 * @desc    Realiza un depósito
 * @access  Private
 */
router.post(
  '/deposit',
  [
    authenticate,
    body('amount').isNumeric().withMessage('El monto debe ser numérico'),
    body('method').notEmpty().withMessage('El método de pago es requerido'),
  ],
  deposit
);

/**
 * @route   POST /api/payments/withdraw
 * @desc    Realiza un retiro
 * @access  Private
 */
router.post(
  '/withdraw',
  [
    authenticate,
    body('amount').isNumeric().withMessage('El monto debe ser numérico'),
    body('method').notEmpty().withMessage('El método de pago es requerido'),
  ],
  withdraw
);

/**
 * @route   GET /api/payments/history
 * @desc    Obtiene el historial de pagos del usuario
 * @access  Private
 */
router.get('/history', authenticate, getPaymentHistory);

/**
 * @route   GET /api/payments/all
 * @desc    Obtiene todos los pagos
 * @access  Private/Admin
 */
router.get('/all', authenticate, isAdmin, getAllPayments);

export default router;
