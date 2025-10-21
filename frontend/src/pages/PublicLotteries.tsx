import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PublicLayout from '../components/PublicLayout';
import { lotteryAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar, DollarSign, Ticket as TicketIcon, Trophy, Lock } from 'lucide-react';

const PublicLotteries = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [lotteries, setLotteries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLotteries();
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

  const handleBuyClick = (lottery: any) => {
    if (!user) {
      toast.error('Debes iniciar sesión para comprar boletos');
      navigate('/login', { state: { from: '/', lotteryId: lottery._id } });
      return;
    }
    navigate('/lotteries');
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

  return (
    <PublicLayout>
      <div className="space-y-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-primary-500 to-primary-700 rounded-2xl shadow-lg p-8 md:p-12 text-white">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              ¡Tu suerte comienza aquí!
            </h1>
            <p className="text-xl text-primary-100 mb-6">
              Participa en nuestros sorteos transparentes y seguros. Verifica tus boletos en tiempo real y gana increíbles premios.
            </p>
            {!user && (
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => navigate('/register')}
                  className="px-6 py-3 bg-white text-primary-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                >
                  Registrarse Gratis
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="px-6 py-3 bg-primary-800 text-white rounded-lg font-semibold hover:bg-primary-900 transition-colors border-2 border-white"
                >
                  Iniciar Sesión
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Trophy className="text-primary-600" size={24} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">100% Seguro</h3>
            <p className="text-gray-600 mt-2">Sorteos verificables y transparentes</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <DollarSign className="text-green-600" size={24} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">Pago Automático</h3>
            <p className="text-gray-600 mt-2">Recibe tus premios al instante</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <TicketIcon className="text-blue-600" size={24} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">Fácil y Rápido</h3>
            <p className="text-gray-600 mt-2">Compra boletos en segundos</p>
          </div>
        </div>

        {/* Lotteries Section */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Sorteos Activos
          </h2>

          {lotteries.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {lotteries.map((lottery) => (
                <div
                  key={lottery._id}
                  className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow border-2 border-transparent hover:border-primary-200"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {lottery.name}
                      </h3>
                      <span className="inline-block mt-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                        {lottery.status === 'active' ? 'ACTIVO' : lottery.status.toUpperCase()}
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
                        <span className="font-semibold text-green-600 text-lg">
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

                    {/* Progress Bar */}
                    <div className="pt-2">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Vendidos</span>
                        <span>{Math.round((lottery.soldTickets / lottery.maxTickets) * 100)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary-600 h-2 rounded-full transition-all"
                          style={{
                            width: `${(lottery.soldTickets / lottery.maxTickets) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t">
                    <button
                      onClick={() => handleBuyClick(lottery)}
                      className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors flex items-center justify-center space-x-2"
                      disabled={lottery.soldTickets >= lottery.maxTickets}
                    >
                      {!user && <Lock size={20} />}
                      <span>
                        {lottery.soldTickets >= lottery.maxTickets
                          ? 'Agotado'
                          : user
                          ? 'Comprar Boleto'
                          : 'Iniciar Sesión para Comprar'}
                      </span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
              <TicketIcon className="mx-auto text-gray-400 mb-4" size={64} />
              <p className="text-gray-500 text-lg mb-4">
                No hay sorteos disponibles en este momento
              </p>
              <p className="text-gray-400">
                Vuelve pronto para participar en nuestros próximos sorteos
              </p>
            </div>
          )}
        </div>

        {/* Call to Action */}
        {!user && lotteries.length > 0 && (
          <div className="bg-primary-50 rounded-xl p-8 text-center border-2 border-primary-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              ¿Listo para ganar?
            </h3>
            <p className="text-gray-600 mb-6">
              Regístrate ahora y recibe un bono de bienvenida para tu primera compra
            </p>
            <button
              onClick={() => navigate('/register')}
              className="px-8 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors"
            >
              Crear Cuenta Gratis
            </button>
          </div>
        )}
      </div>
    </PublicLayout>
  );
};

export default PublicLotteries;
