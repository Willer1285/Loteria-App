import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PublicLayout from '../components/PublicLayout';
import { lotteryAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { Calendar, DollarSign, Ticket as TicketIcon, Trophy, Lock, Clock, ArrowRight } from 'lucide-react';

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
      <div className="bg-white bg-opacity-90 rounded-lg p-2">
        <div className="text-2xl font-bold text-primary-600">{timeLeft.days}</div>
        <div className="text-xs text-gray-600">Días</div>
      </div>
      <div className="bg-white bg-opacity-90 rounded-lg p-2">
        <div className="text-2xl font-bold text-primary-600">{timeLeft.hours}</div>
        <div className="text-xs text-gray-600">Hrs</div>
      </div>
      <div className="bg-white bg-opacity-90 rounded-lg p-2">
        <div className="text-2xl font-bold text-primary-600">{timeLeft.minutes}</div>
        <div className="text-xs text-gray-600">Min</div>
      </div>
      <div className="bg-white bg-opacity-90 rounded-lg p-2">
        <div className="text-2xl font-bold text-primary-600">{timeLeft.seconds}</div>
        <div className="text-xs text-gray-600">Seg</div>
      </div>
    </div>
  );
};

const PublicLotteries = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [lotteries, setLotteries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  const handleViewLottery = (lotteryId: string) => {
    navigate(`/lottery/${lotteryId}`);
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
        <div className="bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 rounded-2xl shadow-2xl p-8 md:p-12 text-white relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-full h-full" style={{
              backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
              backgroundSize: '20px 20px'
            }}></div>
          </div>

          <div className="relative z-10 max-w-3xl">
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
                  className="px-6 py-3 bg-white text-primary-600 rounded-lg font-semibold hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Registrarse Gratis
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="px-6 py-3 bg-primary-800 text-white rounded-lg font-semibold hover:bg-primary-900 transition-all border-2 border-white"
                >
                  Iniciar Sesión
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-md p-6 text-center border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="text-primary-600" size={28} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">100% Seguro</h3>
            <p className="text-gray-600 mt-2">Sorteos verificables y transparentes</p>
          </div>

          <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-md p-6 text-center border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <DollarSign className="text-green-600" size={28} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">Pago Automático</h3>
            <p className="text-gray-600 mt-2">Recibe tus premios al instante</p>
          </div>

          <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-md p-6 text-center border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <TicketIcon className="text-blue-600" size={28} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">Fácil y Rápido</h3>
            <p className="text-gray-600 mt-2">Compra boletos en segundos</p>
          </div>
        </div>

        {/* Lotteries Section */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
            <Clock className="mr-3 text-primary-600" size={32} />
            Sorteos Activos
          </h2>

          {lotteries.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {lotteries.map((lottery) => {
                const remainingTickets = (lottery.maxTickets || 0) - (lottery.soldTickets || 0);
                const soldPercentage = (lottery.maxTickets || 0) > 0
                  ? ((lottery.soldTickets || 0) / (lottery.maxTickets || 0)) * 100
                  : 0;

                return (
                  <div
                    key={lottery._id}
                    className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-primary-300 transform hover:-translate-y-1"
                  >
                    {/* Image Section */}
                    {lottery.image ? (
                      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-primary-100 to-primary-200">
                        <img
                          src={lottery.image}
                          alt={lottery.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute top-3 right-3">
                          <span className="px-3 py-1 bg-green-500 text-white rounded-full text-xs font-bold shadow-lg">
                            ACTIVO
                          </span>
                        </div>
                        {/* Prize Overlay */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                          <div className="flex items-center space-x-2 text-white">
                            <Trophy size={20} />
                            <span className="font-bold text-lg">
                              ${(lottery.totalPrize || 0).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="relative h-48 bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                        <Trophy className="text-white/30" size={80} />
                        <div className="absolute top-3 right-3">
                          <span className="px-3 py-1 bg-green-500 text-white rounded-full text-xs font-bold shadow-lg">
                            ACTIVO
                          </span>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                          <div className="flex items-center space-x-2 text-white">
                            <Trophy size={20} />
                            <span className="font-bold text-lg">
                              ${(lottery.totalPrize || 0).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Content Section */}
                    <div className="p-6">
                      {/* Title */}
                      <h3 className="text-xl font-bold text-gray-900 mb-1 line-clamp-2">
                        {lottery.name}
                      </h3>
                      {lottery.lotteryName && (
                        <p className="text-sm text-primary-600 font-semibold mb-3">
                          {lottery.lotteryName}
                        </p>
                      )}

                      {/* Countdown Timer */}
                      <div className="mb-4 bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl p-3">
                        <p className="text-xs text-gray-700 font-semibold mb-2 flex items-center">
                          <Clock size={14} className="mr-1" />
                          Tiempo Restante
                        </p>
                        <CountdownTimer targetDate={new Date(lottery.drawDate)} />
                      </div>

                      {/* Description */}
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {lottery.description}
                      </p>

                      {/* Info Grid */}
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center space-x-1 text-xs text-gray-500 mb-1">
                            <DollarSign size={12} />
                            <span>Precio</span>
                          </div>
                          <p className="font-bold text-gray-900">
                            ${lottery.ticketPrice}
                          </p>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center space-x-1 text-xs text-gray-500 mb-1">
                            <TicketIcon size={12} />
                            <span>Disponibles</span>
                          </div>
                          <p className="font-bold text-gray-900">
                            {remainingTickets.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span>Vendidos</span>
                          <span className="font-semibold">{soldPercentage.toFixed(0)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div
                            className="bg-gradient-to-r from-primary-500 to-primary-600 h-2.5 rounded-full transition-all shadow-sm progress-bar-animated"
                            style={{ width: `${soldPercentage}%` }}
                          />
                        </div>
                      </div>

                      {/* Draw Date */}
                      <div className="flex items-center space-x-2 text-xs text-gray-500 mb-4 bg-gray-50 rounded-lg p-2">
                        <Calendar size={14} />
                        <span>
                          {new Date(lottery.drawDate).toLocaleDateString('es-ES', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>

                      {/* Action Button */}
                      <button
                        onClick={() => handleViewLottery(lottery._id)}
                        className={`w-full py-3 rounded-xl font-bold transition-all shadow-md hover:shadow-lg flex items-center justify-center space-x-2 ${
                          remainingTickets > 0
                            ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white hover:from-primary-700 hover:to-primary-800'
                            : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                        }`}
                        disabled={remainingTickets === 0}
                      >
                        {!user && remainingTickets > 0 && <Lock size={18} />}
                        <span>
                          {remainingTickets === 0
                            ? 'Agotado'
                            : user
                            ? 'Ver Sorteo'
                            : 'Iniciar Sesión'}
                        </span>
                        {remainingTickets > 0 && <ArrowRight size={18} />}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-md p-12 text-center border border-gray-200">
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
          <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl p-8 text-center border-2 border-primary-200 shadow-lg">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              ¿Listo para ganar?
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Regístrate ahora y comienza a participar en nuestros sorteos seguros y transparentes
            </p>
            <button
              onClick={() => navigate('/register')}
              className="px-8 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg font-semibold hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
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
