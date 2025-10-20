import { useState } from 'react';
import Layout from '../components/Layout';
import { ticketAPI } from '../services/api';
import toast from 'react-hot-toast';
import { Search, CheckCircle, XCircle } from 'lucide-react';

const VerifyTicket = () => {
  const [verificationCode, setVerificationCode] = useState('');
  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!verificationCode) {
      toast.error('Por favor ingresa un código de verificación');
      return;
    }

    setLoading(true);

    try {
      const response = await ticketAPI.verifyByCode(verificationCode);
      setTicket(response.data.ticket);
      toast.success('Boleto verificado exitosamente');
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
            Ingresa el código de verificación para validar un boleto
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Código de Verificación
              </label>
              <input
                type="text"
                value={verificationCode}
                onChange={(e) =>
                  setVerificationCode(e.target.value.toUpperCase())
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent uppercase"
                placeholder="Ej: A1B2C3D4E5F6G7H8"
                maxLength={16}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              <Search size={20} />
              <span>{loading ? 'Verificando...' : 'Verificar Boleto'}</span>
            </button>
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
