import { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { lotteryAPI, userAPI, rankingAPI, ticketAPI, paymentAPI } from '../../services/api';
import toast from 'react-hot-toast';
import {
  Users,
  Ticket,
  DollarSign,
  TrendingUp,
  Trophy,
  Activity,
  Calendar,
  ShoppingCart,
  Wallet,
  CreditCard,
  Award,
  UserPlus,
} from 'lucide-react';

const AdminDashboard = () => {
  const [metrics, setMetrics] = useState<any>(null);
  const [recentActivities, setRecentActivities] = useState<any>({
    availableLotteries: [],
    completedLotteries: [],
    recentWinners: [],
    recentUsers: [],
    recentTickets: [],
    recentDeposits: [],
    recentWithdrawals: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Calcular fecha de hace 30 días
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Cargar métricas permanentes
      const statsRes = await rankingAPI.getStats();

      // Cargar todas las actividades
      const [
        allLotteriesRes,
        allUsersRes,
        allTicketsRes,
        allPaymentsRes,
      ] = await Promise.all([
        lotteryAPI.getAll({ limit: 100 }),
        userAPI.getAll({ limit: 100 }),
        ticketAPI.getUserTickets({ limit: 100 }),
        paymentAPI.getAll({ limit: 100 }),
      ]);

      const allLotteries = allLotteriesRes.data.lotteries || [];
      const allUsers = allUsersRes.data.users || [];
      const allTickets = allTicketsRes.data.tickets || [];
      const allPayments = allPaymentsRes.data.payments || [];

      // Filtrar actividades recientes (últimos 30 días)
      const availableLotteries = allLotteries.filter(
        (l: any) => l.status === 'active'
      );

      const completedLotteries = allLotteries.filter(
        (l: any) =>
          l.status === 'completed' &&
          new Date(l.updatedAt) >= thirtyDaysAgo
      );

      const recentUsers = allUsers.filter(
        (u: any) => new Date(u.createdAt) >= thirtyDaysAgo
      );

      const recentTickets = allTickets.filter(
        (t: any) => new Date(t.purchaseDate) >= thirtyDaysAgo
      );

      const recentDeposits = allPayments.filter(
        (p: any) =>
          p.type === 'deposit' &&
          new Date(p.createdAt) >= thirtyDaysAgo
      );

      const recentWithdrawals = allPayments.filter(
        (p: any) =>
          p.type === 'withdrawal' &&
          new Date(p.createdAt) >= thirtyDaysAgo
      );

      // Obtener ganadores recientes de sorteos completados
      const recentWinners: any[] = [];
      completedLotteries.forEach((lottery: any) => {
        if (lottery.winners && lottery.winners.length > 0) {
          lottery.winners.forEach((winner: any) => {
            recentWinners.push({
              ...winner,
              lotteryName: lottery.name,
              lotteryId: lottery._id,
              drawDate: lottery.drawDate,
            });
          });
        }
      });

      // Calcular métricas adicionales
      const totalLotteries = allLotteries.length;
      const completedLotteriesCount = allLotteries.filter(
        (l: any) => l.status === 'completed'
      ).length;
      const activeUsersThisMonth = recentUsers.length;

      const totalRevenue = recentTickets.reduce(
        (sum: number, t: any) => sum + (t.price || 0),
        0
      );

      const totalDeposits = recentDeposits.reduce(
        (sum: number, p: any) => sum + (p.amount || 0),
        0
      );

      const totalWithdrawals = recentWithdrawals.reduce(
        (sum: number, p: any) => sum + (p.amount || 0),
        0
      );

      setMetrics({
        ...statsRes.data.stats,
        totalLotteries,
        completedLotteriesCount,
        activeLotteries: availableLotteries.length,
        activeUsersThisMonth,
        revenueThisMonth: totalRevenue,
        depositsThisMonth: totalDeposits,
        withdrawalsThisMonth: totalWithdrawals,
        netBalanceThisMonth: totalDeposits - totalWithdrawals,
      });

      setRecentActivities({
        availableLotteries: availableLotteries.slice(0, 5),
        completedLotteries: completedLotteries.slice(0, 5),
        recentWinners: recentWinners.slice(0, 10),
        recentUsers: recentUsers.slice(0, 10),
        recentTickets: recentTickets.slice(0, 10),
        recentDeposits: recentDeposits.slice(0, 10),
        recentWithdrawals: recentWithdrawals.slice(0, 10),
      });
    } catch (error) {
      toast.error('Error al cargar datos del panel');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard de Administración</h1>
          <p className="text-gray-600 mt-1">
            Métricas generales y actividades recientes (últimos 30 días)
          </p>
        </div>

        {/* Métricas Permanentes */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Activity className="mr-2" size={24} />
            Métricas Generales
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Total Usuarios</p>
                  <p className="text-3xl font-bold mt-1">
                    {metrics?.totalUsers || 0}
                  </p>
                </div>
                <Users size={40} className="text-blue-200" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Total Sorteos</p>
                  <p className="text-3xl font-bold mt-1">
                    {metrics?.totalLotteries || 0}
                  </p>
                  <p className="text-xs text-purple-100 mt-1">
                    {metrics?.completedLotteriesCount || 0} completados
                  </p>
                </div>
                <Trophy size={40} className="text-purple-200" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Boletos Vendidos</p>
                  <p className="text-3xl font-bold mt-1">
                    {metrics?.totalTicketsPurchased || 0}
                  </p>
                </div>
                <Ticket size={40} className="text-green-200" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100 text-sm">Ingresos Totales</p>
                  <p className="text-3xl font-bold mt-1">
                    ${metrics?.totalSpent?.toFixed(2) || '0.00'}
                  </p>
                </div>
                <DollarSign size={40} className="text-yellow-200" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-sm">Premios Pagados</p>
                  <p className="text-3xl font-bold mt-1">
                    ${metrics?.totalWon?.toFixed(2) || '0.00'}
                  </p>
                </div>
                <TrendingUp size={40} className="text-red-200" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-indigo-100 text-sm">Balance Neto</p>
                  <p className="text-3xl font-bold mt-1">
                    ${((metrics?.totalSpent || 0) - (metrics?.totalWon || 0)).toFixed(2)}
                  </p>
                </div>
                <Wallet size={40} className="text-indigo-200" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-teal-100 text-sm">Sorteos Activos</p>
                  <p className="text-3xl font-bold mt-1">
                    {metrics?.activeLotteries || 0}
                  </p>
                </div>
                <Activity size={40} className="text-teal-200" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-pink-100 text-sm">Usuarios Este Mes</p>
                  <p className="text-3xl font-bold mt-1">
                    {metrics?.activeUsersThisMonth || 0}
                  </p>
                </div>
                <UserPlus size={40} className="text-pink-200" />
              </div>
            </div>
          </div>
        </div>

        {/* Actividades Recientes */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Calendar className="mr-2" size={24} />
            Actividades Recientes (Últimos 30 días)
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sorteos Disponibles */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                <Trophy className="mr-2 text-green-600" size={20} />
                Sorteos Disponibles ({recentActivities.availableLotteries.length})
              </h3>
              <div className="space-y-3">
                {recentActivities.availableLotteries.length > 0 ? (
                  recentActivities.availableLotteries.map((lottery: any) => (
                    <div
                      key={lottery._id}
                      className="border border-gray-200 rounded-lg p-3 hover:border-primary-300 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-gray-900">{lottery.name}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {lottery.soldTickets}/{lottery.maxTickets} vendidos
                          </p>
                        </div>
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded">
                          ${lottery.ticketPrice}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm text-center py-4">
                    No hay sorteos disponibles
                  </p>
                )}
              </div>
            </div>

            {/* Sorteos Realizados */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                <Award className="mr-2 text-blue-600" size={20} />
                Sorteos Realizados ({recentActivities.completedLotteries.length})
              </h3>
              <div className="space-y-3">
                {recentActivities.completedLotteries.length > 0 ? (
                  recentActivities.completedLotteries.map((lottery: any) => (
                    <div
                      key={lottery._id}
                      className="border border-gray-200 rounded-lg p-3 hover:border-primary-300 transition-colors"
                    >
                      <p className="font-semibold text-gray-900">{lottery.name}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(lottery.drawDate).toLocaleDateString()}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm text-center py-4">
                    No hay sorteos realizados
                  </p>
                )}
              </div>
            </div>

            {/* Ganadores Recientes */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                <Trophy className="mr-2 text-yellow-600" size={20} />
                Ganadores Recientes ({recentActivities.recentWinners.length})
              </h3>
              <div className="space-y-3">
                {recentActivities.recentWinners.length > 0 ? (
                  recentActivities.recentWinners.map((winner: any, idx: number) => (
                    <div
                      key={idx}
                      className="border border-gray-200 rounded-lg p-3 hover:border-primary-300 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-gray-900">
                            {winner.userId?.firstName} {winner.userId?.lastName}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {winner.lotteryName} - Posición #{winner.position}
                          </p>
                        </div>
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded">
                          ${winner.prize?.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm text-center py-4">
                    No hay ganadores recientes
                  </p>
                )}
              </div>
            </div>

            {/* Usuarios Recientes */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                <UserPlus className="mr-2 text-purple-600" size={20} />
                Usuarios Recientes ({recentActivities.recentUsers.length})
              </h3>
              <div className="space-y-3">
                {recentActivities.recentUsers.length > 0 ? (
                  recentActivities.recentUsers.map((user: any) => (
                    <div
                      key={user._id}
                      className="border border-gray-200 rounded-lg p-3 hover:border-primary-300 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-gray-900">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">{user.email}</p>
                        </div>
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded ${
                            user.role === 'admin'
                              ? 'bg-purple-100 text-purple-800'
                              : user.role === 'gerente'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {user.role}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm text-center py-4">
                    No hay usuarios recientes
                  </p>
                )}
              </div>
            </div>

            {/* Compra de Boletos */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                <ShoppingCart className="mr-2 text-orange-600" size={20} />
                Compra de Boletos ({recentActivities.recentTickets.length})
              </h3>
              <div className="space-y-3">
                {recentActivities.recentTickets.length > 0 ? (
                  recentActivities.recentTickets.map((ticket: any) => (
                    <div
                      key={ticket._id}
                      className="border border-gray-200 rounded-lg p-3 hover:border-primary-300 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-gray-900">
                            {ticket.userId?.firstName} {ticket.userId?.lastName}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {ticket.lotteryId?.name}
                          </p>
                        </div>
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded">
                          ${ticket.price?.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm text-center py-4">
                    No hay compras recientes
                  </p>
                )}
              </div>
            </div>

            {/* Recargas de Saldo */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                <Wallet className="mr-2 text-green-600" size={20} />
                Recargas de Saldo ({recentActivities.recentDeposits.length})
              </h3>
              <div className="space-y-3">
                {recentActivities.recentDeposits.length > 0 ? (
                  recentActivities.recentDeposits.map((deposit: any) => (
                    <div
                      key={deposit._id}
                      className="border border-gray-200 rounded-lg p-3 hover:border-primary-300 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-gray-900">
                            {deposit.userId?.firstName} {deposit.userId?.lastName}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {deposit.method}
                          </p>
                        </div>
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded">
                          +${deposit.amount?.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm text-center py-4">
                    No hay recargas recientes
                  </p>
                )}
              </div>
            </div>

            {/* Retiros */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                <CreditCard className="mr-2 text-red-600" size={20} />
                Retiros ({recentActivities.recentWithdrawals.length})
              </h3>
              <div className="space-y-3">
                {recentActivities.recentWithdrawals.length > 0 ? (
                  recentActivities.recentWithdrawals.map((withdrawal: any) => (
                    <div
                      key={withdrawal._id}
                      className="border border-gray-200 rounded-lg p-3 hover:border-primary-300 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-gray-900">
                            {withdrawal.userId?.firstName} {withdrawal.userId?.lastName}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {withdrawal.method}
                          </p>
                        </div>
                        <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded">
                          -${withdrawal.amount?.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm text-center py-4">
                    No hay retiros recientes
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
