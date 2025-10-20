import { Router } from 'express';
import { body } from 'express-validator';
import {
  createLottery,
  getAllLotteries,
  getLotteryById,
  updateLottery,
  drawLottery,
  cancelLottery,
} from '../controllers/lotteryController';
import { authenticate, isAdmin } from '../middlewares/auth';

const router = Router();

/**
 * @route   POST /api/lotteries
 * @desc    Crea una nueva lotería
 * @access  Private/Admin
 */
router.post(
  '/',
  [
    authenticate,
    isAdmin,
    body('name').notEmpty().withMessage('El nombre es requerido'),
    body('description').notEmpty().withMessage('La descripción es requerida'),
    body('ticketPrice').isNumeric().withMessage('El precio del boleto debe ser numérico'),
    body('drawDate').isISO8601().withMessage('Fecha de sorteo inválida'),
    body('maxTickets').isInt({ min: 1 }).withMessage('El número máximo de boletos debe ser mayor a 0'),
  ],
  createLottery
);

/**
 * @route   GET /api/lotteries
 * @desc    Obtiene todas las loterías
 * @access  Public
 */
router.get('/', getAllLotteries);

/**
 * @route   GET /api/lotteries/:id
 * @desc    Obtiene una lotería por ID
 * @access  Public
 */
router.get('/:id', getLotteryById);

/**
 * @route   PUT /api/lotteries/:id
 * @desc    Actualiza una lotería
 * @access  Private/Admin
 */
router.put('/:id', authenticate, isAdmin, updateLottery);

/**
 * @route   POST /api/lotteries/:id/draw
 * @desc    Realiza el sorteo de una lotería
 * @access  Private/Admin
 */
router.post('/:id/draw', authenticate, isAdmin, drawLottery);

/**
 * @route   POST /api/lotteries/:id/cancel
 * @desc    Cancela una lotería
 * @access  Private/Admin
 */
router.post('/:id/cancel', authenticate, isAdmin, cancelLottery);

export default router;
