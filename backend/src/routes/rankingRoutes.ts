import { Router } from 'express';
import {
  getTopBuyers,
  getTopWinners,
  getTopSpenders,
  getRankingStats,
  getRankingByLottery,
  getMonthlyRanking,
  getYearlyRanking,
} from '../controllers/rankingController';
import { authenticate } from '../middlewares/auth';

const router = Router();

/**
 * @route   GET /api/rankings/top-buyers
 * @desc    Obtiene el ranking de jugadores que más boletos han comprado
 * @access  Private
 */
router.get('/top-buyers', authenticate, getTopBuyers);

/**
 * @route   GET /api/rankings/top-winners
 * @desc    Obtiene el ranking de jugadores que más han ganado
 * @access  Private
 */
router.get('/top-winners', authenticate, getTopWinners);

/**
 * @route   GET /api/rankings/top-spenders
 * @desc    Obtiene el ranking de jugadores que más han gastado
 * @access  Private
 */
router.get('/top-spenders', authenticate, getTopSpenders);

/**
 * @route   GET /api/rankings/stats
 * @desc    Obtiene estadísticas generales de rankings
 * @access  Private
 */
router.get('/stats', authenticate, getRankingStats);

/**
 * @route   GET /api/rankings/lottery/:lotteryId
 * @desc    Obtiene el ranking de jugadores por sorteo
 * @access  Private
 */
router.get('/lottery/:lotteryId', authenticate, getRankingByLottery);

/**
 * @route   GET /api/rankings/monthly
 * @desc    Obtiene el ranking mensual
 * @access  Private
 */
router.get('/monthly', authenticate, getMonthlyRanking);

/**
 * @route   GET /api/rankings/yearly
 * @desc    Obtiene el ranking anual
 * @access  Private
 */
router.get('/yearly', authenticate, getYearlyRanking);

export default router;
