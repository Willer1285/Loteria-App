import { Router } from 'express';
import { body } from 'express-validator';
import {
  purchaseTicket,
  getUserTickets,
  getAllLotteryTickets,
  getAllTicketsAdmin,
  getGroupedPurchasesAdmin,
  cancelTicket,
  verifyTicket,
  getTicketByNumber,
  verifyTicketByLotteryAndNumber,
} from '../controllers/ticketController';
import { authenticate, isAdminOrGerente } from '../middlewares/auth';

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
 * @route   GET /api/tickets/admin/all
 * @desc    Obtiene TODOS los boletos de TODOS los sorteos (Admin/Gerente)
 * @access  Private (Admin/Gerente)
 */
router.get('/admin/all', authenticate, isAdminOrGerente, getAllTicketsAdmin);

/**
 * @route   GET /api/tickets/admin/purchases
 * @desc    Obtiene compras agrupadas optimizadas (Admin/Gerente)
 * @access  Private (Admin/Gerente)
 */
router.get('/admin/purchases', authenticate, isAdminOrGerente, getGroupedPurchasesAdmin);

/**
 * @route   GET /api/tickets/lottery/all
 * @desc    Obtiene todos los boletos de un sorteo (Admin/Gerente)
 * @access  Private (Admin/Gerente)
 */
router.get('/lottery/all', authenticate, isAdminOrGerente, getAllLotteryTickets);

/**
 * @route   POST /api/tickets/:id/cancel
 * @desc    Anula un boleto con opción de reintegro (Admin/Gerente)
 * @access  Private (Admin/Gerente)
 */
router.post('/:id/cancel', authenticate, isAdminOrGerente, cancelTicket);

/**
 * @route   GET /api/tickets/verify/:verificationCode
 * @desc    Verifica un boleto por código
 * @access  Private
 */
router.get('/verify/:verificationCode', authenticate, verifyTicket);

/**
 * @route   GET /api/tickets/verify-by-lottery
 * @desc    Verifica un boleto por número y sorteo
 * @access  Private
 */
router.get('/verify-by-lottery', authenticate, verifyTicketByLotteryAndNumber);

/**
 * @route   GET /api/tickets/number/:ticketNumber
 * @desc    Obtiene un boleto por su número
 * @access  Private
 */
router.get('/number/:ticketNumber', authenticate, getTicketByNumber);

export default router;
