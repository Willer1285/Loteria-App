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
} from 'lucide-react';

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

  return (
    <PublicLayout>
      <div className="space-y-8">
        {/* Lottery Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-2xl shadow-xl p-8 text-white">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h1 className="text-4xl font-bold mb-4">{lottery.name}</h1>
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
                  className="rounded-xl shadow-2xl max-h-64 object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Lottery Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
        </div>

        {/* Prize Distribution */}
        {lottery.prizeDistribution && lottery.prizeDistribution.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Distribución de Premios
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {lottery.prizeDistribution.map((prize: any, idx: number) => (
                <div
                  key={idx}
                  className="border-2 border-primary-200 rounded-lg p-4 text-center bg-gradient-to-br from-primary-50 to-white"
                >
                  <p className="text-lg font-semibold text-gray-700">
                    {idx === 0 && '🥇 '}{idx === 1 && '🥈 '}{idx === 2 && '🥉 '}
                    Posición {prize.position}
                  </p>
                  <p className="text-3xl font-bold text-green-600 mt-2">
                    ${prize.amount?.toLocaleString() || 'TBD'}
                  </p>
                  <p className="text-sm text-gray-600">{prize.percentage}%</p>
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

            {/* Selection Mode */}
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

              {!manualSelection && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Info className="text-blue-600 flex-shrink-0" size={20} />
                    <p className="text-sm text-blue-800">
                      Los números serán seleccionados aleatoriamente al momento de la compra.
                      Selecciona la cantidad de boletos que deseas comprar.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Manual Number Selection */}
            {manualSelection && (
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

                <div className="grid grid-cols-8 md:grid-cols-12 gap-2 mb-4">
                  {Array.from(
                    {
                      length:
                        lottery.numbersRange.max - lottery.numbersRange.min + 1,
                    },
                    (_, i) => i + lottery.numbersRange.min
                  ).map((num) => (
                    <button
                      key={num}
                      onClick={() => toggleNumber(num)}
                      className={`aspect-square rounded-lg font-bold transition-all ${
                        selectedNumbers.includes(num)
                          ? 'bg-primary-600 text-white shadow-lg scale-110'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
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
                          {num}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-500">Ninguno</span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Quantity Selection */}
            <div className="mb-6">
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
                      Math.max(1, Math.min(remainingTickets, parseInt(e.target.value) || 1))
                    )
                  }
                  className="w-24 px-4 py-2 border border-gray-300 rounded-lg text-center font-bold text-xl"
                  min="1"
                  max={remainingTickets}
                />
                <button
                  onClick={() =>
                    setQuantity(Math.min(remainingTickets, quantity + 1))
                  }
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-bold text-xl"
                >
                  +
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Máximo: {remainingTickets} boletos disponibles
              </p>
            </div>

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
