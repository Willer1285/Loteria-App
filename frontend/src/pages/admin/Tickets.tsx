import { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { ticketAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { Search, Filter, Calendar, User, Ticket, FileText, Download, XCircle, X } from 'lucide-react';

const Tickets = () => {
  const [tickets, setTickets] = useState<any[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    searchTerm: '',
    startDate: '',
    endDate: '',
    userName: '',
    ticketNumber: '',
    lotteryName: '',
    controlNumber: '',
  });

  // Modal de anulación
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [cancelData, setCancelData] = useState({
    refundType: 'full' as 'full' | 'partial' | 'none',
    refundPercentage: 100,
    reason: '',
  });

  useEffect(() => {
    loadTickets();
  }, []);

  useEffect(() => {
    filterTickets();
  }, [tickets, filters]);

  const loadTickets = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Cargando tickets desde el endpoint admin...');
      // Usar el nuevo endpoint que obtiene TODOS los tickets
      const response = await ticketAPI.getAllTicketsAdmin({ limit: 10000 });
      console.log('Respuesta del servidor:', response.data);
      setTickets(response.data.tickets || []);
      toast.success(`${response.data.tickets?.length || 0} boletos cargados`);
    } catch (error: any) {
      console.error('Error al cargar boletos:', error);
      console.error('Detalles del error:', error.response?.data);
      const errorMessage = error.response?.data?.error || error.message || 'Error desconocido al cargar boletos';
      setError(errorMessage);
      toast.error('Error al cargar boletos. Revisa la consola para más detalles.');
      setTickets([]); // Asegurar que se muestre la tabla vacía en caso de error
    } finally {
      setLoading(false);
    }
  };

  const filterTickets = () => {
    let filtered = [...tickets];

    // Search term (general search across multiple fields)
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (ticket) =>
          ticket.ticketNumber?.toLowerCase().includes(term) ||
          ticket.userId?.firstName?.toLowerCase().includes(term) ||
          ticket.userId?.lastName?.toLowerCase().includes(term) ||
          ticket.userId?.email?.toLowerCase().includes(term) ||
          ticket.lotteryId?.name?.toLowerCase().includes(term) ||
          ticket.lotteryId?.controlNumber?.toLowerCase().includes(term)
      );
    }

    // Date range
    if (filters.startDate) {
      filtered = filtered.filter(
        (ticket) =>
          new Date(ticket.purchaseDate) >= new Date(filters.startDate)
      );
    }
    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      endDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(
        (ticket) => new Date(ticket.purchaseDate) <= endDate
      );
    }

    // User name
    if (filters.userName) {
      const term = filters.userName.toLowerCase();
      filtered = filtered.filter(
        (ticket) =>
          ticket.userId?.firstName?.toLowerCase().includes(term) ||
          ticket.userId?.lastName?.toLowerCase().includes(term) ||
          ticket.userId?.email?.toLowerCase().includes(term)
      );
    }

    // Ticket number
    if (filters.ticketNumber) {
      const term = filters.ticketNumber.toLowerCase();
      filtered = filtered.filter((ticket) =>
        ticket.ticketNumber?.toLowerCase().includes(term)
      );
    }

    // Lottery name
    if (filters.lotteryName) {
      const term = filters.lotteryName.toLowerCase();
      filtered = filtered.filter((ticket) =>
        ticket.lotteryId?.name?.toLowerCase().includes(term)
      );
    }

    // Control number
    if (filters.controlNumber) {
      const term = filters.controlNumber.toLowerCase();
      filtered = filtered.filter((ticket) =>
        ticket.lotteryId?.controlNumber?.toLowerCase().includes(term)
      );
    }

    setFilteredTickets(filtered);
  };

  const handleFilterChange = (field: string, value: string) => {
    setFilters({
      ...filters,
      [field]: value,
    });
  };

  const clearFilters = () => {
    setFilters({
      searchTerm: '',
      startDate: '',
      endDate: '',
      userName: '',
      ticketNumber: '',
      lotteryName: '',
      controlNumber: '',
    });
  };

  const openCancelModal = (ticket: any) => {
    setSelectedTicket(ticket);
    setCancelData({
      refundType: 'full',
      refundPercentage: 100,
      reason: '',
    });
    setShowCancelModal(true);
  };

  const closeCancelModal = () => {
    setShowCancelModal(false);
    setSelectedTicket(null);
  };

  const handleCancelTicket = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedTicket) return;

    if (cancelData.refundType === 'partial' && (cancelData.refundPercentage < 0 || cancelData.refundPercentage > 100)) {
      toast.error('El porcentaje debe estar entre 0 y 100');
      return;
    }

    if (!confirm(`¿Estás seguro de anular este boleto? Esta acción no se puede deshacer.`)) {
      return;
    }

    try {
      await ticketAPI.cancel(selectedTicket._id, {
        refundType: cancelData.refundType,
        refundPercentage: cancelData.refundType === 'partial' ? cancelData.refundPercentage : undefined,
        reason: cancelData.reason || undefined,
      });

      toast.success('Boleto anulado exitosamente');
      closeCancelModal();
      loadTickets();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al anular boleto');
    }
  };

  const handleExport = () => {
    // Basic CSV export
    const csvContent = [
      [
        'Número de Boleto',
        'Usuario',
        'Email',
        'Sorteo',
        'Número de Control',
        'Números',
        'Fecha de Compra',
        'Monto',
        'Estado',
      ],
      ...filteredTickets.map((ticket) => [
        ticket.ticketNumber || 'N/A',
        `${ticket.userId?.firstName || ''} ${ticket.userId?.lastName || ''}`,
        ticket.userId?.email || 'N/A',
        ticket.lotteryId?.name || 'N/A',
        ticket.lotteryId?.controlNumber || 'N/A',
        ticket.numbers?.join(', ') || 'N/A',
        new Date(ticket.purchaseDate).toLocaleString(),
        `$${ticket.price}`,
        ticket.status || 'active',
      ]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `tickets_${new Date().toISOString()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Exportación completada');
  };

  const calculateStats = () => {
    const totalTickets = filteredTickets.length;
    const totalAmount = filteredTickets.reduce(
      (sum, ticket) => sum + (ticket.price || 0),
      0
    );
    const uniqueUsers = new Set(
      filteredTickets.map((ticket) => ticket.userId?._id)
    ).size;
    const uniqueLotteries = new Set(
      filteredTickets.map((ticket) => ticket.lotteryId?._id)
    ).size;

    return { totalTickets, totalAmount, uniqueUsers, uniqueLotteries };
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
      case 'pending':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">Activo</span>;
      case 'won':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Ganador</span>;
      case 'lost':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">Perdedor</span>;
      case 'cancelled':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Anulado</span>;
      default:
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  const stats = calculateStats();

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
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <XCircle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error al cargar los boletos</h3>
                <p className="mt-1 text-sm text-red-700">{error}</p>
                <button
                  onClick={loadTickets}
                  className="mt-2 text-sm font-medium text-red-600 hover:text-red-500"
                >
                  Intentar de nuevo
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Gestión de Ventas de Boletos
            </h1>
            <p className="text-gray-600 mt-1">
              Administra y filtra todas las ventas de boletos
            </p>
          </div>
          <button
            onClick={handleExport}
            className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors shadow-lg"
          >
            <Download size={20} />
            <span>Exportar CSV</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Boletos</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stats.totalTickets}
                </p>
              </div>
              <Ticket className="text-primary-600" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Ingresos Totales</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  ${stats.totalAmount.toFixed(2)}
                </p>
              </div>
              <FileText className="text-green-600" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Usuarios Únicos</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stats.uniqueUsers}
                </p>
              </div>
              <User className="text-blue-600" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Sorteos Activos</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stats.uniqueLotteries}
                </p>
              </div>
              <Calendar className="text-yellow-600" size={32} />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
              <Filter size={20} />
              <span>Filtros</span>
            </h2>
            <button
              onClick={clearFilters}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              Limpiar filtros
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* General Search */}
            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Búsqueda General
              </label>
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Buscar por usuario, boleto, sorteo..."
                  value={filters.searchTerm}
                  onChange={(e) =>
                    handleFilterChange('searchTerm', e.target.value)
                  }
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha Inicial
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) =>
                  handleFilterChange('startDate', e.target.value)
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha Final
              </label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre de Usuario
              </label>
              <input
                type="text"
                placeholder="Juan Pérez"
                value={filters.userName}
                onChange={(e) => handleFilterChange('userName', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número de Boleto
              </label>
              <input
                type="text"
                placeholder="TKT-123"
                value={filters.ticketNumber}
                onChange={(e) =>
                  handleFilterChange('ticketNumber', e.target.value)
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre del Sorteo
              </label>
              <input
                type="text"
                placeholder="Gran Sorteo"
                value={filters.lotteryName}
                onChange={(e) =>
                  handleFilterChange('lotteryName', e.target.value)
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número de Control
              </label>
              <input
                type="text"
                placeholder="LOT-2024-001"
                value={filters.controlNumber}
                onChange={(e) =>
                  handleFilterChange('controlNumber', e.target.value)
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Mostrando {filteredTickets.length} de {tickets.length} boletos
          </p>
        </div>

        {/* Tickets Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                    Boleto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                    Sorteo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                    Números
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                    Monto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredTickets.map((ticket) => (
                  <tr key={ticket._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {ticket.ticketNumber || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {ticket.userId?.firstName} {ticket.userId?.lastName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {ticket.userId?.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {ticket.lotteryId?.name || 'N/A'}
                        </div>
                        {ticket.lotteryId?.controlNumber && (
                          <div className="text-sm text-gray-500">
                            {ticket.lotteryId.controlNumber}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {ticket.numbers && ticket.numbers.length > 0 ? (
                          ticket.numbers.map((num: number, idx: number) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-primary-100 text-primary-800 text-xs font-semibold rounded"
                            >
                              {num}
                            </span>
                          ))
                        ) : (
                          <span className="text-sm text-gray-500">
                            Aleatorio
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(ticket.purchaseDate).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(ticket.purchaseDate).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-green-600">
                        ${ticket.price?.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(ticket.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {ticket.status !== 'cancelled' && ticket.status !== 'won' && (
                        <button
                          onClick={() => openCancelModal(ticket)}
                          className="text-red-600 hover:text-red-900"
                          title="Anular boleto"
                        >
                          <XCircle size={20} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredTickets.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">
                  No se encontraron boletos
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Modal Anular Boleto */}
        {showCancelModal && selectedTicket && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Anular Boleto</h2>
                <button onClick={closeCancelModal} className="text-gray-500 hover:text-gray-700">
                  <X size={24} />
                </button>
              </div>

              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Boleto: <span className="font-semibold">{selectedTicket.ticketNumber}</span></p>
                <p className="text-sm text-gray-600">Usuario: <span className="font-semibold">{selectedTicket.userId?.firstName} {selectedTicket.userId?.lastName}</span></p>
                <p className="text-sm text-gray-600">Sorteo: <span className="font-semibold">{selectedTicket.lotteryId?.name}</span></p>
                <p className="text-sm text-gray-600">Monto: <span className="font-semibold text-green-600">${selectedTicket.price?.toFixed(2)}</span></p>
              </div>

              <form onSubmit={handleCancelTicket} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Reintegro*
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="refundType"
                        value="full"
                        checked={cancelData.refundType === 'full'}
                        onChange={(e) => setCancelData({ ...cancelData, refundType: 'full', refundPercentage: 100 })}
                        className="mr-2"
                      />
                      <span className="text-sm">Reintegro Total (100%)</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="refundType"
                        value="partial"
                        checked={cancelData.refundType === 'partial'}
                        onChange={(e) => setCancelData({ ...cancelData, refundType: 'partial' })}
                        className="mr-2"
                      />
                      <span className="text-sm">Reintegro Parcial (%)</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="refundType"
                        value="none"
                        checked={cancelData.refundType === 'none'}
                        onChange={(e) => setCancelData({ ...cancelData, refundType: 'none', refundPercentage: 0 })}
                        className="mr-2"
                      />
                      <span className="text-sm">Sin Reintegro</span>
                    </label>
                  </div>
                </div>

                {cancelData.refundType === 'partial' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Porcentaje de Reintegro (0-100)*
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      required
                      value={cancelData.refundPercentage}
                      onChange={(e) => setCancelData({ ...cancelData, refundPercentage: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Reintegro: ${((selectedTicket.price * cancelData.refundPercentage) / 100).toFixed(2)}
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Motivo de Anulación (Opcional)
                  </label>
                  <textarea
                    rows={3}
                    value={cancelData.reason}
                    onChange={(e) => setCancelData({ ...cancelData, reason: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="Explica por qué se anula este boleto..."
                  />
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-yellow-800">
                    ⚠️ Esta acción es irreversible. El boleto quedará marcado como "Anulado" y {
                      cancelData.refundType === 'full' ? 'se reintegrará el 100% del monto' :
                      cancelData.refundType === 'partial' ? `se reintegrará el ${cancelData.refundPercentage}% del monto` :
                      'NO se reintegrará ningún monto'
                    } al usuario.
                  </p>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={closeCancelModal}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Anular Boleto
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default Tickets;
