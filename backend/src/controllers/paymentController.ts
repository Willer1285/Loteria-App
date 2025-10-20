import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import Payment from '../models/Payment';
import User from '../models/User';
import { v4 as uuidv4 } from 'uuid';

/**
 * Realiza un depósito a la cuenta del usuario
 */
export const deposit = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { amount, method, metadata } = req.body;
    const userId = req.user!._id;

    if (amount <= 0) {
      res.status(400).json({ error: 'El monto debe ser mayor a 0' });
      return;
    }

    const payment = await Payment.create({
      userId,
      amount,
      type: 'deposit',
      status: 'pending',
      method,
      transactionId: `DEP-${uuidv4()}`,
      description: `Depósito de ${amount}`,
      metadata,
    });

    // En una implementación real, aquí se procesaría el pago con la pasarela
    // Por ahora, lo marcamos como completado automáticamente
    payment.status = 'completed';
    payment.processedAt = new Date();
    await payment.save();

    // Actualizar balance del usuario
    await User.findByIdAndUpdate(userId, {
      $inc: { balance: amount },
    });

    const user = await User.findById(userId);

    res.status(201).json({
      message: 'Depósito procesado exitosamente',
      payment,
      balance: user?.balance,
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al procesar depósito' });
  }
};

/**
 * Realiza un retiro de la cuenta del usuario
 */
export const withdraw = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { amount, method, metadata } = req.body;
    const userId = req.user!._id;

    if (amount <= 0) {
      res.status(400).json({ error: 'El monto debe ser mayor a 0' });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }

    if (user.balance < amount) {
      res.status(400).json({ error: 'Saldo insuficiente' });
      return;
    }

    const payment = await Payment.create({
      userId,
      amount,
      type: 'withdrawal',
      status: 'pending',
      method,
      transactionId: `WTD-${uuidv4()}`,
      description: `Retiro de ${amount}`,
      metadata,
    });

    // En una implementación real, aquí se procesaría el retiro
    // Por ahora, lo marcamos como completado automáticamente
    payment.status = 'completed';
    payment.processedAt = new Date();
    await payment.save();

    // Actualizar balance del usuario
    user.balance -= amount;
    await user.save();

    res.status(201).json({
      message: 'Retiro procesado exitosamente',
      payment,
      balance: user.balance,
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al procesar retiro' });
  }
};

/**
 * Obtiene el historial de pagos del usuario
 */
export const getPaymentHistory = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user!._id;
    const { type, status, page = 1, limit = 20 } = req.query;

    const filter: any = { userId };
    if (type) filter.type = type;
    if (status) filter.status = status;

    const payments = await Payment.find(filter)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .populate('ticketId')
      .populate('lotteryId', 'name');

    const total = await Payment.countDocuments(filter);

    res.json({
      payments,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener historial de pagos' });
  }
};

/**
 * Obtiene todos los pagos (solo admin)
 */
export const getAllPayments = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { type, status, page = 1, limit = 50 } = req.query;

    const filter: any = {};
    if (type) filter.type = type;
    if (status) filter.status = status;

    const payments = await Payment.find(filter)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .populate('userId', 'firstName lastName email')
      .populate('ticketId')
      .populate('lotteryId', 'name');

    const total = await Payment.countDocuments(filter);

    res.json({
      payments,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener pagos' });
  }
};
