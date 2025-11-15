import { Router } from 'express';
import { body } from 'express-validator';
import {
  deposit,
  withdraw,
  getPaymentHistory,
  getAllPayments,
  approvePayment,
  rejectPayment,
} from '../controllers/paymentController';
import { authenticate, isAdmin, isAdminOrGerente } from '../middlewares/auth';

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

/**
 * @route   POST /api/payments/:id/approve
 * @desc    Aprueba un pago pendiente
 * @access  Private/Admin/Gerente
 */
router.post('/:id/approve', authenticate, isAdminOrGerente, approvePayment);

/**
 * @route   POST /api/payments/:id/reject
 * @desc    Rechaza un pago pendiente
 * @access  Private/Admin/Gerente
 */
router.post('/:id/reject', authenticate, isAdminOrGerente, rejectPayment);

export default router;
