import { Router } from 'express';
import {
  getTopBuyers,
  getTopWinners,
  getTopSpenders,
  getRankingStats,
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

export default router;
