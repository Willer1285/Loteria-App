import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { lotteryAPI, ticketAPI, rankingAPI, paymentAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Ticket, Trophy, DollarSign, TrendingUp, Eye, User as UserIcon, ArrowDownCircle, ArrowUpCircle, ShoppingCart } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [lotteries, setLotteries] = useState<any[]>([]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
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
        const [lotteriesRes, ticketsRes, paymentsRes, statsRes] = await Promise.all([
          lotteryAPI.getAll({ status: 'active', limit: 5 }),
          ticketAPI.getUserTickets({ limit: 50 }), // Aumentar límite para obtener más tickets
          paymentAPI.getHistory({ limit: 50 }), // Aumentar límite para obtener más pagos
          rankingAPI.getStats(),
        ]);

        setLotteries(lotteriesRes.data.lotteries || []);
        setStats(statsRes.data.stats);

        // Combinar compras, depósitos y retiros en actividades recientes
        const tickets = ticketsRes.data.tickets || [];
        const payments = paymentsRes.data.payments || [];

        console.log('=== DATOS DEL BACKEND ===');
        console.log('Total de tickets:', tickets.length);
        console.log('Total de pagos:', payments.length);
        console.log('Tickets completos:', tickets);
        console.log('Pagos completos:', payments);

        // Convertir tickets a actividades (agrupar por compra usando purchaseDate exacto)
        const purchasesMap = new Map<string, any>();
        tickets.forEach((ticket: any, index: number) => {
          if (!ticket.lotteryId) {
            console.warn(`⚠️ Ticket #${index} sin lotteryId:`, ticket);
            return;
          }

          // Usar purchaseDate sin modificar para agrupar correctamente
          const purchaseKey = `${ticket.lotteryId._id}_${ticket.purchaseDate}`;

          if (purchasesMap.has(purchaseKey)) {
            const purchase = purchasesMap.get(purchaseKey)!;
            purchase.quantity += 1;
            purchase.totalAmount += ticket.price;
            purchase.tickets.push(ticket);
          } else {
            purchasesMap.set(purchaseKey, {
              type: 'purchase',
              lotteryName: ticket.lotteryId.name || 'Sorteo sin nombre',
              quantity: 1,
              totalAmount: ticket.price,
              createdAt: ticket.purchaseDate,
              tickets: [ticket],
            });
          }
        });

        const purchases = Array.from(purchasesMap.values());
        console.log('=== COMPRAS AGRUPADAS ===');
        console.log('Total de compras:', purchases.length);
        purchases.forEach((p, i) => {
          console.log(`Compra ${i + 1}: ${p.lotteryName}, ${p.quantity} tickets, $${p.totalAmount}, fecha: ${p.createdAt}`);
        });

        // Convertir pagos a actividades (solo depositos y retiros)
        const paymentsActivities = payments
          .filter((p: any) => p.type === 'deposit' || p.type === 'withdrawal')
          .map((payment: any) => ({
            type: payment.type,
            amount: payment.amount,
            status: payment.status,
            createdAt: payment.createdAt,
          }));

        console.log('=== PAGOS FILTRADOS ===');
        console.log('Depósitos/Retiros:', paymentsActivities.length);
        paymentsActivities.forEach((p, i) => {
          console.log(`${i + 1}. ${p.type}: $${p.amount}, estado: ${p.status}, fecha: ${p.createdAt}`);
        });

        // Combinar y ordenar por fecha
        const allActivities = [...purchases, ...paymentsActivities]
          .sort((a, b) => {
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();
            return dateB - dateA; // Más recientes primero
          })
          .slice(0, 10);

        console.log('=== ACTIVIDADES FINALES (10 MÁS RECIENTES) ===');
        allActivities.forEach((act, i) => {
          if (act.type === 'purchase') {
            console.log(`${i + 1}. COMPRA: ${act.lotteryName}, ${act.quantity} tickets, $${act.totalAmount}, ${act.createdAt}`);
          } else {
            console.log(`${i + 1}. ${act.type.toUpperCase()}: $${act.amount}, ${act.status}, ${act.createdAt}`);
          }
        });

        setRecentActivities(allActivities);
      } else {
        // Para admin/gerente, solo cargar sorteos activos
        const lotteriesRes = await lotteryAPI.getAll({ status: 'active', limit: 5 });
        setLotteries(lotteriesRes.data.lotteries || []);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Error al cargar datos del dashboard');
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
        <div className="flex items-center space-x-4">
          {/* Avatar del usuario */}
          <div className="w-16 h-16 rounded-full flex items-center justify-center overflow-hidden bg-primary-100">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={`${user.firstName} ${user.lastName}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <UserIcon className="text-primary-600" size={32} />
            )}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Bienvenido, {user?.firstName}
            </h1>
            <p className="text-gray-600 mt-1">
              {isPlayer ? 'Aquí está un resumen de tu actividad' : 'Panel de administración'}
            </p>
          </div>
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

        {/* Recent Activities - Solo para jugadores */}
        {isPlayer && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Actividades Recientes
            </h2>
            {recentActivities.length > 0 ? (
              <div className="space-y-3">
                {recentActivities.map((activity, index) => {
                  const Icon = activity.type === 'purchase'
                    ? ShoppingCart
                    : activity.type === 'deposit'
                    ? ArrowDownCircle
                    : ArrowUpCircle;

                  const iconColor = activity.type === 'purchase'
                    ? 'text-blue-600'
                    : activity.type === 'deposit'
                    ? 'text-green-600'
                    : 'text-red-600';

                  const bgColor = activity.type === 'purchase'
                    ? 'bg-blue-50'
                    : activity.type === 'deposit'
                    ? 'bg-green-50'
                    : 'bg-red-50';

                  return (
                    <div
                      key={`${activity.type}-${index}`}
                      className="border border-gray-200 rounded-lg p-3 flex items-center space-x-3"
                    >
                      <div className={`p-2 rounded-lg ${bgColor}`}>
                        <Icon className={iconColor} size={20} />
                      </div>
                      <div className="flex-1">
                        {activity.type === 'purchase' ? (
                          <>
                            <p className="font-semibold text-gray-900">
                              Compra de boletos
                            </p>
                            <p className="text-sm text-gray-600">
                              {activity.lotteryName} - {activity.quantity} boleto{activity.quantity > 1 ? 's' : ''}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {format(new Date(activity.createdAt), 'PPp', { locale: es })}
                            </p>
                          </>
                        ) : (
                          <>
                            <p className="font-semibold text-gray-900">
                              {activity.type === 'deposit' ? 'Depósito' : 'Retiro'}
                            </p>
                            <p className="text-sm text-gray-600">
                              ${activity.amount.toFixed(2)}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {format(new Date(activity.createdAt), 'PPp', { locale: es })}
                            </p>
                          </>
                        )}
                      </div>
                      <div>
                        {activity.type === 'purchase' ? (
                          <span className="text-sm font-semibold text-gray-900">
                            ${activity.totalAmount.toFixed(2)}
                          </span>
                        ) : (
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            activity.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : activity.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {activity.status === 'completed'
                              ? 'Completado'
                              : activity.status === 'pending'
                              ? 'Pendiente'
                              : 'Cancelado'}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                No tienes actividades recientes
              </p>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;
