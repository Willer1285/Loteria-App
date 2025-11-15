import { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { lotteryAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { Search, Plus, Edit, Eye, Play, Filter, Trash2 } from 'lucide-react';
import CreateLotteryModal from '../../components/admin/CreateLotteryModal';
import EditLotteryModal from '../../components/admin/EditLotteryModal';
import ManageLotteryModal from '../../components/admin/ManageLotteryModal';
import DrawLotteryModal from '../../components/admin/DrawLotteryModal';

const Lotteries = () => {
  const [lotteries, setLotteries] = useState<any[]>([]);
  const [filteredLotteries, setFilteredLotteries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed' | 'pending_draw'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedLotteryForEdit, setSelectedLotteryForEdit] = useState<any>(null);
  const [selectedLotteryForView, setSelectedLotteryForView] = useState<any>(null);
  const [selectedLotteryForDraw, setSelectedLotteryForDraw] = useState<any>(null);

  useEffect(() => {
    loadLotteries();

    // Auto-actualizar cada 60 segundos (optimizado)
    const interval = setInterval(() => {
      loadLotteries();
    }, 60000); // 60 segundos

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    filterLotteries();
  }, [lotteries, searchTerm, statusFilter]);

  const loadLotteries = async () => {
    try {
      const response = await lotteryAPI.getAll({ limit: 100 });
      setLotteries(response.data.lotteries);
    } catch (error) {
      toast.error('Error al cargar sorteos');
    } finally {
      setLoading(false);
    }
  };

  const filterLotteries = () => {
    let filtered = [...lotteries];

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(lottery => lottery.status === statusFilter);
    }

    // Filter by search term (name or control number)
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        lottery =>
          lottery.name.toLowerCase().includes(term) ||
          lottery.controlNumber?.toLowerCase().includes(term)
      );
    }

    setFilteredLotteries(filtered);
  };

  const handleDrawLottery = (lottery: any) => {
    setSelectedLotteryForDraw(lottery);
  };

  const handleDeleteLottery = async (lotteryId: string, soldTickets: number) => {
    if (soldTickets > 0) {
      toast.error('No se puede eliminar un sorteo con boletos vendidos');
      return;
    }

    if (!confirm('¿Estás seguro de eliminar este sorteo? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      await lotteryAPI.delete(lotteryId);
      toast.success('Sorteo eliminado exitosamente');
      loadLotteries();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al eliminar sorteo');
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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Sorteos</h1>
            <p className="text-gray-600 mt-1">
              Administra todos los sorteos del sistema
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors shadow-lg"
          >
            <Plus size={20} />
            <span>Crear Sorteo</span>
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar por nombre o número de control..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 appearance-none"
              >
                <option value="all">Todos los sorteos</option>
                <option value="active">Activos</option>
                <option value="pending_draw">Sin Sortear</option>
                <option value="completed">Completados</option>
              </select>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
            <span>
              Mostrando {filteredLotteries.length} de {lotteries.length} sorteos
            </span>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Limpiar búsqueda
              </button>
            )}
          </div>
        </div>

        {/* Lotteries List */}
        <div className="space-y-4">
          {filteredLotteries.map((lottery) => (
            <div
              key={lottery._id}
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-xl font-bold text-gray-900">
                      {lottery.name}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        lottery.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : lottery.status === 'pending_draw'
                          ? 'bg-orange-100 text-orange-800'
                          : lottery.status === 'completed'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {lottery.status === 'active' && 'Activo'}
                      {lottery.status === 'pending_draw' && 'Sin Sortear'}
                      {lottery.status === 'completed' && 'Completado'}
                      {lottery.status === 'cancelled' && 'Cancelado'}
                    </span>
                  </div>

                  {lottery.controlNumber && (
                    <p className="text-sm text-gray-500 mb-2">
                      Control: <span className="font-semibold">{lottery.controlNumber}</span>
                    </p>
                  )}

                  <p className="text-gray-600 mb-4">{lottery.description}</p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Precio</p>
                      <p className="font-semibold text-gray-900">${lottery.ticketPrice || 0}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Premio Total</p>
                      <p className="font-semibold text-green-600">${(lottery.totalPrize || 0).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Boletos</p>
                      <p className="font-semibold text-gray-900">
                        {lottery.soldTickets || 0}/{lottery.maxTickets || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Fecha del Sorteo</p>
                      <p className="font-semibold text-gray-900">
                        {new Date(lottery.drawDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full transition-all progress-bar-animated"
                        style={{
                          width: `${lottery.maxTickets > 0 ? ((lottery.soldTickets || 0) / lottery.maxTickets) * 100 : 0}%`,
                        }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {lottery.maxTickets > 0 ? (((lottery.soldTickets || 0) / lottery.maxTickets) * 100).toFixed(1) : 0}% vendido
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col space-y-2 ml-4">
                  <button
                    onClick={() => setSelectedLotteryForView(lottery)}
                    className="flex items-center space-x-2 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <Eye size={16} />
                    <span>Ver</span>
                  </button>

                  {lottery.status !== 'completed' && lottery.status !== 'pending_draw' && (
                    <button
                      onClick={() => setSelectedLotteryForEdit(lottery)}
                      className="flex items-center space-x-2 px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                    >
                      <Edit size={16} />
                      <span>Editar</span>
                    </button>
                  )}

                  {(lottery.soldTickets || 0) === 0 && lottery.status !== 'completed' && lottery.status !== 'pending_draw' && (
                    <button
                      onClick={() => handleDeleteLottery(lottery._id, lottery.soldTickets || 0)}
                      className="flex items-center space-x-2 px-3 py-2 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                    >
                      <Trash2 size={16} />
                      <span>Eliminar</span>
                    </button>
                  )}

                  {lottery.status === 'pending_draw' && (
                    <button
                      onClick={() => handleDrawLottery(lottery)}
                      className="flex items-center space-x-2 px-3 py-2 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                    >
                      <Play size={16} />
                      <span>Sortear</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {filteredLotteries.length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl shadow-md">
              <p className="text-gray-500 text-lg">No se encontraron sorteos</p>
              {searchTerm && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                  }}
                  className="mt-4 text-primary-600 hover:text-primary-700 font-medium"
                >
                  Limpiar filtros
                </button>
              )}
            </div>
          )}
        </div>

        {/* Modals */}
        {showCreateModal && (
          <CreateLotteryModal
            onClose={() => setShowCreateModal(false)}
            onSuccess={() => {
              setShowCreateModal(false);
              loadLotteries();
            }}
          />
        )}

        {selectedLotteryForEdit && (
          <EditLotteryModal
            lottery={selectedLotteryForEdit}
            onClose={() => setSelectedLotteryForEdit(null)}
            onSuccess={() => {
              setSelectedLotteryForEdit(null);
              loadLotteries();
            }}
          />
        )}

        {selectedLotteryForView && (
          <ManageLotteryModal
            lottery={selectedLotteryForView}
            onClose={() => setSelectedLotteryForView(null)}
            onSuccess={() => {
              setSelectedLotteryForView(null);
              loadLotteries();
            }}
          />
        )}

        {selectedLotteryForDraw && (
          <DrawLotteryModal
            lottery={selectedLotteryForDraw}
            onClose={() => setSelectedLotteryForDraw(null)}
            onSuccess={() => {
              setSelectedLotteryForDraw(null);
              loadLotteries();
            }}
          />
        )}
      </div>
    </AdminLayout>
  );
};

export default Lotteries;
