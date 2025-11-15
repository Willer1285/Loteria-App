import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { lotteryAPI, ticketAPI, rankingAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Ticket, Trophy, DollarSign, TrendingUp, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [lotteries, setLotteries] = useState<any[]>([]);
  const [myTickets, setMyTickets] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const isPlayer = user?.role === 'jugador';

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Para jugadores, cargar sus datos
      if (isPlayer) {
        const [lotteriesRes, ticketsRes, statsRes] = await Promise.all([
          lotteryAPI.getAll({ status: 'active', limit: 5 }),
          ticketAPI.getUserTickets({ limit: 5 }),
          rankingAPI.getStats(),
        ]);

        setLotteries(lotteriesRes.data.lotteries);
        setMyTickets(ticketsRes.data.tickets);
        setStats(statsRes.data.stats);
      } else {
        // Para admin/gerente, solo cargar sorteos activos
        const lotteriesRes = await lotteryAPI.getAll({ status: 'active', limit: 5 });
        setLotteries(lotteriesRes.data.lotteries);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
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
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Bienvenido, {user?.firstName}
          </h1>
          <p className="text-gray-600 mt-1">
            {isPlayer ? 'Aquí está un resumen de tu actividad' : 'Panel de administración'}
          </p>
        </div>

        {/* Stats Cards - Solo para jugadores */}
        {isPlayer && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Boletos Comprados</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {user?.ticketsPurchased || 0}
                </p>
              </div>
              <Ticket className="text-primary-600" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Gastado</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  ${user?.totalSpent?.toFixed(2) || '0.00'}
                </p>
              </div>
              <DollarSign className="text-red-600" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Ganado</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  ${user?.totalWon?.toFixed(2) || '0.00'}
                </p>
              </div>
              <Trophy className="text-yellow-600" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Beneficio Neto</p>
                <p className={`text-2xl font-bold mt-1 ${
                  (user?.totalWon || 0) - (user?.totalSpent || 0) >= 0
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}>
                  ${((user?.totalWon || 0) - (user?.totalSpent || 0)).toFixed(2)}
                </p>
              </div>
              <TrendingUp className="text-green-600" size={32} />
            </div>
          </div>
          </div>
        )}

        {/* Active Lotteries */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Sorteos Activos
          </h2>
          {lotteries.length > 0 ? (
            <div className="space-y-4">
              {lotteries.map((lottery) => {
                const soldPercentage = (lottery.soldTickets / lottery.maxTickets) * 100;
                return (
                  <div
                    key={lottery._id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">
                          {lottery.name}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {lottery.description}
                        </p>
                        <div className="flex items-center space-x-4 mt-2 text-sm">
                          <span className="text-gray-600">
                            Precio: <span className="font-semibold">${lottery.ticketPrice}</span>
                          </span>
                          <span className="text-gray-600">
                            Premio: <span className="font-semibold text-green-600">
                              ${lottery.totalPrize}
                            </span>
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                          {lottery.status}
                        </span>
                        <p className="text-sm text-gray-600 mt-2">
                          Sorteo: {format(new Date(lottery.drawDate), 'PPP', { locale: es })}
                        </p>
                      </div>
                    </div>

                    {/* Barra de progreso animada */}
                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Vendidos: {lottery.soldTickets}/{lottery.maxTickets}</span>
                        <span>{soldPercentage.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-gradient-to-r from-primary-500 to-primary-600 h-2.5 rounded-full transition-all progress-bar-animated"
                          style={{ width: `${soldPercentage}%` }}
                        />
                      </div>
                    </div>

                    {/* Botón Ver Sorteo - Solo para jugadores */}
                    {isPlayer && (
                      <button
                        onClick={() => navigate(`/lottery/${lottery._id}`)}
                        className="w-full mt-2 flex items-center justify-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors"
                      >
                        <Eye size={18} />
                        <span>Ver Sorteo</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              No hay sorteos activos en este momento
            </p>
          )}
        </div>

        {/* My Recent Tickets - Solo para jugadores */}
        {isPlayer && (
          <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Mis Boletos Recientes
          </h2>
          {myTickets.length > 0 ? (
            <div className="space-y-3">
              {myTickets.map((ticket) => (
                <div
                  key={ticket._id}
                  className="border border-gray-200 rounded-lg p-3 flex justify-between items-center"
                >
                  <div>
                    <p className="font-semibold text-gray-900">
                      {ticket.ticketNumber}
                    </p>
                    <p className="text-sm text-gray-600">
                      Números: {ticket.numbers.join(', ')}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    ticket.status === 'won'
                      ? 'bg-green-100 text-green-800'
                      : ticket.status === 'lost'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {ticket.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              No has comprado boletos aún
            </p>
          )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;
