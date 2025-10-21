import { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { paymentAPI } from '../../services/api';
import toast from 'react-hot-toast';
import {
  Search,
  Filter,
  DollarSign,
  User,
  Calendar,
  Eye,
  Download,
  X,
} from 'lucide-react';

const Payments = () => {
  const [payments, setPayments] = useState<any[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [filters, setFilters] = useState({
    searchTerm: '',
    startDate: '',
    endDate: '',
    userName: '',
    method: '',
    type: '',
    minAmount: '',
    maxAmount: '',
  });

  useEffect(() => {
    loadPayments();
  }, []);

  useEffect(() => {
    filterPayments();
  }, [payments, filters]);

  const loadPayments = async () => {
    try {
      const response = await paymentAPI.getAll({ limit: 1000 });
      setPayments(response.data.payments || []);
    } catch (error) {
      toast.error('Error al cargar pagos');
    } finally {
      setLoading(false);
    }
  };

  const filterPayments = () => {
    let filtered = [...payments];

    // Search term
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (payment) =>
          payment.userId?.firstName?.toLowerCase().includes(term) ||
          payment.userId?.lastName?.toLowerCase().includes(term) ||
          payment.userId?.email?.toLowerCase().includes(term) ||
          payment.method?.toLowerCase().includes(term)
      );
    }

    // Date range
    if (filters.startDate) {
      filtered = filtered.filter(
        (payment) =>
          new Date(payment.createdAt) >= new Date(filters.startDate)
      );
    }
    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      endDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(
        (payment) => new Date(payment.createdAt) <= endDate
      );
    }

    // User name
    if (filters.userName) {
      const term = filters.userName.toLowerCase();
      filtered = filtered.filter(
        (payment) =>
          payment.userId?.firstName?.toLowerCase().includes(term) ||
          payment.userId?.lastName?.toLowerCase().includes(term) ||
          payment.userId?.email?.toLowerCase().includes(term)
      );
    }

    // Method
    if (filters.method) {
      const term = filters.method.toLowerCase();
      filtered = filtered.filter((payment) =>
        payment.method?.toLowerCase().includes(term)
      );
    }

    // Type
    if (filters.type) {
      filtered = filtered.filter((payment) => payment.type === filters.type);
    }

    // Amount range
    if (filters.minAmount) {
      filtered = filtered.filter(
        (payment) => payment.amount >= parseFloat(filters.minAmount)
      );
    }
    if (filters.maxAmount) {
      filtered = filtered.filter(
        (payment) => payment.amount <= parseFloat(filters.maxAmount)
      );
    }

    setFilteredPayments(filtered);
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
      method: '',
      type: '',
      minAmount: '',
      maxAmount: '',
    });
  };

  const handleExport = () => {
    const csvContent = [
      [
        'Fecha',
        'Usuario',
        'Email',
        'Tipo',
        'Método',
        'Monto',
        'Estado',
      ],
      ...filteredPayments.map((payment) => [
        new Date(payment.createdAt).toLocaleString(),
        `${payment.userId?.firstName || ''} ${payment.userId?.lastName || ''}`,
        payment.userId?.email || 'N/A',
        payment.type || 'N/A',
        payment.method || 'N/A',
        `$${payment.amount}`,
        payment.status || 'completed',
      ]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `payments_${new Date().toISOString()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Exportación completada');
  };

  const calculateStats = () => {
    const totalPayments = filteredPayments.length;
    const totalDeposits = filteredPayments
      .filter((p) => p.type === 'deposit')
      .reduce((sum, p) => sum + (p.amount || 0), 0);
    const totalWithdrawals = filteredPayments
      .filter((p) => p.type === 'withdrawal')
      .reduce((sum, p) => sum + (p.amount || 0), 0);
    const netAmount = totalDeposits - totalWithdrawals;

    return { totalPayments, totalDeposits, totalWithdrawals, netAmount };
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
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Gestión de Pagos
            </h1>
            <p className="text-gray-600 mt-1">
              Administra todos los depósitos y retiros
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
                <p className="text-sm text-gray-600">Total Transacciones</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stats.totalPayments}
                </p>
              </div>
              <DollarSign className="text-primary-600" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Depósitos</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  ${stats.totalDeposits.toFixed(2)}
                </p>
              </div>
              <DollarSign className="text-green-600" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Retiros</p>
                <p className="text-2xl font-bold text-red-600 mt-1">
                  ${stats.totalWithdrawals.toFixed(2)}
                </p>
              </div>
              <DollarSign className="text-red-600" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Balance Neto</p>
                <p
                  className={`text-2xl font-bold mt-1 ${
                    stats.netAmount >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  ${stats.netAmount.toFixed(2)}
                </p>
              </div>
              <DollarSign className="text-blue-600" size={32} />
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
                  placeholder="Buscar por usuario o método..."
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
                Método de Pago
              </label>
              <input
                type="text"
                placeholder="PayPal, Transferencia..."
                value={filters.method}
                onChange={(e) => handleFilterChange('method', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo
              </label>
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Todos</option>
                <option value="deposit">Depósitos</option>
                <option value="withdrawal">Retiros</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Monto Mínimo
              </label>
              <input
                type="number"
                placeholder="0"
                value={filters.minAmount}
                onChange={(e) =>
                  handleFilterChange('minAmount', e.target.value)
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Monto Máximo
              </label>
              <input
                type="number"
                placeholder="9999"
                value={filters.maxAmount}
                onChange={(e) =>
                  handleFilterChange('maxAmount', e.target.value)
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                min="0"
                step="0.01"
              />
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Mostrando {filteredPayments.length} de {payments.length} transacciones
          </p>
        </div>

        {/* Payments Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                    Método
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                    Monto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredPayments.map((payment) => (
                  <tr key={payment._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(payment.createdAt).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(payment.createdAt).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {payment.userId?.firstName} {payment.userId?.lastName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {payment.userId?.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          payment.type === 'deposit'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {payment.type === 'deposit' ? 'Depósito' : 'Retiro'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {payment.method || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div
                        className={`text-sm font-semibold ${
                          payment.type === 'deposit'
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}
                      >
                        {payment.type === 'deposit' ? '+' : '-'}$
                        {payment.amount?.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => setSelectedPayment(payment)}
                        className="flex items-center space-x-1 px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                      >
                        <Eye size={16} />
                        <span>Ver</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredPayments.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">
                  No se encontraron transacciones
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Payment Detail Modal */}
        {selectedPayment && (
          <PaymentDetailModal
            payment={selectedPayment}
            onClose={() => setSelectedPayment(null)}
          />
        )}
      </div>
    </AdminLayout>
  );
};

// Payment Detail Modal Component
interface PaymentDetailModalProps {
  payment: any;
  onClose: () => void;
}

const PaymentDetailModal: React.FC<PaymentDetailModalProps> = ({
  payment,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-900">
            Detalles de la Transacción
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Tipo</p>
              <p className="font-semibold text-gray-900">
                {payment.type === 'deposit' ? 'Depósito' : 'Retiro'}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-600">Monto</p>
              <p
                className={`font-semibold text-xl ${
                  payment.type === 'deposit' ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {payment.type === 'deposit' ? '+' : '-'}$
                {payment.amount?.toFixed(2)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Usuario</p>
              <p className="font-semibold text-gray-900">
                {payment.userId?.firstName} {payment.userId?.lastName}
              </p>
              <p className="text-sm text-gray-500">{payment.userId?.email}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600">Método de Pago</p>
              <p className="font-semibold text-gray-900">
                {payment.method || 'N/A'}
              </p>
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-600">Fecha</p>
            <p className="font-semibold text-gray-900">
              {new Date(payment.createdAt).toLocaleString()}
            </p>
          </div>

          {payment.metadata && Object.keys(payment.metadata).length > 0 && (
            <div>
              <p className="text-sm text-gray-600 mb-2">Información Adicional</p>
              <div className="bg-gray-50 rounded-lg p-3">
                {Object.entries(payment.metadata).map(([key, value]) => (
                  <div key={key} className="flex justify-between py-1">
                    <span className="text-sm text-gray-600">{key}:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {String(value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {payment.proofOfPayment && (
            <div>
              <p className="text-sm text-gray-600 mb-2">
                Comprobante de Pago
              </p>
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <img
                  src={payment.proofOfPayment}
                  alt="Comprobante de pago"
                  className="max-w-full h-auto rounded-lg"
                  onError={(e) => {
                    e.currentTarget.src =
                      'https://via.placeholder.com/400x300?text=Imagen+no+disponible';
                  }}
                />
                <a
                  href={payment.proofOfPayment}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center space-x-2 text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  <Download size={16} />
                  <span>Descargar comprobante</span>
                </a>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 pt-6 border-t">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default Payments;
