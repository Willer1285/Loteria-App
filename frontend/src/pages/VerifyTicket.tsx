import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { ticketAPI, lotteryAPI } from '../services/api';
import toast from 'react-hot-toast';
import { Search, CheckCircle, XCircle } from 'lucide-react';

const VerifyTicket = () => {
  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [lotteryStatus, setLotteryStatus] = useState<'active' | 'completed'>('active');
  const [lotteries, setLotteries] = useState<any[]>([]);
  const [selectedLottery, setSelectedLottery] = useState('');
  const [ticketNumber, setTicketNumber] = useState('');

  useEffect(() => {
    loadLotteriesByStatus();
  }, [lotteryStatus]);

  const loadLotteriesByStatus = async () => {
    try {
      const response = await lotteryAPI.getAll();
      const allLotteries = response.data.lotteries || [];
      const now = new Date();

      // Filtrar sorteos por estado
      const filtered = allLotteries.filter((lottery: any) => {
        const drawDate = new Date(lottery.drawDate);

        if (lotteryStatus === 'active') {
          // Sorteos activos: fecha futura o sin números ganadores
          return drawDate > now || (lottery.status === 'active' && !lottery.winningNumbers);
        } else {
          // Sorteos completados: fecha pasada y con números ganadores
          return drawDate <= now && lottery.status === 'completed' && lottery.winningNumbers;
        }
      });

      // Ordenar por fecha (más recientes primero para completados, más próximos para activos)
      filtered.sort((a: any, b: any) => {
        const dateA = new Date(a.drawDate);
        const dateB = new Date(b.drawDate);
        return lotteryStatus === 'active'
          ? dateA.getTime() - dateB.getTime()
          : dateB.getTime() - dateA.getTime();
      });

      setLotteries(filtered);
      setSelectedLottery('');
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
      toast.error('Por favor selecciona un sorteo e ingresa el número de boleto');
      return;
    }

    setLoading(true);

    try {
      const response = await ticketAPI.getByNumber(ticketNumber);
      const foundTicket = response.data.ticket;

      // Verificar que el boleto pertenezca al sorteo seleccionado
      if (foundTicket.lotteryId._id !== selectedLottery) {
        toast.error('El boleto no pertenece al sorteo seleccionado');
        setTicket(null);
      } else {
        setTicket(foundTicket);
        toast.success('Boleto encontrado');
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.error || 'No se encontró el boleto'
      );
      setTicket(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Verificar Boleto
          </h1>
          <p className="text-gray-600 mt-1">
            Verifica tu boleto ingresando el número
          </p>
        </div>

        {/* Formulario de verificación */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <form onSubmit={handleVerify} className="space-y-4">
            {/* Estado del sorteo */}
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

            {/* Selección de sorteo */}
            {lotteries.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Selecciona el Sorteo
                </label>
                <select
                  value={selectedLottery}
                  onChange={(e) => {
                    setSelectedLottery(e.target.value);
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

            {/* Número de boleto */}
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
                  placeholder="Ingresa el número de tu boleto"
                />
              </div>
            )}

            {/* Botón de verificación */}
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

        {ticket && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-center mb-6">
              {ticket.status === 'won' ? (
                <CheckCircle className="text-green-500" size={64} />
              ) : ticket.status === 'lost' ? (
                <XCircle className="text-red-500" size={64} />
              ) : (
                <CheckCircle className="text-blue-500" size={64} />
              )}
            </div>

            <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">
              {ticket.status === 'won'
                ? '¡Boleto Ganador!'
                : ticket.status === 'lost'
                ? 'Boleto no ganador'
                : 'Boleto Válido'}
            </h2>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Número de Boleto</p>
                  <p className="font-semibold text-gray-900">
                    {ticket.ticketNumber}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Estado</p>
                  <p className="font-semibold text-gray-900 capitalize">
                    {ticket.status}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600">Números Seleccionados</p>
                <p className="font-semibold text-gray-900">
                  {ticket.numbers.join(', ')}
                </p>
              </div>

              {ticket.lotteryId && (
                <>
                  <div>
                    <p className="text-sm text-gray-600">Sorteo</p>
                    <p className="font-semibold text-gray-900">
                      {ticket.lotteryId.name}
                    </p>
                  </div>

                  {ticket.lotteryId.winningNumbers && (
                    <div>
                      <p className="text-sm text-gray-600">
                        Números Ganadores
                      </p>
                      <p className="font-semibold text-gray-900">
                        {ticket.lotteryId.winningNumbers.join(', ')}
                      </p>
                    </div>
                  )}
                </>
              )}

              {ticket.matchedNumbers !== undefined && (
                <div>
                  <p className="text-sm text-gray-600">Números Acertados</p>
                  <p className="font-semibold text-gray-900">
                    {ticket.matchedNumbers}
                  </p>
                </div>
              )}

              {ticket.prize && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-gray-600">Premio Ganado</p>
                  <p className="text-2xl font-bold text-green-600">
                    ${ticket.prize}
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

              <div className="pt-4 border-t">
                <p className="text-xs text-gray-500 text-center">
                  {ticket.isVerified
                    ? 'Este boleto ha sido verificado'
                    : 'Verificación realizada'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default VerifyTicket;
