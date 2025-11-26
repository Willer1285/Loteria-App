import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { ticketAPI, lotteryAPI } from '../services/api';
import toast from 'react-hot-toast';
import { Search, CheckCircle, XCircle, X } from 'lucide-react';

const VerifyTicket = () => {
  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [lotteryStatus, setLotteryStatus] = useState<'active' | 'completed'>('active');
  const [lotteries, setLotteries] = useState<any[]>([]);
  const [selectedLottery, setSelectedLottery] = useState<any>(null);
  const [ticketNumber, setTicketNumber] = useState('');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadLotteriesByStatus();
  }, [lotteryStatus]);

  const loadLotteriesByStatus = async () => {
    try {
      const response = await lotteryAPI.getAll();
      const allLotteries = response.data.lotteries || [];
      const now = new Date();

      const filtered = allLotteries.filter((lottery: any) => {
        const drawDate = new Date(lottery.drawDate);

        if (lotteryStatus === 'active') {
          return drawDate > now || (lottery.status === 'active' && !lottery.winningNumbers);
        } else {
          return drawDate <= now && lottery.status === 'completed' && lottery.winningNumbers;
        }
      });

      filtered.sort((a: any, b: any) => {
        const dateA = new Date(a.drawDate);
        const dateB = new Date(b.drawDate);
        return lotteryStatus === 'active'
          ? dateA.getTime() - dateB.getTime()
          : dateB.getTime() - dateA.getTime();
      });

      setLotteries(filtered);
      setSelectedLottery(null);
      setTicketNumber('');
      setTicket(null);

      if (filtered.length === 0) {
        toast.error(`No hay sorteos ${lotteryStatus === 'active' ? 'activos' : 'realizados'}`);
      }
    } catch (error) {
      toast.error('Error al cargar sorteos');
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedLottery || !ticketNumber) {
      toast.error('Por favor selecciona un sorteo e ingresa el número de control');
      return;
    }

    setLoading(true);

    try {
      const response = await ticketAPI.verifyByLotteryAndNumber({
        lotteryId: selectedLottery._id,
        number: ticketNumber,
      });
      const foundTicket = response.data.ticket;

      setTicket(foundTicket);
      setShowModal(true);
      toast.success('Boleto encontrado y verificado');
    } catch (error: any) {
      toast.error(
        error.response?.data?.error || 'No se encontró el boleto'
      );
      setTicket(null);
    } finally {
      setLoading(false);
    }
  };

  const formatControlNumber = (lotteryNumber: string, ticketNumber: string) => {
    return `TKT-${lotteryNumber}-${ticketNumber}`;
  };

  const formatTicketNumber = (number: number, maxNumber: number) => {
    const padding = String(maxNumber).length;
    return String(number).padStart(padding, '0');
  };

  const getStatusInSpanish = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'active': 'Activo',
      'won': 'Ganador',
      'lost': 'Perdedor',
    };
    return statusMap[status] || status;
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Verificar Boleto
          </h1>
          <p className="text-gray-600 mt-1">
            Verifica el estado de tu boleto
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado del Sorteo
              </label>
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setLotteryStatus('active')}
                  className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-colors ${
                    lotteryStatus === 'active'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Sorteos Activos
                </button>
                <button
                  type="button"
                  onClick={() => setLotteryStatus('completed')}
                  className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-colors ${
                    lotteryStatus === 'completed'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Sorteos Realizados
                </button>
              </div>
            </div>

            {lotteries.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Selecciona el Sorteo
                </label>
                <select
                  value={selectedLottery?._id || ''}
                  onChange={(e) => {
                    const lottery = lotteries.find(l => l._id === e.target.value);
                    setSelectedLottery(lottery || null);
                    setTicket(null);
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Selecciona un sorteo...</option>
                  {lotteries.map((lottery) => (
                    <option key={lottery._id} value={lottery._id}>
                      {lottery.name} - {lottery.controlNumber} ({new Date(lottery.drawDate).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {selectedLottery && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número de Boleto
                </label>
                <input
                  type="text"
                  value={ticketNumber}
                  onChange={(e) => setTicketNumber(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Ingresa el número del boleto"
                />
              </div>
            )}

            {selectedLottery && (
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                <Search size={20} />
                <span>{loading ? 'Verificando...' : 'Verificar Boleto'}</span>
              </button>
            )}
          </form>
        </div>

        {showModal && ticket && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-2xl font-bold text-gray-900">Resultado de Verificación</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-6">
                <div className="flex items-center justify-center mb-6">
                  {ticket.status === 'won' ? (
                    <CheckCircle className="text-green-500" size={64} />
                  ) : ticket.status === 'lost' ? (
                    <XCircle className="text-red-500" size={64} />
                  ) : (
                    <CheckCircle className="text-blue-500" size={64} />
                  )}
                </div>

                <h3 className="text-2xl font-bold text-center text-gray-900 mb-6">
                  {ticket.status === 'won'
                    ? '¡Boleto Ganador!'
                    : ticket.status === 'lost'
                    ? 'Boleto no ganador'
                    : 'Boleto Válido'}
                </h3>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Número de Control</p>
                      <p className="font-semibold text-gray-900">
                        {ticket.ticketNumber}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Estado</p>
                      <p className="font-semibold text-gray-900">
                        {getStatusInSpanish(ticket.status)}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">Números Seleccionados</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {ticket.numbers.map((num: number, index: number) => (
                        <span
                          key={index}
                          className="px-4 py-2 bg-primary-100 text-primary-900 rounded-lg font-semibold text-lg"
                        >
                          {formatTicketNumber(num, selectedLottery?.maxNumber || 100)}
                        </span>
                      ))}
                    </div>
                  </div>

                  {ticket.lotteryId && (
                    <div>
                      <p className="text-sm text-gray-600">Sorteo</p>
                      <p className="font-semibold text-gray-900">
                        {ticket.lotteryId.name}
                      </p>
                    </div>
                  )}

                  {ticket.matchedNumbers !== undefined && ticket.matchedNumbers > 0 && (
                    <div>
                      <p className="text-sm text-gray-600">Números Acertados</p>
                      <p className="font-semibold text-gray-900">
                        {ticket.matchedNumbers}
                      </p>
                    </div>
                  )}

                  {ticket.prize && ticket.prize > 0 && (
                    <div className="pt-4 border-t">
                      <p className="text-sm text-gray-600">Premio Ganado</p>
                      <p className="text-2xl font-bold text-green-600">
                        ${ticket.prize.toFixed(2)}
                      </p>
                    </div>
                  )}

                  {ticket.userId && (
                    <div className="pt-4 border-t">
                      <p className="text-sm text-gray-600">Propietario</p>
                      <p className="font-semibold text-gray-900">
                        {ticket.userId.firstName} {ticket.userId.lastName}
                      </p>
                      <p className="text-sm text-gray-600">
                        {ticket.userId.email}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end p-6 border-t space-x-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default VerifyTicket;
