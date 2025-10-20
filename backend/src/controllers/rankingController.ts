import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import User from '../models/User';

/**
 * Obtiene el ranking de jugadores que más boletos han comprado
 */
export const getTopBuyers = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { limit = 10 } = req.query;

    const topBuyers = await User.find({ role: 'user' })
      .sort({ ticketsPurchased: -1 })
      .limit(Number(limit))
      .select('firstName lastName email ticketsPurchased totalSpent');

    res.json({
      ranking: topBuyers.map((user, index) => ({
        position: index + 1,
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
        },
        ticketsPurchased: user.ticketsPurchased,
        totalSpent: user.totalSpent,
      })),
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener ranking de compradores' });
  }
};

/**
 * Obtiene el ranking de jugadores que más han ganado
 */
export const getTopWinners = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { limit = 10 } = req.query;

    const topWinners = await User.find({ role: 'user', totalWon: { $gt: 0 } })
      .sort({ totalWon: -1 })
      .limit(Number(limit))
      .select('firstName lastName email totalWon ticketsPurchased');

    res.json({
      ranking: topWinners.map((user, index) => ({
        position: index + 1,
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
        },
        totalWon: user.totalWon,
        ticketsPurchased: user.ticketsPurchased,
      })),
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener ranking de ganadores' });
  }
};

/**
 * Obtiene el ranking de jugadores que más han gastado
 */
export const getTopSpenders = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { limit = 10 } = req.query;

    const topSpenders = await User.find({ role: 'user' })
      .sort({ totalSpent: -1 })
      .limit(Number(limit))
      .select('firstName lastName email totalSpent totalWon ticketsPurchased');

    res.json({
      ranking: topSpenders.map((user, index) => ({
        position: index + 1,
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
        },
        totalSpent: user.totalSpent,
        totalWon: user.totalWon,
        ticketsPurchased: user.ticketsPurchased,
      })),
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener ranking de gastadores' });
  }
};

/**
 * Obtiene estadísticas generales de rankings
 */
export const getRankingStats = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalTicketsPurchased = await User.aggregate([
      { $match: { role: 'user' } },
      { $group: { _id: null, total: { $sum: '$ticketsPurchased' } } },
    ]);
    const totalSpent = await User.aggregate([
      { $match: { role: 'user' } },
      { $group: { _id: null, total: { $sum: '$totalSpent' } } },
    ]);
    const totalWon = await User.aggregate([
      { $match: { role: 'user' } },
      { $group: { _id: null, total: { $sum: '$totalWon' } } },
    ]);

    res.json({
      stats: {
        totalUsers,
        totalTicketsPurchased: totalTicketsPurchased[0]?.total || 0,
        totalSpent: totalSpent[0]?.total || 0,
        totalWon: totalWon[0]?.total || 0,
        averageSpentPerUser:
          totalUsers > 0 ? (totalSpent[0]?.total || 0) / totalUsers : 0,
        averageWonPerUser:
          totalUsers > 0 ? (totalWon[0]?.total || 0) / totalUsers : 0,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
};
