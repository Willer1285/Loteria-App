import { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { rankingAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { Trophy, Eye, X, User, Mail, Hash, Phone, MapPin, Ticket, Wallet } from 'lucide-react';

const AdminRankings = () => {
  const [activeTab, setActiveTab] = useState<'buyers' | 'winners' | 'spenders'>('buyers');
  const [rankings, setRankings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadRankings();
  }, [activeTab]);

  const loadRankings = async () => {
    setLoading(true);
    try {
      let response;
      switch (activeTab) {
        case 'buyers':
          response = await rankingAPI.getTopBuyers({ limit: 20 });
          break;
        case 'winners':
          response = await rankingAPI.getTopWinners({ limit: 20 });
          break;
        case 'spenders':
          response = await rankingAPI.getTopSpenders({ limit: 20 });
          break;
      }
      setRankings(response.data.ranking);
    } catch (error) {
      toast.error('Error al cargar rankings');
    } finally {
      setLoading(false);
    }
  };

  const getMedalColor = (position: number) => {
    switch (position) {
      case 1:
        return 'text-yellow-500';
      case 2:
        return 'text-gray-400';
      case 3:
        return 'text-orange-600';
      default:
        return 'text-gray-600';
    }
  };

  const openUserModal = (item: any) => {
    setSelectedUser(item);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedUser(null);
  };

  const getCategoryTitle = () => {
    switch (activeTab) {
      case 'buyers':
        return 'Ticket Master';
      case 'winners':
        return 'Campeón';
      case 'spenders':
        return 'Tiburón';
    }
  };

  const getCategoryIcon = () => {
    switch (activeTab) {
      case 'buyers':
        return Ticket;
      case 'winners':
        return Trophy;
      case 'spenders':
        return Wallet;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Rankings de Usuarios</h1>
          <p className="text-gray-600 mt-1">
            Visualiza los rankings completos de todos los jugadores
          </p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 border-b">
          <button
            onClick={() => setActiveTab('buyers')}
            className={`flex items-center space-x-2 px-4 py-3 border-b-2 font-semibold transition-colors ${
              activeTab === 'buyers'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Ticket size={20} />
            <span>Ticket Master</span>
          </button>

          <button
            onClick={() => setActiveTab('winners')}
            className={`flex items-center space-x-2 px-4 py-3 border-b-2 font-semibold transition-colors ${
              activeTab === 'winners'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Trophy size={20} />
            <span>Campeón</span>
          </button>

          <button
            onClick={() => setActiveTab('spenders')}
            className={`flex items-center space-x-2 px-4 py-3 border-b-2 font-semibold transition-colors ${
              activeTab === 'spenders'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Wallet size={20} />
            <span>Tiburón</span>
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Posición
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Usuario
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    {activeTab === 'buyers'
                      ? 'Boletos Comprados'
                      : activeTab === 'winners'
                      ? 'Total Ganado'
                      : 'Total Gastado'}
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {rankings.map((item) => (
                  <tr key={item.position} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <Trophy
                          className={getMedalColor(item.position)}
                          size={20}
                        />
                        <span className="font-semibold text-gray-900">
                          #{item.position}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900 font-medium">
                        {item.user.username}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-900">
                        {activeTab === 'buyers'
                          ? item.ticketsPurchased
                          : activeTab === 'winners'
                          ? `$${item.totalWon?.toFixed(2)}`
                          : `$${item.totalSpent?.toFixed(2)}`}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => openUserModal(item)}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
                      >
                        <Eye size={16} />
                        <span>Ver</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {rankings.length === 0 && (
              <div className="p-12 text-center">
                <Trophy className="mx-auto text-gray-400 mb-4" size={64} />
                <p className="text-gray-500 text-lg">
                  No hay datos de ranking disponibles
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal de detalles del usuario */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Detalles del Usuario</h2>
                <p className="text-sm text-gray-600 mt-1">Categoría: {getCategoryTitle()}</p>
              </div>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Posición en el ranking */}
            <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-xl p-6 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-full ${
                    selectedUser.position === 1 ? 'bg-yellow-500' :
                    selectedUser.position === 2 ? 'bg-gray-400' :
                    selectedUser.position === 3 ? 'bg-orange-600' :
                    'bg-primary-600'
                  }`}>
                    <Trophy className="text-white" size={28} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Posición en el Ranking</p>
                    <p className="text-3xl font-bold text-primary-900">#{selectedUser.position}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600 font-medium">
                    {activeTab === 'buyers'
                      ? 'Boletos Comprados'
                      : activeTab === 'winners'
                      ? 'Total Ganado'
                      : 'Total Gastado'}
                  </p>
                  <p className="text-2xl font-bold text-primary-900">
                    {activeTab === 'buyers'
                      ? selectedUser.ticketsPurchased
                      : activeTab === 'winners'
                      ? `$${selectedUser.totalWon?.toFixed(2)}`
                      : `$${selectedUser.totalSpent?.toFixed(2)}`}
                  </p>
                </div>
              </div>
            </div>

            {/* Información del usuario */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 text-lg">Información del Usuario</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                  <User className="text-primary-600 mt-0.5" size={20} />
                  <div>
                    <p className="text-xs text-gray-600 font-medium">Nombre Completo</p>
                    <p className="font-semibold text-gray-900">
                      {selectedUser.user.firstName || 'N/A'} {selectedUser.user.lastName || ''}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                  <Hash className="text-primary-600 mt-0.5" size={20} />
                  <div>
                    <p className="text-xs text-gray-600 font-medium">Usuario</p>
                    <p className="font-semibold text-gray-900">{selectedUser.user.username}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                  <Mail className="text-primary-600 mt-0.5" size={20} />
                  <div>
                    <p className="text-xs text-gray-600 font-medium">Email</p>
                    <p className="font-semibold text-gray-900 text-sm break-all">
                      {selectedUser.user.email || 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                  <Phone className="text-primary-600 mt-0.5" size={20} />
                  <div>
                    <p className="text-xs text-gray-600 font-medium">Teléfono</p>
                    <p className="font-semibold text-gray-900">
                      {selectedUser.user.phone || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {selectedUser.user.address && (
                <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                  <MapPin className="text-primary-600 mt-0.5" size={20} />
                  <div>
                    <p className="text-xs text-gray-600 font-medium">Dirección</p>
                    <p className="font-semibold text-gray-900">{selectedUser.user.address}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="mt-6 pt-4 border-t">
              <button
                onClick={closeModal}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminRankings;
