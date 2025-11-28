import { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { ticketAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Search, Eye, Calendar, DollarSign, Ticket, Hash, Package, User, XCircle, X, AlertTriangle } from 'lucide-react';

interface Purchase {
  userId: string;
  userName: string;
  userEmail: string;
  userUsername?: string;
  lotteryId: string;
  lotteryName: string;
  lotteryControlNumber: string;
  ticketPrice: number;
  purchaseDate: Date;
  tickets: any[];
  totalAmount: number;
  quantity: number;
  status: string;
}

const Tickets = () => {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [filteredPurchases, setFilteredPurchases] = useState<Purchase[]>([]);
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados de modal
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showNumbers, setShowNumbers] = useState(false);
  const [ticketSearchTerm, setTicketSearchTerm] = useState('');

  // Estados de cancelación
  const [cancelData, setCancelData] = useState({
    refundType: 'full' as 'full' | 'partial' | 'none',
    refundPercentage: 100,
    reason: '',
    makeAvailable: false,
  });

  // Estados de paginación y filtros
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadTickets();
  }, []);

  useEffect(() => {
    filterPurchases();
  }, [purchases, searchTerm, currentPage, itemsPerPage]);

  const filterPurchases = () => {
    let filtered = [...purchases];

    // Aplicar búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.userName.toLowerCase().includes(term) ||
          p.userEmail.toLowerCase().includes(term) ||
          p.userUsername?.toLowerCase().includes(term) ||
          p.lotteryName.toLowerCase().includes(term) ||
          p.lotteryControlNumber.toLowerCase().includes(term) ||
          format(p.purchaseDate, 'PP', { locale: es }).toLowerCase().includes(term)
      );
    }

    setFilteredPurchases(filtered);
    // Reset a primera página si cambia la búsqueda
    if (searchTerm) setCurrentPage(1);
  };

  const loadTickets = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Cargando compras agrupadas desde el endpoint optimizado...');

      // Usar el nuevo endpoint optimizado que agrupa en el servidor
      const response = await ticketAPI.getGroupedPurchasesAdmin();
      console.log('Respuesta del servidor:', response.data);

      const purchasesData = response.data.purchases || [];

      // Convertir las fechas de string a Date
      const formattedPurchases = purchasesData.map((purchase: any) => ({
        ...purchase,
        purchaseDate: new Date(purchase.purchaseDate),
      }));

      setPurchases(formattedPurchases);

      // Calcular el total de boletos
      const totalTickets = formattedPurchases.reduce((sum: number, p: any) => sum + p.quantity, 0);

      toast.success(`${formattedPurchases.length} compras cargadas (${totalTickets} boletos)`);
    } catch (error: any) {
      console.error('Error al cargar compras:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Error desconocido al cargar compras';
      setError(errorMessage);
      toast.error('Error al cargar compras. Revisa la consola para más detalles.');
      setPurchases([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'won':
        return 'bg-green-100 text-green-800';
      case 'lost':
        return 'bg-red-100 text-red-800';
      case 'active':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      case 'mixed-cancelled':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    const statusMap: any = {
      won: 'Ganador',
      lost: 'Perdedor',
      active: 'Activo',
      cancelled: 'Anulado',
      'mixed-cancelled': 'Parcialmente Anulado',
    };
    return statusMap[status] || status;
  };

  const getTicketStatusBadge = (status: string) => {
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

  const openPurchaseModal = (purchase: Purchase) => {
    setSelectedPurchase(purchase);
    setShowNumbers(false);
    setShowPurchaseModal(true);
  };

  const closePurchaseModal = () => {
    setShowPurchaseModal(false);
    setSelectedPurchase(null);
    setShowNumbers(false);
    setTicketSearchTerm('');
  };

  const openCancelModal = (ticket: any) => {
    setSelectedTicket(ticket);
    setCancelData({
      refundType: 'full',
      refundPercentage: 100,
      reason: '',
      makeAvailable: false,
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

    const confirmMessage = cancelData.makeAvailable
      ? `¿Estás seguro de anular este boleto? El número ${selectedTicket.numbers[0]} volverá a estar DISPONIBLE para compra. Esta acción no se puede deshacer.`
      : `¿Estás seguro de anular este boleto? El número ${selectedTicket.numbers[0]} quedará ANULADO permanentemente. Esta acción no se puede deshacer.`;

    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      const response = await ticketAPI.cancel(selectedTicket._id, {
        refundType: cancelData.refundType,
        refundPercentage: cancelData.refundType === 'partial' ? cancelData.refundPercentage : undefined,
        reason: cancelData.reason || undefined,
        makeAvailable: cancelData.makeAvailable,
      });

      const successMessage = cancelData.makeAvailable
        ? `Boleto anulado. El número ${selectedTicket.numbers[0]} está nuevamente disponible.`
        : 'Boleto anulado exitosamente';

      toast.success(successMessage);
      closeCancelModal();
      closePurchaseModal();
      loadTickets();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al anular boleto');
    }
  };

  // Calcular paginación
  const totalPages = Math.ceil(filteredPurchases.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPurchases = filteredPurchases.slice(startIndex, endIndex);

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
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Ventas de Boletos</h1>
          <p className="text-gray-600 mt-1">
            Historial completo de compras ({filteredPurchases.length} compra{filteredPurchases.length !== 1 ? 's' : ''})
          </p>
        </div>

        {/* Filtros y búsqueda */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Búsqueda */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Buscar</label>
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar por usuario, sorteo, control o fecha..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Items por página */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mostrar por página</label>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>
        </div>

        {/* Compras */}
        {currentPurchases.length > 0 ? (
          <>
            <div className="grid grid-cols-1 gap-4">
              {currentPurchases.map((purchase, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Package className="text-primary-600" size={20} />
                        <h3 className="text-lg font-bold text-gray-900">{purchase.lotteryName}</h3>
                      </div>
                      <p className="text-sm text-gray-600">Control: {purchase.lotteryControlNumber}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <User className="text-gray-400" size={16} />
                        <p className="text-sm text-gray-700">
                          <span className="font-semibold">{purchase.userName}</span>
                          {purchase.userUsername && <span className="text-gray-500"> (@{purchase.userUsername})</span>}
                        </p>
                      </div>
                      <p className="text-xs text-gray-500 ml-6">{purchase.userEmail}</p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                        purchase.status
                      )}`}
                    >
                      {getStatusText(purchase.status)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center space-x-2">
                      <Ticket className="text-gray-400" size={18} />
                      <div>
                        <p className="text-xs text-gray-600">Precio Unitario</p>
                        <p className="font-semibold text-gray-900">${purchase.ticketPrice.toFixed(2)}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Hash className="text-gray-400" size={18} />
                      <div>
                        <p className="text-xs text-gray-600">Cantidad</p>
                        <p className="font-semibold text-gray-900">{purchase.quantity} boletos</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <DollarSign className="text-green-600" size={18} />
                      <div>
                        <p className="text-xs text-gray-600">Monto Total</p>
                        <p className="font-semibold text-green-600">${purchase.totalAmount.toFixed(2)}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Calendar className="text-gray-400" size={18} />
                      <div>
                        <p className="text-xs text-gray-600">Fecha</p>
                        <p className="font-semibold text-gray-900 text-sm">
                          {format(purchase.purchaseDate, 'PP', { locale: es })}
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => openPurchaseModal(purchase)}
                    className="w-full mt-2 flex items-center justify-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors"
                  >
                    <Eye size={18} />
                    <span>Ver Detalle de Compra</span>
                  </button>
                </div>
              ))}
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between bg-white rounded-xl shadow-md p-4">
                <div className="text-sm text-gray-600">
                  Mostrando {startIndex + 1} - {Math.min(endIndex, filteredPurchases.length)} de{' '}
                  {filteredPurchases.length}
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Anterior
                  </button>
                  <span className="text-sm text-gray-700">
                    Página {currentPage} de {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <Package className="mx-auto text-gray-400 mb-4" size={64} />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No se encontraron compras</h3>
            <p className="text-gray-600">
              {searchTerm ? 'Intenta con otro término de búsqueda' : 'Aún no hay compras registradas'}
            </p>
          </div>
        )}

        {/* Modal Detalle de Compra */}
        {showPurchaseModal && selectedPurchase && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 m-4 max-w-5xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">Detalle de Compra</h2>
                  <p className="text-sm text-gray-600">{selectedPurchase.lotteryName}</p>
                </div>
                <button
                  onClick={closePurchaseModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Status Badge */}
              <div className="mb-6">
                <span
                  className={`inline-flex px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(
                    selectedPurchase.status
                  )}`}
                >
                  Estado: {getStatusText(selectedPurchase.status)}
                </span>
              </div>

              {/* Purchase Information */}
              <div className="bg-gray-50 rounded-xl p-6 mb-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                  Información de la Compra
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start space-x-3">
                    <User className="text-primary-600 mt-1" size={20} />
                    <div>
                      <p className="text-sm text-gray-600">Usuario</p>
                      <p className="font-semibold text-gray-900">{selectedPurchase.userName}</p>
                      {selectedPurchase.userUsername && (
                        <p className="text-xs text-gray-500">@{selectedPurchase.userUsername}</p>
                      )}
                      <p className="text-xs text-gray-500">{selectedPurchase.userEmail}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Calendar className="text-gray-400 mt-1" size={20} />
                    <div>
                      <p className="text-sm text-gray-600">Fecha de Compra</p>
                      <p className="font-semibold text-gray-900">
                        {format(selectedPurchase.purchaseDate, 'PPP', { locale: es })}
                      </p>
                      <p className="text-xs text-gray-500">
                        {format(selectedPurchase.purchaseDate, 'p', { locale: es })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Ticket className="text-gray-400 mt-1" size={20} />
                    <div>
                      <p className="text-sm text-gray-600">Precio por Boleto</p>
                      <p className="font-semibold text-gray-900">${selectedPurchase.ticketPrice.toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Hash className="text-gray-400 mt-1" size={20} />
                    <div>
                      <p className="text-sm text-gray-600">Cantidad de Boletos</p>
                      <p className="font-semibold text-gray-900">{selectedPurchase.quantity} boletos</p>
                    </div>
                  </div>
                </div>

                {/* Total Amount */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="text-green-600" size={24} />
                      <span className="text-lg font-semibold text-gray-900">Monto Total:</span>
                    </div>
                    <span className="text-2xl font-bold text-green-600">
                      ${selectedPurchase.totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Numbers Board */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-gray-900 flex items-center">
                    <Hash className="mr-2" size={20} />
                    Boletos Comprados ({selectedPurchase.tickets.length})
                  </h3>
                  <button
                    onClick={() => setShowNumbers(!showNumbers)}
                    className="text-primary-600 hover:text-primary-700 font-semibold text-sm"
                  >
                    {showNumbers ? 'Ocultar' : 'Mostrar'} Boletos
                  </button>
                </div>

                {showNumbers && (
                  <div className="bg-gray-50 rounded-xl p-4 space-y-4">
                    {/* Buscador de boletos */}
                    <div className="relative">
                      <Search
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        size={18}
                      />
                      <input
                        type="text"
                        value={ticketSearchTerm}
                        onChange={(e) => setTicketSearchTerm(e.target.value)}
                        placeholder="Buscar por número de boleto..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
                      />
                    </div>

                    {/* Lista de boletos */}
                    <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto">
                      {selectedPurchase.tickets
                        // Filtrar por término de búsqueda
                        .filter((ticket) => {
                          if (!ticketSearchTerm) return true;
                          const searchLower = ticketSearchTerm.toLowerCase();
                          return (
                            ticket.numbers[0].toString().includes(ticketSearchTerm) ||
                            ticket.ticketNumber.toLowerCase().includes(searchLower)
                          );
                        })
                        // Ordenar ascendente por número
                        .sort((a, b) => a.numbers[0] - b.numbers[0])
                        .map((ticket, idx) => (
                          <div
                            key={idx}
                            className="bg-white rounded-lg p-4 border-2 border-gray-200 hover:border-primary-400 transition-all"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-3">
                                  <div className="font-mono text-lg font-bold text-primary-600">
                                    {ticket.numbers[0].toString().padStart(4, '0')}
                                  </div>
                                  <div>{getTicketStatusBadge(ticket.status)}</div>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                  Ticket Control: {ticket.ticketNumber}
                                </p>
                              </div>
                              {ticket.status !== 'cancelled' && ticket.status !== 'won' && (
                                <button
                                  onClick={() => openCancelModal(ticket)}
                                  className="flex items-center space-x-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Anular boleto"
                                >
                                  <XCircle size={18} />
                                  <span className="text-sm font-medium">Anular</span>
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>

                    {/* Mensaje cuando no hay resultados */}
                    {selectedPurchase.tickets.filter((ticket) => {
                      if (!ticketSearchTerm) return true;
                      const searchLower = ticketSearchTerm.toLowerCase();
                      return (
                        ticket.numbers[0].toString().includes(ticketSearchTerm) ||
                        ticket.ticketNumber.toLowerCase().includes(searchLower)
                      );
                    }).length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        No se encontraron boletos con el término "{ticketSearchTerm}"
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Modal Anular Boleto */}
        {showCancelModal && selectedTicket && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Anular Boleto</h2>
                <button onClick={closeCancelModal} className="text-gray-500 hover:text-gray-700">
                  <X size={24} />
                </button>
              </div>

              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  Número: <span className="font-mono font-bold text-lg text-primary-600">{selectedTicket.numbers[0]}</span>
                </p>
                <p className="text-sm text-gray-600">
                  Ticket Control: <span className="font-semibold">{selectedTicket.ticketNumber}</span>
                </p>
                <p className="text-sm text-gray-600">
                  Monto: <span className="font-semibold text-green-600">${selectedTicket.price?.toFixed(2)}</span>
                </p>
              </div>

              <form onSubmit={handleCancelTicket} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Reintegro*</label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="full"
                        checked={cancelData.refundType === 'full'}
                        onChange={() => setCancelData({ ...cancelData, refundType: 'full', refundPercentage: 100 })}
                        className="mr-2"
                      />
                      <span className="text-sm">Reintegro Total (100%)</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="partial"
                        checked={cancelData.refundType === 'partial'}
                        onChange={() => setCancelData({ ...cancelData, refundType: 'partial' })}
                        className="mr-2"
                      />
                      <span className="text-sm">Reintegro Parcial (%)</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="none"
                        checked={cancelData.refundType === 'none'}
                        onChange={() => setCancelData({ ...cancelData, refundType: 'none', refundPercentage: 0 })}
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
                      onChange={(e) =>
                        setCancelData({ ...cancelData, refundPercentage: Number(e.target.value) })
                      }
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

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <label className="flex items-start cursor-pointer">
                    <input
                      type="checkbox"
                      checked={cancelData.makeAvailable}
                      onChange={(e) => setCancelData({ ...cancelData, makeAvailable: e.target.checked })}
                      className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <div className="ml-3">
                      <span className="text-sm font-medium text-blue-900">
                        Hacer el número disponible nuevamente
                      </span>
                      <p className="text-xs text-blue-700 mt-1">
                        {cancelData.makeAvailable
                          ? `Al marcar esta opción, el número ${selectedTicket.numbers[0]} se ELIMINARÁ completamente y volverá a estar disponible para que otros usuarios lo compren.`
                          : `Si no marcas esta opción, el número ${selectedTicket.numbers[0]} quedará ANULADO permanentemente y no podrá ser comprado por nadie más.`
                        }
                      </p>
                    </div>
                  </label>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="flex items-start space-x-2">
                    <AlertTriangle className="text-yellow-600 flex-shrink-0 mt-0.5" size={18} />
                    <p className="text-sm text-yellow-800">
                      Esta acción es irreversible. {' '}
                      {cancelData.refundType === 'full'
                        ? 'Se reintegrará el 100% del monto'
                        : cancelData.refundType === 'partial'
                        ? `Se reintegrará el ${cancelData.refundPercentage}% del monto`
                        : 'NO se reintegrará ningún monto'}{' '}
                      al usuario.
                      {cancelData.makeAvailable
                        ? ` El número ${selectedTicket.numbers[0]} volverá a estar disponible.`
                        : ` El número ${selectedTicket.numbers[0]} quedará anulado.`
                      }
                    </p>
                  </div>
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
