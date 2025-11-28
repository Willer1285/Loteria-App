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

const router = Router();

/**
 * @route   GET /api/rankings/top-buyers
 * @desc    Obtiene el ranking de jugadores que más boletos han comprado
 * @access  Public
 */
router.get('/top-buyers', getTopBuyers);

/**
 * @route   GET /api/rankings/top-winners
 * @desc    Obtiene el ranking de jugadores que más han ganado
 * @access  Public
 */
router.get('/top-winners', getTopWinners);

/**
 * @route   GET /api/rankings/top-spenders
 * @desc    Obtiene el ranking de jugadores que más han gastado
 * @access  Public
 */
router.get('/top-spenders', getTopSpenders);

/**
 * @route   GET /api/rankings/stats
 * @desc    Obtiene estadísticas generales de rankings
 * @access  Public
 */
router.get('/stats', getRankingStats);

/**
 * @route   GET /api/rankings/lottery/:lotteryId
 * @desc    Obtiene el ranking de jugadores por sorteo
 * @access  Public
 */
router.get('/lottery/:lotteryId', getRankingByLottery);

/**
 * @route   GET /api/rankings/monthly
 * @desc    Obtiene el ranking mensual
 * @access  Public
 */
router.get('/monthly', getMonthlyRanking);

/**
 * @route   GET /api/rankings/yearly
 * @desc    Obtiene el ranking anual
 * @access  Public
 */
router.get('/yearly', getYearlyRanking);

export default router;
