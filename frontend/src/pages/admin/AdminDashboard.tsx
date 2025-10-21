import { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { lotteryAPI, userAPI, rankingAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { Users, Ticket, DollarSign, TrendingUp, Plus } from 'lucide-react';
import CreateLotteryModal from '../../components/admin/CreateLotteryModal';
import ManageLotteryModal from '../../components/admin/ManageLotteryModal';

const AdminDashboard = () => {
  const [stats, setStats] = useState<any>(null);
  const [lotteries, setLotteries] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedLottery, setSelectedLottery] = useState<any>(null);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      const [statsRes, lotteriesRes, usersRes] = await Promise.all([
        rankingAPI.getStats(),
        lotteryAPI.getAll({ limit: 10 }),
        userAPI.getAll({ limit: 10 }),
      ]);

      setStats(statsRes.data.stats);
      setLotteries(lotteriesRes.data.lotteries);
      setUsers(usersRes.data.users);
    } catch (error) {
      toast.error('Error al cargar datos del panel');
    } finally {
      setLoading(false);
    }
  };

  const handleDrawLottery = async (lotteryId: string) => {
    if (!confirm('¿Estás seguro de realizar el sorteo? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      await lotteryAPI.draw(lotteryId);
      toast.success('Sorteo realizado exitosamente');
      loadAdminData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al realizar sorteo');
    }
  };

  const handleCancelLottery = async (lotteryId: string) => {
    if (!confirm('¿Estás seguro de cancelar este sorteo?')) {
      return;
    }

    try {
      await lotteryAPI.cancel(lotteryId);
      toast.success('Sorteo cancelado exitosamente');
      loadAdminData();
    } catch (error) {
      toast.error('Error al cancelar sorteo');
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
        <div className="flex justify-end items-center">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors shadow-lg"
          >
            <Plus size={20} />
            <span>Crear Sorteo</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Usuarios</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stats?.totalUsers || 0}
                </p>
              </div>
              <Users className="text-primary-600" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Boletos Vendidos</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stats?.totalTicketsPurchased || 0}
                </p>
              </div>
              <Ticket className="text-blue-600" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Ingresos Totales</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  ${stats?.totalSpent?.toFixed(2) || '0.00'}
                </p>
              </div>
              <DollarSign className="text-green-600" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Premios Pagados</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  ${stats?.totalWon?.toFixed(2) || '0.00'}
                </p>
              </div>
              <TrendingUp className="text-yellow-600" size={32} />
            </div>
          </div>
        </div>

        {/* Lotteries Management */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Gestión de Sorteos
          </h2>

          <div className="space-y-4">
            {lotteries.map((lottery) => (
              <div
                key={lottery._id}
                className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="font-semibold text-gray-900">
                        {lottery.name}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          lottery.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : lottery.status === 'completed'
                            ? 'bg-blue-100 text-blue-800'
                            : lottery.status === 'cancelled'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {lottery.status}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 mt-2">
                      {lottery.description}
                    </p>

                    <div className="flex items-center space-x-4 mt-3 text-sm">
                      <span className="text-gray-600">
                        Precio: <span className="font-semibold">${lottery.ticketPrice}</span>
                      </span>
                      <span className="text-gray-600">
                        Premio: <span className="font-semibold text-green-600">${lottery.totalPrize}</span>
                      </span>
                      <span className="text-gray-600">
                        Vendidos: <span className="font-semibold">{lottery.soldTickets}/{lottery.maxTickets}</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    {lottery.status === 'active' && (
                      <>
                        <button
                          onClick={() => setSelectedLottery(lottery)}
                          className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDrawLottery(lottery._id)}
                          className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
                        >
                          Sortear
                        </button>
                        <button
                          onClick={() => handleCancelLottery(lottery._id)}
                          className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                        >
                          Cancelar
                        </button>
                      </>
                    )}

                    {lottery.status === 'completed' && (
                      <button
                        onClick={() => setSelectedLottery(lottery)}
                        className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                      >
                        Ver Resultados
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Users Management */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Usuarios Recientes
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                    Usuario
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                    Rol
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                    Balance
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                    Boletos
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-gray-900">
                        {user.firstName} {user.lastName}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {user.email}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          user.role === 'admin'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-900">
                      ${user.balance?.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-gray-900">
                      {user.ticketsPurchased}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modals */}
        {showCreateModal && (
          <CreateLotteryModal
            onClose={() => setShowCreateModal(false)}
            onSuccess={() => {
              setShowCreateModal(false);
              loadAdminData();
            }}
          />
        )}

        {selectedLottery && (
          <ManageLotteryModal
            lottery={selectedLottery}
            onClose={() => setSelectedLottery(null)}
            onSuccess={() => {
              setSelectedLottery(null);
              loadAdminData();
            }}
          />
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
