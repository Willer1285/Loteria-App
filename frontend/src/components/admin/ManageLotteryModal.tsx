import { X } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ManageLotteryModalProps {
  lottery: any;
  onClose: () => void;
  onSuccess: () => void;
}

const ManageLotteryModal: React.FC<ManageLotteryModalProps> = ({
  lottery,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Detalles del Sorteo
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Nombre</p>
              <p className="font-semibold text-gray-900">{lottery.name}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600">Estado</p>
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                  lottery.status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : lottery.status === 'completed'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {lottery.status}
              </span>
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-600">Descripción</p>
            <p className="text-gray-900">{lottery.description}</p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Precio por Boleto</p>
              <p className="font-semibold text-gray-900">
                ${lottery.ticketPrice}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-600">Premio Total</p>
              <p className="font-semibold text-green-600">
                ${lottery.totalPrize}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-600">Fecha del Sorteo</p>
              <p className="font-semibold text-gray-900">
                {format(new Date(lottery.drawDate), 'PPP', { locale: es })}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Boletos Vendidos</p>
              <p className="font-semibold text-gray-900">
                {lottery.soldTickets} / {lottery.maxTickets}
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="bg-primary-600 h-2 rounded-full"
                  style={{
                    width: `${(lottery.soldTickets / lottery.maxTickets) * 100}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-600">Rango de Números</p>
              <p className="font-semibold text-gray-900">
                {lottery.numbersRange.min} - {lottery.numbersRange.max} (
                {lottery.numbersRange.count} números)
              </p>
            </div>
          </div>

          {lottery.winningNumbers && lottery.winningNumbers.length > 0 && (
            <div>
              <p className="text-sm text-gray-600 mb-2">Números Ganadores</p>
              <div className="flex space-x-2">
                {lottery.winningNumbers.map((num: number, idx: number) => (
                  <div
                    key={idx}
                    className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-lg"
                  >
                    {num}
                  </div>
                ))}
              </div>
            </div>
          )}

          {lottery.winners && lottery.winners.length > 0 && (
            <div>
              <p className="text-sm text-gray-600 mb-3">Ganadores</p>
              <div className="space-y-2">
                {lottery.winners.map((winner: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-semibold text-gray-900">
                        Posición #{winner.position}
                      </p>
                      {winner.userId && (
                        <p className="text-sm text-gray-600">
                          {winner.userId.firstName} {winner.userId.lastName}
                        </p>
                      )}
                    </div>
                    <p className="font-bold text-green-600">
                      ${winner.prize}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {lottery.prizeDistribution && lottery.prizeDistribution.length > 0 && (
            <div>
              <p className="text-sm text-gray-600 mb-3">Distribución de Premios</p>
              <div className="space-y-2">
                {lottery.prizeDistribution.map((prize: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center p-2 bg-gray-50 rounded"
                  >
                    <span className="text-sm text-gray-700">
                      Posición {prize.position} ({prize.percentage}%)
                    </span>
                    <span className="font-semibold text-gray-900">
                      ${prize.amount}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-4 border-t">
            <button
              onClick={onClose}
              className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageLotteryModal;
