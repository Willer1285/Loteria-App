import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import Payment from '../models/Payment';
import User from '../models/User';
import { v4 as uuidv4 } from 'uuid';
import { createNotification } from './notificationController';

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
      description: `Depósito de $${amount}`,
      metadata,
    });

    const user = await User.findById(userId);

    // Enviar notificación de solicitud recibida
    await createNotification(
      String(userId),
      'profile_updated',
      'Solicitud de depósito recibida 📥',
      `Tu solicitud de depósito por $${amount.toFixed(2)} ha sido recibida y está pendiente de aprobación por el administrador. Te notificaremos cuando sea procesada.`,
      String(payment._id),
      {
        amount,
        method,
        transactionId: payment.transactionId
      }
    );

    res.status(201).json({
      message: 'Solicitud de depósito creada. Pendiente de aprobación por administrador.',
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
      description: `Retiro de $${amount}`,
      metadata,
    });

    // Enviar notificación de solicitud recibida
    await createNotification(
      String(userId),
      'profile_updated',
      'Solicitud de retiro recibida 📤',
      `Tu solicitud de retiro por $${amount.toFixed(2)} ha sido recibida y está pendiente de aprobación por el administrador. Te notificaremos cuando sea procesada.`,
      String(payment._id),
      {
        amount,
        method,
        transactionId: payment.transactionId,
        currentBalance: user.balance
      }
    );

    res.status(201).json({
      message: 'Solicitud de retiro creada. Pendiente de aprobación por administrador.',
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
    const { type, status, page, limit } = req.query;

    const filter: any = { userId };
    if (type) filter.type = type;
    if (status) filter.status = status;

    let query = Payment.find(filter)
      .sort({ createdAt: -1 })
      .populate('ticketId')
      .populate('lotteryId', 'name');

    // Solo aplicar paginación si se especifica limit
    if (limit) {
      const pageNum = Number(page) || 1;
      const limitNum = Number(limit);
      query = query
        .limit(limitNum)
        .skip((pageNum - 1) * limitNum);
    }

    const payments = await query;
    const total = await Payment.countDocuments(filter);

    res.json({
      payments,
      pagination: {
        total,
        page: limit ? Number(page) || 1 : 1,
        pages: limit ? Math.ceil(total / Number(limit)) : 1,
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

/**
 * Aprueba un pago pendiente (solo admin/gerente)
 */
export const approvePayment = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const payment = await Payment.findById(id).populate('userId');
    if (!payment) {
      res.status(404).json({ error: 'Pago no encontrado' });
      return;
    }

    if (payment.status !== 'pending') {
      res.status(400).json({ error: 'El pago ya fue procesado' });
      return;
    }

    const user = await User.findById(payment.userId);
    if (!user) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }

    // Procesar según el tipo de pago
    if (payment.type === 'deposit') {
      // Incrementar balance del usuario
      user.balance += payment.amount;
      await user.save();
    } else if (payment.type === 'withdrawal') {
      // Verificar que tenga suficiente saldo
      if (user.balance < payment.amount) {
        res.status(400).json({ error: 'Usuario no tiene saldo suficiente' });
        return;
      }
      // Decrementar balance del usuario
      user.balance -= payment.amount;
      await user.save();
    }

    // Actualizar estado del pago
    payment.status = 'completed';
    payment.processedAt = new Date();
    await payment.save();

    // Crear notificación
    const notifType = payment.type === 'deposit' ? 'deposit_approved' : 'withdrawal_approved';
    const actionText = payment.type === 'deposit' ? 'depositado' : 'retirado';
    await createNotification(
      String(user._id),
      notifType,
      `${payment.type === 'deposit' ? 'Depósito' : 'Retiro'} aprobado`,
      `Tu ${payment.type === 'deposit' ? 'depósito' : 'retiro'} de $${payment.amount.toFixed(2)} ha sido aprobado y ${actionText} exitosamente.${payment.type === 'deposit' ? ' Tu saldo ha sido actualizado.' : ''}`,
      String(payment._id),
      { amount: payment.amount }
    );

    res.json({
      message: `${payment.type === 'deposit' ? 'Depósito' : 'Retiro'} aprobado exitosamente`,
      payment,
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al aprobar pago' });
  }
};

/**
 * Rechaza un pago pendiente (solo admin/gerente)
 */
export const rejectPayment = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const payment = await Payment.findById(id);
    if (!payment) {
      res.status(404).json({ error: 'Pago no encontrado' });
      return;
    }

    if (payment.status !== 'pending') {
      res.status(400).json({ error: 'El pago ya fue procesado' });
      return;
    }

    // Actualizar estado del pago
    payment.status = 'cancelled';
    payment.processedAt = new Date();
    if (reason) {
      payment.description += ` - Rechazado: ${reason}`;
    }
    await payment.save();

    // Crear notificación
    const notifType = payment.type === 'deposit' ? 'deposit_rejected' : 'withdrawal_rejected';
    await createNotification(
      String(payment.userId),
      notifType,
      `${payment.type === 'deposit' ? 'Depósito' : 'Retiro'} rechazado`,
      `Tu ${payment.type === 'deposit' ? 'depósito' : 'retiro'} de $${payment.amount.toFixed(2)} ha sido rechazado.${reason ? ` Motivo: ${reason}` : ''}`,
      String(payment._id),
      { amount: payment.amount, reason }
    );

    res.json({
      message: `${payment.type === 'deposit' ? 'Depósito' : 'Retiro'} rechazado`,
      payment,
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al rechazar pago' });
  }
};
