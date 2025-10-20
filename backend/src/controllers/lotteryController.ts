import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import Lottery from '../models/Lottery';
import { validationResult } from 'express-validator';
import { calculatePrizeDistribution, performDraw } from '../utils/lotteryDrawing';

/**
 * Crea una nueva lotería (solo admin)
 */
export const createLottery = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const {
      name,
      description,
      ticketPrice,
      drawDate,
      maxTickets,
      numbersRange,
      prizePercentages,
    } = req.body;

    // Calcular premio total basado en ventas esperadas
    const totalPrize = ticketPrice * maxTickets;

    // Calcular distribución de premios
    const prizeDistribution = calculatePrizeDistribution(
      totalPrize,
      prizePercentages || [
        { position: 1, percentage: 50 },
        { position: 2, percentage: 30 },
        { position: 3, percentage: 20 },
      ]
    );

    const lottery = await Lottery.create({
      name,
      description,
      ticketPrice,
      totalPrize,
      drawDate: new Date(drawDate),
      maxTickets,
      numbersRange: numbersRange || { min: 1, max: 50, count: 6 },
      prizeDistribution,
      createdBy: req.user!._id,
      status: new Date(drawDate) > new Date() ? 'upcoming' : 'active',
    });

    res.status(201).json({
      message: 'Lotería creada exitosamente',
      lottery,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear lotería' });
  }
};

/**
 * Obtiene todas las loterías
 */
export const getAllLotteries = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const filter: any = {};
    if (status) filter.status = status;

    const lotteries = await Lottery.find(filter)
      .sort({ drawDate: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .populate('createdBy', 'firstName lastName email');

    const total = await Lottery.countDocuments(filter);

    res.json({
      lotteries,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener loterías' });
  }
};

/**
 * Obtiene una lotería por ID
 */
export const getLotteryById = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const lottery = await Lottery.findById(id)
      .populate('createdBy', 'firstName lastName email')
      .populate('winners.userId', 'firstName lastName email');

    if (!lottery) {
      res.status(404).json({ error: 'Lotería no encontrada' });
      return;
    }

    res.json({ lottery });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener lotería' });
  }
};

/**
 * Actualiza una lotería (solo admin)
 */
export const updateLottery = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const lottery = await Lottery.findById(id);
    if (!lottery) {
      res.status(404).json({ error: 'Lotería no encontrada' });
      return;
    }

    // No permitir actualizar loterías completadas
    if (lottery.status === 'completed') {
      res.status(400).json({ error: 'No se puede actualizar una lotería completada' });
      return;
    }

    Object.assign(lottery, updates);
    await lottery.save();

    res.json({
      message: 'Lotería actualizada exitosamente',
      lottery,
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar lotería' });
  }
};

/**
 * Realiza el sorteo de una lotería (solo admin)
 */
export const drawLottery = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const lottery = await performDraw(id);

    res.json({
      message: 'Sorteo realizado exitosamente',
      lottery,
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Error al realizar sorteo' });
  }
};

/**
 * Cancela una lotería (solo admin)
 */
export const cancelLottery = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const lottery = await Lottery.findById(id);
    if (!lottery) {
      res.status(404).json({ error: 'Lotería no encontrada' });
      return;
    }

    if (lottery.status === 'completed') {
      res.status(400).json({ error: 'No se puede cancelar una lotería completada' });
      return;
    }

    lottery.status = 'cancelled';
    await lottery.save();

    res.json({
      message: 'Lotería cancelada exitosamente',
      lottery,
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al cancelar lotería' });
  }
};
