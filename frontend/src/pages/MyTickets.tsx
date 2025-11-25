import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { ticketAPI } from '../services/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Eye, Calendar, DollarSign, Ticket, Hash, Package, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import PurchaseDetailModal from '../components/PurchaseDetailModal';

interface Purchase {
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

const MyTickets = () => {
  const [tickets, setTickets] = useState<any[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [filteredPurchases, setFilteredPurchases] = useState<Purchase[]>([]);
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);
  const [loading, setLoading] = useState(true);

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
      const response = await ticketAPI.getUserTickets({}); // Obtener TODOS los tickets sin límite
      const ticketsData = response.data.tickets;
      setTickets(ticketsData);

      // Agrupar boletos por compra
      const purchasesMap = new Map<string, Purchase>();

      ticketsData.forEach((ticket: any) => {
        // Crear key única para cada compra: lotteryId + purchaseDate (redondeado a segundo)
        const purchaseDate = new Date(ticket.purchaseDate);
        // Redondear a segundo (eliminar milisegundos)
        purchaseDate.setMilliseconds(0);
        const purchaseKey = `${ticket.lotteryId._id}_${purchaseDate.getTime()}`;

        if (purchasesMap.has(purchaseKey)) {
          const purchase = purchasesMap.get(purchaseKey)!;
          purchase.tickets.push(ticket);
          purchase.quantity += 1;
          purchase.totalAmount += ticket.price;
        } else {
          purchasesMap.set(purchaseKey, {
            lotteryId: ticket.lotteryId._id,
            lotteryName: ticket.lotteryId.name,
            lotteryControlNumber: ticket.lotteryId.controlNumber,
            ticketPrice: ticket.price,
            purchaseDate: purchaseDate,
            tickets: [ticket],
            totalAmount: ticket.price,
            quantity: 1,
            status: ticket.status,
          });
        }
      });

      // Actualizar el estado de cada compra basándose en todos sus tickets
      purchasesMap.forEach((purchase) => {
        const hasWinner = purchase.tickets.some((t: any) => t.status === 'won');
        const allLost = purchase.tickets.every((t: any) => t.status === 'lost');
        const allActive = purchase.tickets.every((t: any) => t.status === 'active');

        if (hasWinner) {
          purchase.status = 'won';
        } else if (allLost) {
          purchase.status = 'lost';
        } else if (allActive) {
          purchase.status = 'active';
        } else {
          // Estado mixto, priorizar activo
          purchase.status = 'active';
        }
      });

      setPurchases(Array.from(purchasesMap.values()).sort(
        (a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime()
      ));
    } catch (error) {
      toast.error('Error al cargar compras');
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
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    const statusMap: any = {
      won: 'Ganador',
      lost: 'Perdedor',
      active: 'Activo',
      refunded: 'Reembolsado',
    };
    return statusMap[status] || status;
  };

  // Calcular paginación
  const totalPages = Math.ceil(filteredPurchases.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPurchases = filteredPurchases.slice(startIndex, endIndex);

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
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mis Compras</h1>
          <p className="text-gray-600 mt-1">
            Historial completo de tus compras de boletos ({filteredPurchases.length} compra{filteredPurchases.length !== 1 ? 's' : ''})
          </p>
        </div>

        {/* Filtros y búsqueda */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Búsqueda */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar
              </label>
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar por sorteo, control o fecha..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Items por página */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mostrar por página
              </label>
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
                      <h3 className="text-lg font-bold text-gray-900">
                        {purchase.lotteryName}
                      </h3>
                    </div>
                    <p className="text-sm text-gray-600">
                      Control: {purchase.lotteryControlNumber}
                    </p>
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
                      <p className="font-semibold text-gray-900">
                        ${purchase.ticketPrice.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Hash className="text-gray-400" size={18} />
                    <div>
                      <p className="text-xs text-gray-600">Cantidad</p>
                      <p className="font-semibold text-gray-900">
                        {purchase.quantity} boletos
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <DollarSign className="text-green-600" size={18} />
                    <div>
                      <p className="text-xs text-gray-600">Monto Total</p>
                      <p className="font-semibold text-green-600">
                        ${purchase.totalAmount.toFixed(2)}
                      </p>
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
                  onClick={() => setSelectedPurchase(purchase)}
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
                Mostrando {startIndex + 1}-{Math.min(endIndex, filteredPurchases.length)} de {filteredPurchases.length} compras
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={20} />
                </button>
                <div className="flex space-x-1">
                  {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 7) {
                      pageNum = i + 1;
                    } else if (currentPage <= 4) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 3) {
                      pageNum = totalPages - 6 + i;
                    } else {
                      pageNum = currentPage - 3 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-4 py-2 rounded-lg font-semibold ${
                          currentPage === pageNum
                            ? 'bg-primary-600 text-white'
                            : 'hover:bg-gray-100 text-gray-700'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          )}
          </>
        ) : (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <Package className="mx-auto text-gray-400 mb-4" size={64} />
            <p className="text-gray-500 text-lg mb-2">
              {searchTerm ? 'No se encontraron compras' : 'No tienes compras aún'}
            </p>
            <p className="text-gray-400">
              {searchTerm
                ? 'Intenta con otros términos de búsqueda'
                : '¡Compra tu primer boleto y aparecerá aquí!'}
            </p>
          </div>
        )}
      </div>

      {/* Modal de Detalle de Compra */}
      {selectedPurchase && (
        <PurchaseDetailModal
          purchase={selectedPurchase}
          onClose={() => setSelectedPurchase(null)}
        />
      )}
    </Layout>
  );
};

export default MyTickets;
