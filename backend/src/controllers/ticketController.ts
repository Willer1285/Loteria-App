import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import Ticket from '../models/Ticket';
import Lottery from '../models/Lottery';
import User from '../models/User';
import Payment from '../models/Payment';
import {
  generateTicketNumber,
  generateVerificationCode,
  generateRandomNumbers,
  validateNumbers,
} from '../utils/ticketGenerator';

/**
 * Compra un boleto de lotería
 */
export const purchaseTicket = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { lotteryId, numbers, quantity = 1 } = req.body;
    const userId = req.user!._id;

    // Verificar que la lotería existe
    const lottery = await Lottery.findById(lotteryId);
    if (!lottery) {
      res.status(404).json({ error: 'Lotería no encontrada' });
      return;
    }

    // Verificar que la lotería está activa
    if (lottery.status !== 'active' && lottery.status !== 'upcoming') {
      res.status(400).json({ error: 'La lotería no está disponible para compra' });
      return;
    }

    // Verificar que hay boletos disponibles
    if (lottery.soldTickets + quantity > lottery.maxTickets) {
      res.status(400).json({ error: 'No hay suficientes boletos disponibles' });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }

    const totalCost = lottery.ticketPrice * quantity;

    // Verificar que el usuario tiene suficiente balance
    if (user.balance < totalCost) {
      res.status(400).json({ error: 'Saldo insuficiente' });
      return;
    }

    const tickets = [];

    // Crear los boletos
    for (let i = 0; i < quantity; i++) {
      let ticketNumbers: number[];

      if (numbers && numbers.length > 0) {
        // Validar números proporcionados
        if (!validateNumbers(
          numbers,
          lottery.numbersRange.min,
          lottery.numbersRange.max,
          lottery.numbersRange.count
        )) {
          res.status(400).json({ error: 'Números inválidos' });
          return;
        }
        ticketNumbers = numbers;
      } else {
        // Generar números aleatorios
        ticketNumbers = generateRandomNumbers(
          lottery.numbersRange.min,
          lottery.numbersRange.max,
          lottery.numbersRange.count
        );
      }

      const ticket = await Ticket.create({
        ticketNumber: generateTicketNumber(),
        lotteryId: lottery._id,
        userId: user._id,
        numbers: ticketNumbers,
        price: lottery.ticketPrice,
        verificationCode: generateVerificationCode(),
      });

      tickets.push(ticket);
    }

    // Actualizar balance del usuario
    user.balance -= totalCost;
    user.totalSpent += totalCost;
    user.ticketsPurchased += quantity;
    await user.save();

    // Actualizar lotería
    lottery.soldTickets += quantity;
    await lottery.save();

    // Crear registro de pago
    await Payment.create({
      userId: user._id,
      amount: totalCost,
      type: 'ticket_purchase',
      status: 'completed',
      method: 'wallet',
      lotteryId: lottery._id,
      description: `Compra de ${quantity} boleto(s) para ${lottery.name}`,
      processedAt: new Date(),
    });

    res.status(201).json({
      message: 'Boleto(s) comprado(s) exitosamente',
      tickets,
      balance: user.balance,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al comprar boleto' });
  }
};

/**
 * Obtiene los boletos del usuario
 */
export const getUserTickets = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user!._id;
    const { status, page = 1, limit = 20 } = req.query;

    const filter: any = { userId };
    if (status) filter.status = status;

    const tickets = await Ticket.find(filter)
      .sort({ purchaseDate: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .populate('lotteryId', 'name drawDate status winningNumbers');

    const total = await Ticket.countDocuments(filter);

    res.json({
      tickets,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener boletos' });
  }
};

/**
 * Verifica un boleto por código
 */
export const verifyTicket = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { verificationCode } = req.params;

    const ticket = await Ticket.findOne({ verificationCode })
      .populate('userId', 'firstName lastName email')
      .populate('lotteryId');

    if (!ticket) {
      res.status(404).json({ error: 'Boleto no encontrado' });
      return;
    }

    ticket.isVerified = true;
    await ticket.save();

    res.json({
      message: 'Boleto verificado exitosamente',
      ticket,
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al verificar boleto' });
  }
};

/**
 * Obtiene un boleto por su número
 */
export const getTicketByNumber = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { ticketNumber } = req.params;

    const ticket = await Ticket.findOne({ ticketNumber })
      .populate('userId', 'firstName lastName email')
      .populate('lotteryId');

    if (!ticket) {
      res.status(404).json({ error: 'Boleto no encontrado' });
      return;
    }

    res.json({ ticket });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener boleto' });
  }
};
