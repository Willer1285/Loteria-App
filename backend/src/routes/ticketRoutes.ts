import { Router } from 'express';
import { body } from 'express-validator';
import {
  purchaseTicket,
  getUserTickets,
  verifyTicket,
  getTicketByNumber,
} from '../controllers/ticketController';
import { authenticate } from '../middlewares/auth';

const router = Router();

/**
 * @route   POST /api/tickets/purchase
 * @desc    Compra un boleto de lotería
 * @access  Private
 */
router.post(
  '/purchase',
  [
    authenticate,
    body('lotteryId').notEmpty().withMessage('ID de lotería requerido'),
    body('quantity').optional().isInt({ min: 1 }).withMessage('La cantidad debe ser mayor a 0'),
  ],
  purchaseTicket
);

/**
 * @route   GET /api/tickets
 * @desc    Obtiene los boletos del usuario
 * @access  Private
 */
router.get('/', authenticate, getUserTickets);

/**
 * @route   GET /api/tickets/verify/:verificationCode
 * @desc    Verifica un boleto por código
 * @access  Private
 */
router.get('/verify/:verificationCode', authenticate, verifyTicket);

/**
 * @route   GET /api/tickets/number/:ticketNumber
 * @desc    Obtiene un boleto por su número
 * @access  Private
 */
router.get('/number/:ticketNumber', authenticate, getTicketByNumber);

export default router;
