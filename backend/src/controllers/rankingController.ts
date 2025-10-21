import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import User from '../models/User';
import Ticket from '../models/Ticket';
import Lottery from '../models/Lottery';

/**
 * Obtiene el ranking de jugadores que más boletos han comprado
 */
export const getTopBuyers = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { limit = 10 } = req.query;

    const topBuyers = await User.find({ role: 'jugador' })
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

    const topWinners = await User.find({ role: 'jugador', totalWon: { $gt: 0 } })
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

    const topSpenders = await User.find({ role: 'jugador' })
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
    const totalUsers = await User.countDocuments({ role: 'jugador' });
    const totalTicketsPurchased = await User.aggregate([
      { $match: { role: 'jugador' } },
      { $group: { _id: null, total: { $sum: '$ticketsPurchased' } } },
    ]);
    const totalSpent = await User.aggregate([
      { $match: { role: 'jugador' } },
      { $group: { _id: null, total: { $sum: '$totalSpent' } } },
    ]);
    const totalWon = await User.aggregate([
      { $match: { role: 'jugador' } },
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

/**
 * Obtiene el ranking de jugadores por sorteo (los que más boletos compraron)
 */
export const getRankingByLottery = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { lotteryId } = req.params;

    // Verificar que el sorteo existe
    const lottery = await Lottery.findById(lotteryId);
    if (!lottery) {
      res.status(404).json({ error: 'Sorteo no encontrado' });
      return;
    }

    // Obtener tickets del sorteo agrupados por usuario
    const tickets = await Ticket.aggregate([
      { $match: { lotteryId: lottery._id } },
      {
        $group: {
          _id: '$userId',
          totalTickets: { $sum: 1 },
          totalSpent: { $sum: '$price' },
        },
      },
      { $sort: { totalTickets: -1 } },
      { $limit: 100 },
    ]);

    // Poblar información de usuarios
    const userIds = tickets.map((t) => t._id);
    const users = await User.find({ _id: { $in: userIds } }).select(
      'firstName lastName avatar email'
    );

    const userMap = new Map(users.map((u) => [String(u._id), u]));

    const ranking = tickets.map((t, index) => {
      const user = userMap.get(String(t._id));
      return {
        position: index + 1,
        user: {
          id: t._id,
          firstName: user?.firstName || 'N/A',
          lastName: user?.lastName || '',
          avatar: user?.avatar,
          email: user?.email,
        },
        totalTickets: t.totalTickets,
        totalSpent: t.totalSpent,
      };
    });

    res.json({
      lottery: {
        id: lottery._id,
        name: lottery.name,
        controlNumber: lottery.controlNumber,
      },
      ranking
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener ranking del sorteo' });
  }
};

/**
 * Obtiene el ranking mensual (por más boletos comprados y más sorteos ganados)
 */
export const getMonthlyRanking = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { year, month } = req.query;

    const startDate = new Date(Number(year), Number(month) - 1, 1);
    const endDate = new Date(Number(year), Number(month), 0, 23, 59, 59, 999);

    // Ranking por más boletos comprados
    const ticketsPurchased = await Ticket.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: '$userId',
          totalTickets: { $sum: 1 },
          totalSpent: { $sum: '$price' },
        },
      },
      { $sort: { totalTickets: -1 } },
      { $limit: 50 },
    ]);

    // Ranking por más sorteos ganados
    const lotteriesWon = await Ticket.aggregate([
      {
        $match: {
          status: 'won',
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: '$userId',
          lotteriesWon: { $sum: 1 },
          totalPrizes: { $sum: '$prize' },
        },
      },
      { $sort: { lotteriesWon: -1 } },
      { $limit: 50 },
    ]);

    // Obtener información de usuarios
    const allUserIds = [
      ...ticketsPurchased.map((t) => t._id),
      ...lotteriesWon.map((t) => t._id),
    ];
    const users = await User.find({ _id: { $in: allUserIds } }).select(
      'firstName lastName avatar email'
    );

    const userMap = new Map(users.map((u) => [String(u._id), u]));

    const rankingByTickets = ticketsPurchased.map((t, index) => {
      const user = userMap.get(String(t._id));
      return {
        position: index + 1,
        user: {
          id: t._id,
          firstName: user?.firstName || 'N/A',
          lastName: user?.lastName || '',
          avatar: user?.avatar,
          email: user?.email,
        },
        totalTickets: t.totalTickets,
        totalSpent: t.totalSpent,
      };
    });

    const rankingByWins = lotteriesWon.map((t, index) => {
      const user = userMap.get(String(t._id));
      return {
        position: index + 1,
        user: {
          id: t._id,
          firstName: user?.firstName || 'N/A',
          lastName: user?.lastName || '',
          avatar: user?.avatar,
          email: user?.email,
        },
        lotteriesWon: t.lotteriesWon,
        totalPrizes: t.totalPrizes,
      };
    });

    res.json({
      period: { year: Number(year), month: Number(month) },
      rankingByTickets,
      rankingByWins,
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener ranking mensual' });
  }
};

/**
 * Obtiene el ranking anual (por más boletos comprados y más sorteos ganados)
 */
export const getYearlyRanking = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { year } = req.query;

    const startDate = new Date(Number(year), 0, 1);
    const endDate = new Date(Number(year), 11, 31, 23, 59, 59, 999);

    // Ranking por más boletos comprados
    const ticketsPurchased = await Ticket.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: '$userId',
          totalTickets: { $sum: 1 },
          totalSpent: { $sum: '$price' },
        },
      },
      { $sort: { totalTickets: -1 } },
      { $limit: 50 },
    ]);

    // Ranking por más sorteos ganados
    const lotteriesWon = await Ticket.aggregate([
      {
        $match: {
          status: 'won',
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: '$userId',
          lotteriesWon: { $sum: 1 },
          totalPrizes: { $sum: '$prize' },
        },
      },
      { $sort: { lotteriesWon: -1 } },
      { $limit: 50 },
    ]);

    // Obtener información de usuarios
    const allUserIds = [
      ...ticketsPurchased.map((t) => t._id),
      ...lotteriesWon.map((t) => t._id),
    ];
    const users = await User.find({ _id: { $in: allUserIds } }).select(
      'firstName lastName avatar email'
    );

    const userMap = new Map(users.map((u) => [String(u._id), u]));

    const rankingByTickets = ticketsPurchased.map((t, index) => {
      const user = userMap.get(String(t._id));
      return {
        position: index + 1,
        user: {
          id: t._id,
          firstName: user?.firstName || 'N/A',
          lastName: user?.lastName || '',
          avatar: user?.avatar,
          email: user?.email,
        },
        totalTickets: t.totalTickets,
        totalSpent: t.totalSpent,
      };
    });

    const rankingByWins = lotteriesWon.map((t, index) => {
      const user = userMap.get(String(t._id));
      return {
        position: index + 1,
        user: {
          id: t._id,
          firstName: user?.firstName || 'N/A',
          lastName: user?.lastName || '',
          avatar: user?.avatar,
          email: user?.email,
        },
        lotteriesWon: t.lotteriesWon,
        totalPrizes: t.totalPrizes,
      };
    });

    res.json({
      year: Number(year),
      rankingByTickets,
      rankingByWins,
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener ranking anual' });
  }
};
