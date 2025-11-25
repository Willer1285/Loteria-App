import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { lotteryAPI, ticketAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar, DollarSign, Ticket as TicketIcon, Trophy } from 'lucide-react';

const Lotteries = () => {
  const { user, refreshProfile } = useAuth();
  const [lotteries, setLotteries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLottery, setSelectedLottery] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    loadLotteries();

    // Auto-actualizar cada 60 segundos (optimizado)
    const interval = setInterval(() => {
      loadLotteries();
    }, 60000); // 60 segundos

    return () => clearInterval(interval);
  }, []);

  const loadLotteries = async () => {
    try {
      const response = await lotteryAPI.getAll({ status: 'active' });
      setLotteries(response.data.lotteries);
    } catch (error) {
      toast.error('Error al cargar sorteos');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!selectedLottery) return;

    const totalCost = selectedLottery.ticketPrice * quantity;

    if (user!.balance < totalCost) {
      toast.error('Saldo insuficiente. Por favor, recarga tu cuenta.');
      return;
    }

    setPurchasing(true);

    try {
      await ticketAPI.purchase({
        lotteryId: selectedLottery._id,
        quantity,
      });

      toast.success(`${quantity} boleto(s) comprado(s) exitosamente`);
      setSelectedLottery(null);
      setQuantity(1);
      await refreshProfile();
      loadLotteries();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al comprar boleto');
    } finally {
      setPurchasing(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sorteos Disponibles</h1>
          <p className="text-gray-600 mt-1">
            Explora y compra boletos para los sorteos activos
          </p>
        </div>

        {lotteries.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {lotteries.map((lottery) => (
              <div
                key={lottery._id}
                className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                {/* Imagen del sorteo */}
                {lottery.image && (
                  <div className="mb-4 rounded-lg overflow-hidden">
                    <img
                      src={lottery.image}
                      alt={lottery.name}
                      className="w-full h-48 object-cover"
                    />
                  </div>
                )}

                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {lottery.name}
                    </h2>
                    <span className="inline-block mt-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                      {lottery.status}
                    </span>
                  </div>
                  <Trophy className="text-yellow-500" size={32} />
                </div>

                <p className="text-gray-600 mb-4">{lottery.description}</p>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-sm">
                    <Calendar className="text-gray-400" size={16} />
                    <span className="text-gray-600">
                      Sorteo: {format(new Date(lottery.drawDate), 'PPP p', { locale: es })}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 text-sm">
                    <DollarSign className="text-gray-400" size={16} />
                    <span className="text-gray-600">
                      Precio por boleto:{' '}
                      <span className="font-semibold text-gray-900">
                        ${lottery.ticketPrice}
                      </span>
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 text-sm">
                    <Trophy className="text-gray-400" size={16} />
                    <span className="text-gray-600">
                      Premio total:{' '}
                      <span className="font-semibold text-green-600">
                        ${lottery.totalPrize}
                      </span>
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 text-sm">
                    <TicketIcon className="text-gray-400" size={16} />
                    <span className="text-gray-600">
                      Disponibles: {lottery.maxTickets - lottery.soldTickets} de{' '}
                      {lottery.maxTickets}
                    </span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t">
                  <button
                    onClick={() => setSelectedLottery(lottery)}
                    className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
                    disabled={lottery.soldTickets >= lottery.maxTickets}
                  >
                    {lottery.soldTickets >= lottery.maxTickets
                      ? 'Agotado'
                      : 'Comprar Boleto'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <p className="text-gray-500 text-lg">
              No hay sorteos disponibles en este momento
            </p>
          </div>
        )}

        {/* Purchase Modal */}
        {selectedLottery && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Comprar Boleto
              </h3>

              <div className="space-y-4 mb-6">
                <div>
                  <p className="text-sm text-gray-600">Sorteo</p>
                  <p className="font-semibold text-gray-900">
                    {selectedLottery.name}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Precio por boleto</p>
                  <p className="font-semibold text-gray-900">
                    ${selectedLottery.ticketPrice}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cantidad
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div className="pt-4 border-t">
                  <p className="text-sm text-gray-600">Total a pagar</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${(selectedLottery.ticketPrice * quantity).toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Saldo disponible: ${user?.balance.toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setSelectedLottery(null);
                    setQuantity(1);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                  disabled={purchasing}
                >
                  Cancelar
                </button>
                <button
                  onClick={handlePurchase}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50"
                  disabled={purchasing}
                >
                  {purchasing ? 'Comprando...' : 'Confirmar Compra'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Lotteries;
