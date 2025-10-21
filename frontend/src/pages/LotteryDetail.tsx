import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PublicLayout from '../components/PublicLayout';
import { lotteryAPI, ticketAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import {
  Calendar,
  DollarSign,
  Trophy,
  Ticket,
  ShoppingCart,
  Shuffle,
  Info,
  Clock,
  Users,
  Zap,
} from 'lucide-react';

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
    <div className="grid grid-cols-4 gap-3 text-center">
      <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg p-4">
        <div className="text-3xl font-bold text-white">{timeLeft.days}</div>
        <div className="text-xs text-white opacity-90 mt-1">Días</div>
      </div>
      <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg p-4">
        <div className="text-3xl font-bold text-white">{timeLeft.hours}</div>
        <div className="text-xs text-white opacity-90 mt-1">Horas</div>
      </div>
      <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg p-4">
        <div className="text-3xl font-bold text-white">{timeLeft.minutes}</div>
        <div className="text-xs text-white opacity-90 mt-1">Min</div>
      </div>
      <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg p-4">
        <div className="text-3xl font-bold text-white">{timeLeft.seconds}</div>
        <div className="text-xs text-white opacity-90 mt-1">Seg</div>
      </div>
    </div>
  );
};

const LotteryDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [lottery, setLottery] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [manualSelection, setManualSelection] = useState(false);

  useEffect(() => {
    if (id) {
      loadLottery();
    }
  }, [id]);

  useEffect(() => {
    if (lottery) {
      // Set default selection mode based on lottery configuration
      if (lottery.selectionType === 'manual') {
        setManualSelection(true);
      } else if (lottery.selectionType === 'random') {
        setManualSelection(false);
      }
    }
  }, [lottery]);

  const loadLottery = async () => {
    try {
      const response = await lotteryAPI.getById(id!);
      setLottery(response.data.lottery);
    } catch (error) {
      toast.error('Error al cargar sorteo');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const generateRandomNumbers = () => {
    if (!lottery) return;

    const { min, max, count } = lottery.numbersRange;
    const numbers: number[] = [];

    while (numbers.length < count) {
      const num = Math.floor(Math.random() * (max - min + 1)) + min;
      if (!numbers.includes(num)) {
        numbers.push(num);
      }
    }

    setSelectedNumbers(numbers.sort((a, b) => a - b));
  };

  const toggleNumber = (num: number) => {
    if (!manualSelection) return;

    if (selectedNumbers.includes(num)) {
      setSelectedNumbers(selectedNumbers.filter((n) => n !== num));
    } else {
      if (selectedNumbers.length < lottery.numbersRange.count) {
        setSelectedNumbers([...selectedNumbers, num].sort((a, b) => a - b));
      } else {
        toast.error(
          `Solo puedes seleccionar ${lottery.numbersRange.count} números`
        );
      }
    }
  };

  const handleQuickSelect = (qty: number) => {
    const maxAllowed = getMaxAllowedQuantity();
    const actualQty = Math.min(qty, maxAllowed);
    setQuantity(actualQty);
  };

  const getMaxAllowedQuantity = () => {
    const remainingTickets = lottery.maxTickets - lottery.soldTickets;
    if (lottery.maxTicketsPerPlayer === 0) {
      return remainingTickets;
    }
    return Math.min(remainingTickets, lottery.maxTicketsPerPlayer);
  };

  const handlePurchase = async () => {
    if (!user) {
      toast.error('Debes iniciar sesión para comprar boletos');
      navigate('/login');
      return;
    }

    if (manualSelection && selectedNumbers.length !== lottery.numbersRange.count) {
      toast.error(`Debes seleccionar exactamente ${lottery.numbersRange.count} números`);
      return;
    }

    const maxAllowed = getMaxAllowedQuantity();
    if (quantity > maxAllowed) {
      toast.error(`Solo puedes comprar hasta ${maxAllowed} boletos`);
      return;
    }

    setPurchasing(true);

    try {
      const purchaseData: any = {
        lotteryId: lottery._id,
        quantity,
      };

      if (manualSelection) {
        purchaseData.numbers = selectedNumbers;
      }

      await ticketAPI.purchase(purchaseData);
      toast.success('¡Boletos comprados exitosamente!');
      navigate('/my-tickets');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al comprar boletos');
    } finally {
      setPurchasing(false);
    }
  };

  if (loading) {
    return (
      <PublicLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </PublicLayout>
    );
  }

  if (!lottery) {
    return null;
  }

  const totalCost = lottery.ticketPrice * quantity;
  const remainingTickets = lottery.maxTickets - lottery.soldTickets;
  const isActive = lottery.status === 'active';
  const maxAllowed = getMaxAllowedQuantity();

  // Determine selection mode based on lottery configuration
  const showManualSelection = lottery.selectionType === 'manual' || lottery.selectionType === 'both';
  const showRandomSelection = lottery.selectionType === 'random' || lottery.selectionType === 'both';
  const canToggleSelection = lottery.selectionType === 'both';

  return (
    <PublicLayout>
      <div className="space-y-8">
        {/* Lottery Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-2xl shadow-xl p-8 text-white">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h1 className="text-4xl font-bold mb-2">{lottery.name}</h1>
              {lottery.lotteryName && (
                <p className="text-primary-100 text-xl mb-4">{lottery.lotteryName}</p>
              )}
              <p className="text-primary-100 text-lg mb-6">
                {lottery.description}
              </p>

              {lottery.controlNumber && (
                <div className="inline-block px-4 py-2 bg-white bg-opacity-20 rounded-lg mb-4">
                  <p className="text-sm">Número de Control</p>
                  <p className="font-bold text-xl">{lottery.controlNumber}</p>
                </div>
              )}
            </div>

            {lottery.image && (
              <div className="flex items-center justify-center">
                <img
                  src={lottery.image}
                  alt={lottery.name}
                  className="rounded-xl shadow-2xl max-h-64 object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Countdown Timer */}
        {isActive && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Clock className="text-primary-600" size={24} />
              <h2 className="text-2xl font-bold text-gray-900">Tiempo Restante</h2>
            </div>
            <CountdownTimer targetDate={new Date(lottery.drawDate)} />
          </div>
        )}

        {/* Lottery Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center space-x-3 mb-2">
              <Trophy className="text-yellow-500" size={24} />
              <p className="text-sm text-gray-600">Premio Total</p>
            </div>
            <p className="text-3xl font-bold text-green-600">
              ${lottery.totalPrize.toLocaleString()}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center space-x-3 mb-2">
              <DollarSign className="text-green-500" size={24} />
              <p className="text-sm text-gray-600">Precio por Boleto</p>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              ${lottery.ticketPrice}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center space-x-3 mb-2">
              <Ticket className="text-blue-500" size={24} />
              <p className="text-sm text-gray-600">Boletos Disponibles</p>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {remainingTickets}
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div
                className="bg-primary-600 h-2 rounded-full transition-all"
                style={{
                  width: `${(lottery.soldTickets / lottery.maxTickets) * 100}%`,
                }}
              />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center space-x-3 mb-2">
              <Calendar className="text-primary-500" size={24} />
              <p className="text-sm text-gray-600">Fecha del Sorteo</p>
            </div>
            <p className="text-xl font-bold text-gray-900">
              {new Date(lottery.drawDate).toLocaleDateString()}
            </p>
            <p className="text-sm text-gray-600">
              {new Date(lottery.drawDate).toLocaleTimeString()}
            </p>
          </div>

          {lottery.maxTicketsPerPlayer > 0 && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center space-x-3 mb-2">
                <Users className="text-purple-500" size={24} />
                <p className="text-sm text-gray-600">Máximo por Jugador</p>
              </div>
              <p className="text-3xl font-bold text-gray-900">
                {lottery.maxTicketsPerPlayer}
              </p>
              <p className="text-sm text-gray-600 mt-1">boletos</p>
            </div>
          )}
        </div>

        {/* Prizes */}
        {lottery.prizes && lottery.prizes.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Trophy className="text-yellow-600" size={24} />
              <h2 className="text-2xl font-bold text-gray-900">Premios</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {lottery.prizes.map((prize: any, idx: number) => (
                <div
                  key={idx}
                  className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-lg p-6 text-center"
                >
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-yellow-500 text-white rounded-full font-bold text-lg mb-3">
                    {prize.position}
                  </div>
                  <p className="text-lg font-semibold text-gray-900 mb-2">
                    {prize.name}
                  </p>
                  <p className="text-3xl font-bold text-green-600">
                    ${prize.amount.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Purchase Section */}
        {isActive && remainingTickets > 0 ? (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Comprar Boletos
            </h2>

            {/* Selection Mode Toggle (only if 'both') */}
            {canToggleSelection && (
              <div className="mb-6">
                <label className="flex items-center space-x-3 mb-4">
                  <input
                    type="checkbox"
                    checked={manualSelection}
                    onChange={(e) => {
                      setManualSelection(e.target.checked);
                      setSelectedNumbers([]);
                    }}
                    className="w-5 h-5 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
                  />
                  <span className="text-gray-900 font-medium">
                    Seleccionar números manualmente
                  </span>
                </label>
              </div>
            )}

            {/* Info Banner */}
            {showRandomSelection && !manualSelection && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-start space-x-3">
                  <Info className="text-blue-600 flex-shrink-0" size={20} />
                  <p className="text-sm text-blue-800">
                    Los números serán seleccionados aleatoriamente al momento de la compra.
                    Selecciona la cantidad de boletos que deseas comprar.
                  </p>
                </div>
              </div>
            )}

            {/* Manual Number Selection */}
            {showManualSelection && manualSelection && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-gray-700 font-medium">
                    Selecciona {lottery.numbersRange.count} números (
                    {lottery.numbersRange.min} - {lottery.numbersRange.max})
                  </p>
                  <button
                    onClick={generateRandomNumbers}
                    className="flex items-center space-x-2 px-4 py-2 bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 transition-colors"
                  >
                    <Shuffle size={18} />
                    <span>Aleatorio</span>
                  </button>
                </div>

                {/* Ticket Number Grid */}
                <div className="grid grid-cols-8 md:grid-cols-12 lg:grid-cols-16 gap-2 mb-4 max-h-96 overflow-y-auto p-2 bg-gray-50 rounded-lg">
                  {Array.from(
                    {
                      length:
                        lottery.numbersRange.max - lottery.numbersRange.min + 1,
                    },
                    (_, i) => i + lottery.numbersRange.min
                  ).map((num) => {
                    const padding = Math.max(4, lottery.numbersRange.max.toString().length);
                    const ticketNumber = num.toString().padStart(padding, '0');
                    return (
                      <button
                        key={num}
                        onClick={() => toggleNumber(num)}
                        className={`px-2 py-2 rounded-lg font-mono font-bold text-sm transition-all ${
                          selectedNumbers.includes(num)
                            ? 'bg-primary-600 text-white shadow-lg scale-105'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {ticketNumber}
                      </button>
                    );
                  })}
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-2">
                    Números seleccionados ({selectedNumbers.length}/
                    {lottery.numbersRange.count}):
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedNumbers.length > 0 ? (
                      selectedNumbers.map((num) => (
                        <span
                          key={num}
                          className="px-3 py-1 bg-primary-600 text-white rounded-full font-bold"
                        >
                          {num.toString().padStart(4, '0')}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-500">Ninguno</span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Quantity Selection with Quick Buttons */}
            {!manualSelection && (
              <div className="mb-6">
                {/* Quick Select Buttons */}
                {lottery.randomButtons && lottery.randomButtons.length > 0 && (
                  <div className="mb-4">
                    <label className="block text-gray-700 font-medium mb-3">
                      Selección Rápida
                    </label>
                    <div className="flex flex-wrap gap-3">
                      {lottery.randomButtons.map((qty: number) => (
                        <button
                          key={qty}
                          onClick={() => handleQuickSelect(qty)}
                          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-primary-100 to-primary-200 text-primary-700 rounded-lg hover:from-primary-200 hover:to-primary-300 transition-all font-bold shadow-md hover:shadow-lg"
                        >
                          <Zap size={20} />
                          <span>{qty} boletos</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <label className="block text-gray-700 font-medium mb-2">
                  Cantidad de Boletos
                </label>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-bold text-xl"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) =>
                      setQuantity(
                        Math.max(1, Math.min(maxAllowed, parseInt(e.target.value) || 1))
                      )
                    }
                    className="w-24 px-4 py-2 border border-gray-300 rounded-lg text-center font-bold text-xl"
                    min="1"
                    max={maxAllowed}
                  />
                  <button
                    onClick={() =>
                      setQuantity(Math.min(maxAllowed, quantity + 1))
                    }
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-bold text-xl"
                  >
                    +
                  </button>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Máximo: {maxAllowed} boletos
                  {lottery.maxTicketsPerPlayer > 0 && ` (límite por jugador: ${lottery.maxTicketsPerPlayer})`}
                </p>
              </div>
            )}

            {/* Total and Purchase */}
            <div className="border-t pt-6">
              <div className="flex items-center justify-between mb-6">
                <span className="text-xl text-gray-700">Total a Pagar:</span>
                <span className="text-4xl font-bold text-green-600">
                  ${totalCost.toFixed(2)}
                </span>
              </div>

              <button
                onClick={handlePurchase}
                disabled={
                  purchasing ||
                  (manualSelection &&
                    selectedNumbers.length !== lottery.numbersRange.count)
                }
                className="w-full flex items-center justify-center space-x-3 px-6 py-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-bold text-lg hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCart size={24} />
                <span>
                  {purchasing ? 'Procesando...' : 'Comprar Boletos'}
                </span>
              </button>

              {!user && (
                <p className="text-center text-sm text-gray-600 mt-4">
                  ¿No tienes cuenta?{' '}
                  <button
                    onClick={() => navigate('/register')}
                    className="text-primary-600 hover:text-primary-700 font-semibold"
                  >
                    Regístrate aquí
                  </button>
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-8 text-center">
            <p className="text-xl font-semibold text-yellow-800">
              {lottery.status === 'completed'
                ? 'Este sorteo ya ha finalizado'
                : lottery.status === 'cancelled'
                ? 'Este sorteo ha sido cancelado'
                : 'No hay boletos disponibles'}
            </p>
          </div>
        )}
      </div>
    </PublicLayout>
  );
};

export default LotteryDetail;
