import { X, Calendar, DollarSign, Ticket, Hash, Trophy, Info } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useState } from 'react';

interface PurchaseDetailModalProps {
  purchase: {
    lottery Name: string;
    lotteryControlNumber: string;
    ticketPrice: number;
    purchaseDate: Date;
    tickets: any[];
    totalAmount: number;
    quantity: number;
    status: string;
  };
  onClose: () => void;
}

const PurchaseDetailModal: React.FC<PurchaseDetailModalProps> = ({ purchase, onClose }) => {
  const [showNumbers, setShowNumbers] = useState(false);

  // Extraer todos los números comprados
  const allNumbers = purchase.tickets.map(t => t.numbers[0]).sort((a, b) => a - b);

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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              Detalle de Compra
            </h2>
            <p className="text-sm text-gray-600">
              {purchase.lotteryName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Status Badge */}
        <div className="mb-6">
          <span
            className={`inline-flex px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(
              purchase.status
            )}`}
          >
            Estado: {getStatusText(purchase.status)}
          </span>
        </div>

        {/* Purchase Information */}
        <div className="bg-gray-50 rounded-xl p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
            <Info className="mr-2" size={20} />
            Información de la Compra
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start space-x-3">
              <Trophy className="text-primary-600 mt-1" size={20} />
              <div>
                <p className="text-sm text-gray-600">Sorteo</p>
                <p className="font-semibold text-gray-900">{purchase.lotteryName}</p>
                <p className="text-xs text-gray-500">Control: {purchase.lotteryControlNumber}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Calendar className="text-gray-400 mt-1" size={20} />
              <div>
                <p className="text-sm text-gray-600">Fecha de Compra</p>
                <p className="font-semibold text-gray-900">
                  {format(purchase.purchaseDate, 'PPP', { locale: es })}
                </p>
                <p className="text-xs text-gray-500">
                  {format(purchase.purchaseDate, 'p', { locale: es })}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Ticket className="text-gray-400 mt-1" size={20} />
              <div>
                <p className="text-sm text-gray-600">Precio por Boleto</p>
                <p className="font-semibold text-gray-900">
                  ${purchase.ticketPrice.toFixed(2)}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Hash className="text-gray-400 mt-1" size={20} />
              <div>
                <p className="text-sm text-gray-600">Cantidad de Boletos</p>
                <p className="font-semibold text-gray-900">
                  {purchase.quantity} boletos
                </p>
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
                ${purchase.totalAmount.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Numbers Board */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-900 flex items-center">
              <Hash className="mr-2" size={20} />
              Números Comprados ({allNumbers.length})
            </h3>
            <button
              onClick={() => setShowNumbers(!showNumbers)}
              className="text-primary-600 hover:text-primary-700 font-semibold text-sm"
            >
              {showNumbers ? 'Ocultar' : 'Mostrar'} Números
            </button>
          </div>

          {showNumbers && (
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="grid grid-cols-8 md:grid-cols-10 gap-2 max-h-96 overflow-y-auto">
                {allNumbers.map((num, idx) => {
                  const ticket = purchase.tickets.find(t => t.numbers[0] === num);
                  const isWinner = ticket?.status === 'won';
                  const padding = Math.max(...allNumbers).toString().length;

                  return (
                    <div
                      key={idx}
                      className={`px-3 py-2 rounded-lg text-center font-mono text-sm font-bold transition-all ${
                        isWinner
                          ? 'bg-green-600 text-white shadow-lg animate-pulse'
                          : 'bg-white text-gray-900 border-2 border-primary-200'
                      }`}
                      title={isWinner ? '¡Número Ganador!' : `Número ${num}`}
                    >
                      {num.toString().padStart(padding, '0')}
                    </div>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="mt-4 flex items-center justify-center space-x-6 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-white border-2 border-primary-200 rounded"></div>
                  <span className="text-gray-700">Tus Números</span>
                </div>
                {purchase.tickets.some(t => t.status === 'won') && (
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-green-600 rounded"></div>
                    <span className="text-gray-700">Ganador</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Close Button */}
        <div className="mt-6 pt-4 border-t">
          <button
            onClick={onClose}
            className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default PurchaseDetailModal;
