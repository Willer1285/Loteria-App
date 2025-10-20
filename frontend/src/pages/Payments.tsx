import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { paymentAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { DollarSign, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';

const Payments = () => {
  const { user, refreshProfile } = useAuth();
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [amount, setAmount] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      const response = await paymentAPI.getHistory();
      setPayments(response.data.payments);
    } catch (error) {
      toast.error('Error al cargar historial de pagos');
    } finally {
      setLoading(false);
    }
  };

  const handleDeposit = async () => {
    const depositAmount = parseFloat(amount);

    if (isNaN(depositAmount) || depositAmount <= 0) {
      toast.error('Monto inválido');
      return;
    }

    setProcessing(true);
    try {
      await paymentAPI.deposit({
        amount: depositAmount,
        method: 'wallet',
      });

      toast.success('Depósito realizado exitosamente');
      setShowDepositModal(false);
      setAmount('');
      await refreshProfile();
      loadPayments();
    } catch (error) {
      toast.error('Error al procesar depósito');
    } finally {
      setProcessing(false);
    }
  };

  const handleWithdraw = async () => {
    const withdrawAmount = parseFloat(amount);

    if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
      toast.error('Monto inválido');
      return;
    }

    if (withdrawAmount > (user?.balance || 0)) {
      toast.error('Saldo insuficiente');
      return;
    }

    setProcessing(true);
    try {
      await paymentAPI.withdraw({
        amount: withdrawAmount,
        method: 'wallet',
      });

      toast.success('Retiro realizado exitosamente');
      setShowWithdrawModal(false);
      setAmount('');
      await refreshProfile();
      loadPayments();
    } catch (error) {
      toast.error('Error al procesar retiro');
    } finally {
      setProcessing(false);
    }
  };

  const getTypeIcon = (type: string) => {
    if (type === 'deposit' || type === 'prize_payout') {
      return <ArrowDownCircle className="text-green-500" size={24} />;
    }
    return <ArrowUpCircle className="text-red-500" size={24} />;
  };

  const getTypeText = (type: string) => {
    const typeMap: any = {
      deposit: 'Depósito',
      withdrawal: 'Retiro',
      ticket_purchase: 'Compra de Boleto',
      prize_payout: 'Premio',
      refund: 'Reembolso',
    };
    return typeMap[type] || type;
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Pagos</h1>
            <p className="text-gray-600 mt-1">
              Gestiona tus depósitos, retiros y historial
            </p>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={() => setShowDepositModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              <ArrowDownCircle size={20} />
              <span>Depositar</span>
            </button>

            <button
              onClick={() => setShowWithdrawModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              <ArrowUpCircle size={20} />
              <span>Retirar</span>
            </button>
          </div>
        </div>

        {/* Balance Card */}
        <div className="bg-gradient-to-r from-primary-500 to-primary-700 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-primary-100 text-sm">Saldo Disponible</p>
              <p className="text-4xl font-bold mt-2">${user?.balance.toFixed(2)}</p>
            </div>
            <DollarSign size={48} className="text-primary-200" />
          </div>
        </div>

        {/* Payment History */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h2 className="text-xl font-bold text-gray-900">
              Historial de Transacciones
            </h2>
          </div>

          {loading ? (
            <div className="flex items-center justify-center p-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : payments.length > 0 ? (
            <div className="divide-y">
              {payments.map((payment) => (
                <div key={payment._id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {getTypeIcon(payment.type)}
                      <div>
                        <p className="font-semibold text-gray-900">
                          {getTypeText(payment.type)}
                        </p>
                        <p className="text-sm text-gray-600">
                          {payment.description}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {format(new Date(payment.createdAt), 'PPP p', {
                            locale: es,
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p
                        className={`text-lg font-bold ${
                          payment.type === 'deposit' ||
                          payment.type === 'prize_payout'
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}
                      >
                        {payment.type === 'deposit' ||
                        payment.type === 'prize_payout'
                          ? '+'
                          : '-'}
                        ${payment.amount.toFixed(2)}
                      </p>
                      <span
                        className={`inline-block mt-1 px-2 py-1 rounded text-xs font-semibold ${
                          payment.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : payment.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {payment.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <p className="text-gray-500">No hay transacciones registradas</p>
            </div>
          )}
        </div>

        {/* Deposit Modal */}
        {showDepositModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Depositar Fondos</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Monto
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="0.00"
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setShowDepositModal(false);
                      setAmount('');
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50"
                    disabled={processing}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleDeposit}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50"
                    disabled={processing}
                  >
                    {processing ? 'Procesando...' : 'Depositar'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Withdraw Modal */}
        {showWithdrawModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Retirar Fondos</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Monto
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max={user?.balance}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="0.00"
                  />
                  <p className="text-sm text-gray-600 mt-1">
                    Saldo disponible: ${user?.balance.toFixed(2)}
                  </p>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setShowWithdrawModal(false);
                      setAmount('');
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50"
                    disabled={processing}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleWithdraw}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
                    disabled={processing}
                  >
                    {processing ? 'Procesando...' : 'Retirar'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Payments;
