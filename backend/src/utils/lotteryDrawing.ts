import Lottery, { ILottery } from '../models/Lottery';
import Ticket, { ITicket } from '../models/Ticket';
import User from '../models/User';
import Payment from '../models/Payment';
import { generateRandomNumbers, countMatchingNumbers } from './ticketGenerator';
import { createNotification } from '../controllers/notificationController';

/**
 * Realiza el sorteo de una lotería
 */
export const performDraw = async (lotteryId: string, manualWinningNumbers?: number[]): Promise<ILottery> => {
  const lottery = await Lottery.findById(lotteryId);

  if (!lottery) {
    throw new Error('Lotería no encontrada');
  }

  // Permitir sortear si está en estado 'active' o 'pending_draw'
  if (lottery.status !== 'active' && lottery.status !== 'pending_draw') {
    throw new Error('La lotería no está disponible para sorteo');
  }

  // Determinar cuántos números ganadores necesitamos: 1 por cada premio
  const numberOfWinners = lottery.prizes.length;

  // Usar números manuales si se proporcionan, de lo contrario generar aleatoriamente
  // Generar tantos números como premios haya
  const winningNumbers = manualWinningNumbers && manualWinningNumbers.length > 0
    ? manualWinningNumbers
    : generateRandomNumbers(
        lottery.numbersRange.min,
        lottery.numbersRange.max,
        numberOfWinners // 1 número por cada premio
      );

  lottery.winningNumbers = winningNumbers;
  lottery.status = 'drawing';
  await lottery.save();

  // Obtener todos los boletos de esta lotería
  const tickets = await Ticket.find({ lotteryId: lottery._id, status: 'active' });

  const winners: ILottery['winners'] = [];

  // Asignar cada número ganador a su premio correspondiente
  // Cada boleto tiene UN solo número, así que buscamos coincidencia exacta
  for (let i = 0; i < lottery.prizes.length; i++) {
    const prize = lottery.prizes[i];
    const winningNumber = winningNumbers[i];

    // Buscar boleto con el número ganador exacto
    const winningTicket = tickets.find(
      ticket => ticket.numbers[0] === winningNumber &&
      !winners.some(w => String(w.ticketId) === String(ticket._id))
    );

    if (winningTicket) {
      winners.push({
        userId: winningTicket.userId,
        ticketId: winningTicket._id as any,
        prize: prize.amount,
        position: prize.position,
      });

      // Actualizar el boleto
      winningTicket.status = 'won';
      winningTicket.matchedNumbers = 1; // Coincidencia exacta
      winningTicket.prize = prize.amount;
      await winningTicket.save();

      // Actualizar el balance del usuario
      await User.findByIdAndUpdate(
        winningTicket.userId,
        {
          $inc: {
            balance: prize.amount,
            totalWon: prize.amount
          }
        }
      );

      // Crear registro de pago
      await Payment.create({
        userId: winningTicket.userId,
        amount: prize.amount,
        type: 'prize_payout',
        status: 'completed',
        method: 'wallet',
        ticketId: winningTicket._id,
        lotteryId: lottery._id,
        description: `Premio por lotería ${lottery.name} - Posición ${prize.position}`,
        processedAt: new Date(),
      });

      // Enviar notificación de premio ganado
      await createNotification(
        String(winningTicket.userId),
        'prize_won',
        '¡Felicidades! Has ganado un premio 🏆',
        `¡Enhorabuena! Has ganado el ${prize.position}° premio de $${prize.amount.toFixed(2)} en el sorteo "${lottery.name}". Tu número ganador fue ${winningNumber}. El dinero ha sido agregado a tu saldo.`,
        String(lottery._id),
        {
          prize: prize.amount,
          position: prize.position,
          lotteryName: lottery.name,
          ticketNumber: winningTicket.ticketNumber,
          winningNumber: winningNumber
        }
      );
    }
  }

  // Actualizar boletos que no ganaron
  const losingTickets = tickets.filter(
    ticket => !winners.some(w => String(w.ticketId) === String(ticket._id))
  );

  for (const ticket of losingTickets) {
    ticket.status = 'lost';
    ticket.matchedNumbers = 0;
    await ticket.save();
  }

  // Actualizar lotería con ganadores
  lottery.winners = winners;
  lottery.status = 'completed';
  await lottery.save();

  return lottery;
};

/**
 * Calcula la distribución de premios basada en el total recaudado
 */
export const calculatePrizeDistribution = (
  totalPrize: number,
  positions: { position: number; percentage: number }[]
): { position: number; percentage: number; amount: number }[] => {
  return positions.map(pos => ({
    position: pos.position,
    percentage: pos.percentage,
    amount: Math.floor((totalPrize * pos.percentage) / 100),
  }));
};
