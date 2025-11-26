/**
 * Traduce el estado de un sorteo de inglés a español
 */
export const translateLotteryStatus = (status: string): string => {
  const statusMap: { [key: string]: string } = {
    'upcoming': 'Próximamente',
    'active': 'Activo',
    'drawing': 'Sorteando',
    'completed': 'Completado',
    'cancelled': 'Cancelado',
    'pending_draw': 'Sin Sortear',
  };

  return statusMap[status] || status;
};

/**
 * Traduce el estado de un ticket de inglés a español
 */
export const translateTicketStatus = (status: string): string => {
  const statusMap: { [key: string]: string } = {
    'active': 'Activo',
    'won': 'Ganador',
    'lost': 'Perdedor',
    'refunded': 'Reembolsado',
  };

  return statusMap[status] || status;
};

/**
 * Traduce el estado de un pago de inglés a español
 */
export const translatePaymentStatus = (status: string): string => {
  const statusMap: { [key: string]: string } = {
    'pending': 'Pendiente',
    'completed': 'Completado',
    'cancelled': 'Cancelado',
    'failed': 'Fallido',
  };

  return statusMap[status] || status;
};
