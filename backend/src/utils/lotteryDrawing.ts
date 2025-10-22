import Lottery, { ILottery } from '../models/Lottery';
import Ticket, { ITicket } from '../models/Ticket';
import User from '../models/User';
import Payment from '../models/Payment';
import { generateRandomNumbers, countMatchingNumbers } from './ticketGenerator';

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

  // Usar números manuales si se proporcionan, de lo contrario generar aleatoriamente
  const winningNumbers = manualWinningNumbers && manualWinningNumbers.length > 0
    ? manualWinningNumbers
    : generateRandomNumbers(
        lottery.numbersRange.min,
        lottery.numbersRange.max,
        lottery.numbersRange.count
      );

  lottery.winningNumbers = winningNumbers;
  lottery.status = 'drawing';
  await lottery.save();

  // Obtener todos los boletos de esta lotería
  const tickets = await Ticket.find({ lotteryId: lottery._id, status: 'active' });

  // Calcular coincidencias para cada boleto
  const ticketsWithMatches = tickets.map(ticket => ({
    ticket,
    matches: countMatchingNumbers(ticket.numbers, winningNumbers),
  }));

  // Ordenar por cantidad de coincidencias (de mayor a menor)
  ticketsWithMatches.sort((a, b) => b.matches - a.matches);

  const winners: ILottery['winners'] = [];

  // Asignar premios según la distribución
  for (const prizeConfig of lottery.prizeDistribution) {
    const winningTicket = ticketsWithMatches.find(
      t => t.matches >= lottery.numbersRange.count - (prizeConfig.position - 1) &&
      !winners.some(w => String(w.ticketId) === String(t.ticket._id))
    );

    if (winningTicket) {
      const prize = prizeConfig.amount;

      winners.push({
        userId: winningTicket.ticket.userId,
        ticketId: winningTicket.ticket._id as any,
        prize,
        position: prizeConfig.position,
      });

      // Actualizar el boleto
      winningTicket.ticket.status = 'won';
      winningTicket.ticket.matchedNumbers = winningTicket.matches;
      winningTicket.ticket.prize = prize;
      await winningTicket.ticket.save();

      // Actualizar el balance del usuario
      await User.findByIdAndUpdate(
        winningTicket.ticket.userId,
        {
          $inc: {
            balance: prize,
            totalWon: prize
          }
        }
      );

      // Crear registro de pago
      await Payment.create({
        userId: winningTicket.ticket.userId,
        amount: prize,
        type: 'prize_payout',
        status: 'completed',
        method: 'wallet',
        ticketId: winningTicket.ticket._id,
        lotteryId: lottery._id,
        description: `Premio por lotería ${lottery.name} - Posición ${prizeConfig.position}`,
        processedAt: new Date(),
      });
    }
  }

  // Actualizar boletos que no ganaron
  const losingTickets = tickets.filter(
    ticket => !winners.some(w => String(w.ticketId) === String(ticket._id))
  );

  for (const ticket of losingTickets) {
    const matches = countMatchingNumbers(ticket.numbers, winningNumbers);
    ticket.status = 'lost';
    ticket.matchedNumbers = matches;
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
