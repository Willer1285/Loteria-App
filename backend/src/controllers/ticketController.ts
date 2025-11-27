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
import { createNotification } from './notificationController';
import { v4 as uuidv4 } from 'uuid';

/**
 * Compra un boleto de lotería
 */
export const purchaseTicket = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { lotteryId, numbers } = req.body;
    let quantity = req.body.quantity || 1; // Usar let para poder reasignar
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

    let originalQuantity = quantity;
    let totalCost = lottery.ticketPrice * quantity;

    // Verificar que el usuario tiene suficiente balance
    if (user.balance < totalCost) {
      res.status(400).json({ error: 'Saldo insuficiente' });
      return;
    }

    const tickets = [];

    // Obtener el número de tickets existentes para este sorteo para generar números secuenciales
    const existingTicketsCount = await Ticket.countDocuments({ lotteryId: lottery._id });

    // Si es compra al azar, primero obtener todos los números ya vendidos
    let soldNumbers: number[] = [];
    if (!numbers || numbers.length === 0) {
      const existingTickets = await Ticket.find({
        lotteryId: lottery._id
      }).select('numbers');

      soldNumbers = existingTickets.map(t => t.numbers[0]);
    }

    // Generar todos los números disponibles
    let availableNumbers: number[] = [];
    if (!numbers || numbers.length === 0) {
      const { min, max } = lottery.numbersRange;
      for (let num = min; num <= max; num++) {
        if (!soldNumbers.includes(num)) {
          availableNumbers.push(num);
        }
      }

      // Verificar si hay suficientes números disponibles
      if (availableNumbers.length < quantity) {
        // Si no hay suficientes, solo vender los disponibles y notificar
        const adjustedQuantity = availableNumbers.length;
        const adjustedCost = lottery.ticketPrice * adjustedQuantity;

        if (adjustedQuantity === 0) {
          res.status(400).json({
            error: 'No hay números disponibles para comprar.'
          });
          return;
        }

        // Verificar que el usuario tiene suficiente balance para la cantidad ajustada
        if (user.balance < adjustedCost) {
          res.status(400).json({ error: 'Saldo insuficiente' });
          return;
        }

        // Actualizar cantidad y costo al número de boletos disponibles
        quantity = adjustedQuantity;
        totalCost = adjustedCost;
      }

      // Mezclar el array aleatoriamente (Fisher-Yates shuffle)
      for (let i = availableNumbers.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [availableNumbers[i], availableNumbers[j]] = [availableNumbers[j], availableNumbers[i]];
      }
    }

    // Crear fecha de compra única para todos los boletos de esta transacción
    const purchaseDate = new Date();

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
        // Tomar el siguiente número disponible (ya está mezclado aleatoriamente)
        ticketNumbers = [availableNumbers[i]];
      }

      // Generar número secuencial: count actual + i + 1
      const sequentialNumber = existingTicketsCount + i + 1;

      const ticket = await Ticket.create({
        ticketNumber: generateTicketNumber(lottery.controlNumber, sequentialNumber),
        lotteryId: lottery._id,
        userId: user._id,
        numbers: ticketNumbers,
        price: lottery.ticketPrice,
        purchaseDate: purchaseDate,
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

    // Preparar respuesta
    const response: any = {
      message: 'Boleto(s) comprado(s) exitosamente',
      tickets,
      balance: user.balance,
    };

    // Si se compró menos de lo solicitado, agregar información
    if (quantity < originalQuantity) {
      response.warning = `Solo había ${quantity} números disponibles. Se compraron ${quantity} boletos de ${originalQuantity} solicitados.`;
      response.adjustedQuantity = quantity;
      response.requestedQuantity = originalQuantity;
    }

    // Enviar notificación de compra
    const ticketNumbers = tickets.map((t: any) => t.ticketNumber).join(', ');
    await createNotification(
      String(userId),
      'profile_updated',
      'Compra de boletos exitosa 🎟️',
      `Has comprado ${quantity} boleto${quantity > 1 ? 's' : ''} para el sorteo "${lottery.name}" por un total de $${totalCost.toFixed(2)}. Números de boleto: ${ticketNumbers}. ¡Buena suerte!`,
      String(lottery._id),
      {
        quantity,
        totalCost,
        lotteryName: lottery.name,
        ticketNumbers: tickets.map((t: any) => t.ticketNumber)
      }
    );

    res.status(201).json(response);
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
    const { status, lotteryId, page, limit } = req.query;

    const filter: any = { userId };
    if (status) filter.status = status;
    if (lotteryId) filter.lotteryId = lotteryId;

    let query = Ticket.find(filter)
      .sort({ purchaseDate: -1 })
      .populate('lotteryId', 'name drawDate status winningNumbers controlNumber');

    // Solo aplicar paginación si se especifica limit
    if (limit) {
      const pageNum = Number(page) || 1;
      const limitNum = Number(limit);
      query = query
        .limit(limitNum)
        .skip((pageNum - 1) * limitNum);
    }

    const tickets = await query;
    const total = await Ticket.countDocuments(filter);

    res.json({
      tickets,
      pagination: {
        total,
        page: limit ? Number(page) || 1 : 1,
        pages: limit ? Math.ceil(total / Number(limit)) : 1,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener boletos' });
  }
};

/**
 * Obtiene todos los boletos de un sorteo (solo para admin/gerente)
 */
export const getAllLotteryTickets = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { lotteryId } = req.query;

    if (!lotteryId) {
      res.status(400).json({ error: 'Se requiere el ID del sorteo' });
      return;
    }

    const filter: any = { lotteryId };

    const tickets = await Ticket.find(filter)
      .select('numbers status userId')
      .sort({ purchaseDate: -1 });

    res.json({
      tickets,
      total: tickets.length,
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener boletos del sorteo' });
  }
};

/**
 * Obtiene TODOS los boletos de TODOS los sorteos (solo para admin/gerente)
 */
export const getAllTicketsAdmin = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { status, limit, page } = req.query;

    const filter: any = {};
    if (status) filter.status = status;

    let query = Ticket.find(filter)
      .populate('userId', 'firstName lastName email username')
      .populate('lotteryId', 'name controlNumber ticketPrice')
      .sort({ purchaseDate: -1 });

    // Aplicar paginación si se especifica
    if (limit) {
      const pageNum = Number(page) || 1;
      const limitNum = Number(limit);
      query = query
        .limit(limitNum)
        .skip((pageNum - 1) * limitNum);
    }

    const tickets = await query;
    const total = await Ticket.countDocuments(filter);

    res.json({
      tickets,
      total,
      pagination: limit ? {
        page: Number(page) || 1,
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit))
      } : undefined
    });
  } catch (error) {
    console.error('Error al obtener todos los tickets:', error);
    res.status(500).json({ error: 'Error al obtener tickets' });
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

/**
 * Verifica un boleto por número comprado y sorteo
 */
export const verifyTicketByLotteryAndNumber = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { lotteryId, number } = req.query;

    if (!lotteryId || !number) {
      res.status(400).json({ error: 'Se requiere el ID del sorteo y el número' });
      return;
    }

    const ticketNumber = Number(number);
    if (isNaN(ticketNumber)) {
      res.status(400).json({ error: 'El número debe ser válido' });
      return;
    }

    // Buscar boleto que contenga el número en el sorteo específico
    const ticket = await Ticket.findOne({
      lotteryId,
      numbers: ticketNumber,
    })
      .populate('userId', 'firstName lastName email')
      .populate('lotteryId');

    if (!ticket) {
      res.status(404).json({ error: 'No se encontró ningún propietario con ese número de boleto en este sorteo' });
      return;
    }

    res.json({ ticket });
  } catch (error) {
    res.status(500).json({ error: 'Error al verificar boleto' });
  }
};

/**
 * Anula un boleto y reintegra dinero al usuario (solo admin/gerente)
 */
export const cancelTicket = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { refundType, refundPercentage, reason } = req.body;

    // Validar tipo de reintegro
    if (!['full', 'partial', 'none'].includes(refundType)) {
      res.status(400).json({ error: 'Tipo de reintegro inválido. Opciones: full, partial, none' });
      return;
    }

    // Validar porcentaje si es parcial
    if (refundType === 'partial' && (!refundPercentage || refundPercentage < 0 || refundPercentage > 100)) {
      res.status(400).json({ error: 'El porcentaje de reintegro debe estar entre 0 y 100' });
      return;
    }

    const ticket = await Ticket.findById(id)
      .populate('userId')
      .populate('lotteryId');

    if (!ticket) {
      res.status(404).json({ error: 'Boleto no encontrado' });
      return;
    }

    // No permitir anular boletos ya cancelados
    if (ticket.status === 'cancelled') {
      res.status(400).json({ error: 'El boleto ya está cancelado' });
      return;
    }

    // No permitir anular boletos ganadores que ya cobraron
    if (ticket.status === 'won' && ticket.prize && ticket.prize > 0) {
      res.status(400).json({ error: 'No se puede anular un boleto ganador que ya cobró premio' });
      return;
    }

    const user = ticket.userId as any;
    const lottery = ticket.lotteryId as any;

    // Calcular el monto de reintegro
    let refundAmount = 0;
    if (refundType === 'full') {
      refundAmount = ticket.price;
    } else if (refundType === 'partial') {
      refundAmount = (ticket.price * refundPercentage!) / 100;
    }

    // Actualizar balance del usuario si hay reintegro
    if (refundAmount > 0 && user) {
      await User.findByIdAndUpdate(user._id, {
        $inc: {
          balance: refundAmount,
          totalSpent: -ticket.price // Restar del total gastado
        }
      });

      // Crear registro de pago del reintegro
      await Payment.create({
        userId: user._id,
        amount: refundAmount,
        type: 'deposit',
        status: 'completed',
        method: 'refund',
        transactionId: `REFUND-${uuidv4()}`,
        description: `Reintegro por cancelación de boleto ${ticket.ticketNumber} - ${refundType === 'full' ? 'Total' : `${refundPercentage}%`}${reason ? ` - Motivo: ${reason}` : ''}`,
        ticketId: ticket._id,
        lotteryId: lottery?._id,
        processedAt: new Date(),
        metadata: { refundType, refundPercentage, originalPrice: ticket.price, reason }
      });
    }

    // Actualizar el boleto
    ticket.status = 'cancelled';
    await ticket.save();

    // Actualizar contador de boletos vendidos de la lotería
    if (lottery) {
      await Lottery.findByIdAndUpdate(lottery._id, {
        $inc: { soldTickets: -1 }
      });
    }

    // Enviar notificación al usuario
    if (user) {
      const refundText = refundAmount > 0
        ? `Se te ha reintegrado $${refundAmount.toFixed(2)} (${refundType === 'full' ? '100%' : `${refundPercentage}%`}) a tu saldo.`
        : 'No se realizó reintegro.';

      await createNotification(
        String(user._id),
        'profile_updated',
        'Boleto cancelado ❌',
        `Tu boleto ${ticket.ticketNumber} para el sorteo "${lottery?.name || 'N/A'}" ha sido cancelado por el administrador. ${refundText}${reason ? ` Motivo: ${reason}` : ''}`,
        String(ticket._id),
        {
          ticketNumber: ticket.ticketNumber,
          lotteryName: lottery?.name,
          refundType,
          refundAmount,
          originalPrice: ticket.price,
          reason
        }
      );
    }

    res.json({
      message: 'Boleto cancelado exitosamente',
      ticket,
      refundAmount,
      refundType
    });
  } catch (error) {
    console.error('Error al cancelar boleto:', error);
    res.status(500).json({ error: 'Error al cancelar boleto' });
  }
};
