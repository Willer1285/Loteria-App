import { useEffect, useState } from 'react';
import { X, Calendar, DollarSign, Ticket, Clock, Trophy, Users } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ticketAPI } from '../../services/api';

interface ManageLotteryModalProps {
  lottery: any;
  onClose: () => void;
  onSuccess: () => void;
}

// Countdown Timer Component
const CountdownTimer: React.FC<{ targetDate: Date }> = ({ targetDate }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(targetDate).getTime() - new Date().getTime();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div className="grid grid-cols-4 gap-2 text-center">
      <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg p-3">
        <div className="text-2xl font-bold text-white">{timeLeft.days}</div>
        <div className="text-xs text-white opacity-90">Días</div>
      </div>
      <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg p-3">
        <div className="text-2xl font-bold text-white">{timeLeft.hours}</div>
        <div className="text-xs text-white opacity-90">Horas</div>
      </div>
      <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg p-3">
        <div className="text-2xl font-bold text-white">{timeLeft.minutes}</div>
        <div className="text-xs text-white opacity-90">Min</div>
      </div>
      <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg p-3">
        <div className="text-2xl font-bold text-white">{timeLeft.seconds}</div>
        <div className="text-xs text-white opacity-90">Seg</div>
      </div>
    </div>
  );
};

const ManageLotteryModal: React.FC<ManageLotteryModalProps> = ({
  lottery,
  onClose,
}) => {
  const [soldTickets, setSoldTickets] = useState<any[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(false);

  useEffect(() => {
    loadTickets();
  }, [lottery._id]);

  const loadTickets = async () => {
    setLoadingTickets(true);
    try {
      // Try to get user tickets filtered by lottery
      const response = await ticketAPI.getUserTickets({ lotteryId: lottery._id });
      setSoldTickets(response.data.tickets || []);
    } catch (error) {
      // If endpoint doesn't support filtering, we'll just show counts
      setSoldTickets([]);
    } finally {
      setLoadingTickets(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string; label: string }> = {
      upcoming: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Próximamente' },
      active: { bg: 'bg-green-100', text: 'text-green-800', label: 'Activo' },
      drawing: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Sorteando' },
      pending_draw: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Sin Sortear' },
      completed: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Completado' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-800', label: 'Cancelado' },
    };
    const badge = badges[status] || badges.upcoming;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  const getSelectionTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      manual: 'Solo Selección Manual',
      random: 'Solo Selección Al Azar',
      both: 'Manual y Al Azar',
    };
    return types[type] || type;
  };

  const renderTicketBoard = () => {
    const tickets = [];
    const totalTickets = lottery.maxTickets;
    const min = lottery.numbersRange?.min || 0;
    const max = lottery.numbersRange?.max || totalTickets - 1;

    // Calculate padding based on max number (e.g., 999 = 3 digits, 9999 = 4 digits)
    const padding = max.toString().length;

    // Mostrar TODOS los números del sorteo
    for (let i = min; i <= max; i++) {
      const isSold = i < lottery.soldTickets; // Simplified - would need actual ticket data
      const ticketNumber = i.toString().padStart(padding, '0');

      tickets.push(
        <div
          key={i}
          className={`px-3 py-2 rounded-lg text-center font-mono text-sm font-semibold transition-all ${
            isSold
              ? 'bg-red-100 text-red-800 line-through opacity-60'
              : 'bg-green-100 text-green-800 hover:bg-green-200'
          }`}
          title={isSold ? 'Vendido' : 'Disponible'}
        >
          {ticketNumber}
        </div>
      );
    }

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Tablero de Boletos</h3>
          <span className="text-sm text-gray-600">
            Mostrando todos los {totalTickets} boletos
          </span>
        </div>
        <div className="grid grid-cols-8 gap-2 max-h-96 overflow-y-auto p-2 bg-gray-50 rounded-lg">
          {tickets}
        </div>
        <div className="flex items-center justify-center space-x-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-100 rounded"></div>
            <span className="text-gray-700">Disponible</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-100 rounded"></div>
            <span className="text-gray-700">Vendido</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-xl p-6 max-w-6xl w-full my-8 max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {lottery.name}
            </h2>
            <div className="flex items-center space-x-3">
              <p className="text-sm text-gray-600">
                Control: <span className="font-semibold">{lottery.controlNumber}</span>
              </p>
              {getStatusBadge(lottery.status)}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Image and Countdown */}
          <div className="space-y-6">
            {/* Lottery Image */}
            {lottery.image && (
              <div className="rounded-xl overflow-hidden shadow-lg">
                <img
                  src={lottery.image}
                  alt={lottery.name}
                  className="w-full h-64 object-cover"
                />
              </div>
            )}

            {/* Countdown Timer */}
            {lottery.status !== 'completed' && lottery.status !== 'cancelled' && (
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <Clock className="text-primary-600" size={20} />
                  <h3 className="font-semibold text-gray-900">Tiempo Restante</h3>
                </div>
                <CountdownTimer targetDate={new Date(lottery.drawDate)} />
              </div>
            )}

            {/* Quick Stats */}
            <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl p-4 min-w-0">
              <h3 className="font-semibold text-gray-900 mb-3 text-sm">Estadísticas</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2 min-w-0">
                  <span className="text-xs text-gray-700 flex-shrink-0">Vendidos</span>
                  <span className="font-bold text-primary-700 text-sm truncate">
                    {lottery.soldTickets}/{lottery.maxTickets}
                  </span>
                </div>
                <div className="w-full bg-white rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-primary-500 to-primary-600 h-3 rounded-full transition-all progress-bar-animated"
                    style={{
                      width: `${(lottery.soldTickets / lottery.maxTickets) * 100}%`,
                    }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs gap-2">
                  <span className="text-gray-600 flex-shrink-0">Progreso</span>
                  <span className="font-semibold text-primary-700">
                    {((lottery.soldTickets / lottery.maxTickets) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Lottery Information */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 mb-4 text-lg">
                Información del Sorteo
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="min-w-0">
                  <label className="text-sm text-gray-600 block">Lotería</label>
                  <p className="font-semibold text-gray-900 break-words">{lottery.lotteryName}</p>
                </div>

                <div className="min-w-0">
                  <label className="text-sm text-gray-600 block">Fecha del Sorteo</label>
                  <div className="flex items-start space-x-2">
                    <Calendar size={16} className="text-gray-400 mt-1 flex-shrink-0" />
                    <p className="font-semibold text-gray-900 text-sm break-words">
                      {format(new Date(lottery.drawDate), 'PPPp', { locale: es })}
                    </p>
                  </div>
                </div>

                <div className="min-w-0">
                  <label className="text-sm text-gray-600 block">Precio del Boleto</label>
                  <div className="flex items-center space-x-2">
                    <DollarSign size={16} className="text-green-600 flex-shrink-0" />
                    <p className="font-semibold text-green-600 text-base break-words">
                      ${(lottery.ticketPrice || 0).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="min-w-0">
                  <label className="text-sm text-gray-600 block">Cantidad de Boletos</label>
                  <div className="flex items-center space-x-2">
                    <Ticket size={16} className="text-gray-400 flex-shrink-0" />
                    <p className="font-semibold text-gray-900 break-words">
                      {(lottery.maxTickets || 0).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="min-w-0">
                  <label className="text-sm text-gray-600 block">Máx. por Jugador</label>
                  <div className="flex items-center space-x-2">
                    <Users size={16} className="text-gray-400 flex-shrink-0" />
                    <p className="font-semibold text-gray-900 break-words">
                      {lottery.maxTicketsPerPlayer === 0
                        ? 'Sin límite'
                        : lottery.maxTicketsPerPlayer}
                    </p>
                  </div>
                </div>

                <div className="min-w-0">
                  <label className="text-sm text-gray-600 block">Tipo de Selección</label>
                  <p className="font-semibold text-gray-900 text-sm break-words">
                    {getSelectionTypeLabel(lottery.selectionType)}
                  </p>
                </div>
              </div>

              {lottery.description && (
                <div className="mt-4 pt-4 border-t">
                  <label className="text-sm text-gray-600">Descripción</label>
                  <p className="text-gray-900 mt-1">{lottery.description}</p>
                </div>
              )}

              {lottery.selectionType !== 'manual' && lottery.randomButtons?.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <label className="text-sm text-gray-600 mb-2 block">
                    Botones de Selección Al Azar
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {lottery.randomButtons.map((num: number, idx: number) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-primary-100 text-primary-700 rounded-lg text-sm font-semibold"
                      >
                        {num} boletos
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Prizes */}
            {lottery.prizes && lottery.prizes.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Trophy className="text-yellow-600" size={20} />
                  <h3 className="font-semibold text-gray-900 text-lg">Premios</h3>
                </div>
                <div className="space-y-3">
                  {lottery.prizes.map((prize: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-yellow-500 text-white rounded-full flex items-center justify-center font-bold">
                            {prize.position}
                          </div>
                          <div>
                            <span className="font-semibold text-gray-900 block">{prize.name}</span>
                            {prize.type === 'physical' && (
                              <span className="text-xs text-gray-600 bg-purple-100 px-2 py-1 rounded">Premio Físico</span>
                            )}
                          </div>
                        </div>
                        <span className="font-bold text-green-600 text-lg">
                          ${(prize.amount || 0).toLocaleString()}
                        </span>
                      </div>
                      {prize.type === 'physical' && prize.description && (
                        <p className="text-sm text-gray-700 mt-2 ml-13">
                          {prize.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t flex items-center justify-between">
                  <span className="font-semibold text-gray-900">Total en Premios</span>
                  <span className="font-bold text-green-600 text-xl">
                    ${(lottery.totalPrize || 0).toLocaleString()}
                  </span>
                </div>
              </div>
            )}

            {/* Winning Numbers and Winners (if completed) */}
            {lottery.status === 'completed' && (
              <>
                {lottery.winningNumbers && lottery.winningNumbers.length > 0 && (
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
                    <h3 className="font-semibold text-gray-900 mb-4 text-lg">
                      Números Ganadores
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {lottery.winningNumbers.map((num: number, idx: number) => (
                        <div
                          key={idx}
                          className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl flex items-center justify-center font-bold text-xl shadow-lg"
                        >
                          {num}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {lottery.winners && lottery.winners.length > 0 && (
                  <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <h3 className="font-semibold text-gray-900 mb-4 text-lg">
                      Ganadores
                    </h3>
                    <div className="space-y-3">
                      {lottery.winners.map((winner: any, idx: number) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200"
                        >
                          <div>
                            <p className="font-semibold text-gray-900 text-lg">
                              {winner.position}° Lugar
                            </p>
                            {winner.userId && (
                              <p className="text-sm text-gray-600">
                                {winner.userId.firstName} {winner.userId.lastName}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-green-600 text-xl">
                              ${(winner.prize || 0).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Ticket Board */}
            {lottery.status !== 'cancelled' && (
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                {renderTicketBoard()}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t">
          <button
            onClick={onClose}
            className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManageLotteryModal;
