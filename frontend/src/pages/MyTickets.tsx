import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { ticketAPI } from '../services/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const MyTickets = () => {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      const response = await ticketAPI.getUserTickets();
      setTickets(response.data.tickets);
    } catch (error) {
      toast.error('Error al cargar boletos');
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
          <h1 className="text-3xl font-bold text-gray-900">Mis Boletos</h1>
          <p className="text-gray-600 mt-1">
            Historial completo de tus boletos de lotería
          </p>
        </div>

        {tickets.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {tickets.map((ticket) => (
              <div
                key={ticket._id}
                className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Boleto</p>
                    <p className="text-xl font-bold text-gray-900">
                      {ticket.ticketNumber}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                      ticket.status
                    )}`}
                  >
                    {getStatusText(ticket.status)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Números</p>
                    <p className="font-semibold text-gray-900">
                      {ticket.numbers.join(', ')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Precio</p>
                    <p className="font-semibold text-gray-900">
                      ${ticket.price}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Fecha de compra</p>
                    <p className="font-semibold text-gray-900">
                      {format(new Date(ticket.purchaseDate), 'PPP', {
                        locale: es,
                      })}
                    </p>
                  </div>
                  {ticket.prize && (
                    <div>
                      <p className="text-sm text-gray-600">Premio</p>
                      <p className="font-semibold text-green-600">
                        ${ticket.prize}
                      </p>
                    </div>
                  )}
                </div>

                {ticket.lotteryId && (
                  <div className="pt-4 border-t">
                    <p className="text-sm text-gray-600">Sorteo</p>
                    <p className="font-semibold text-gray-900">
                      {ticket.lotteryId.name}
                    </p>
                    {ticket.lotteryId.winningNumbers && (
                      <p className="text-sm text-gray-600 mt-1">
                        Números ganadores:{' '}
                        <span className="font-semibold">
                          {ticket.lotteryId.winningNumbers.join(', ')}
                        </span>
                      </p>
                    )}
                  </div>
                )}

                <div className="mt-4 pt-4 border-t">
                  <p className="text-xs text-gray-500">
                    Código de verificación: {ticket.verificationCode}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <p className="text-gray-500 text-lg">
              No tienes boletos aún. ¡Compra tu primer boleto!
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MyTickets;
