import { useState } from 'react';
import { lotteryAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { X, Shuffle, Edit3 } from 'lucide-react';

interface DrawLotteryModalProps {
  lottery: any;
  onClose: () => void;
  onSuccess: () => void;
}

const DrawLotteryModal: React.FC<DrawLotteryModalProps> = ({ lottery, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [selectionMode, setSelectionMode] = useState<'random' | 'manual'>('random');
  const [manualNumbers, setManualNumbers] = useState<string>('');

  const handleDraw = async () => {
    if (selectionMode === 'manual') {
      // Validar números manuales
      const numbers = manualNumbers.split(',').map(n => n.trim());

      if (numbers.length === 0) {
        toast.error('Debes ingresar al menos un número ganador');
        return;
      }

      // Validar que todos sean números válidos
      const validNumbers = numbers.every(n => !isNaN(Number(n)));
      if (!validNumbers) {
        toast.error('Todos los valores deben ser números válidos');
        return;
      }

      // Validar que estén dentro del rango
      const min = lottery.numbersRange?.min || 0;
      const max = lottery.numbersRange?.max || lottery.maxTickets - 1;
      const inRange = numbers.every(n => {
        const num = Number(n);
        return num >= min && num <= max;
      });

      if (!inRange) {
        toast.error(`Los números deben estar entre ${min} y ${max}`);
        return;
      }
    }

    if (!confirm('¿Estás seguro de realizar el sorteo? Esta acción no se puede deshacer.')) {
      return;
    }

    setLoading(true);

    try {
      const payload: any = {
        lotteryId: lottery._id,
      };

      if (selectionMode === 'manual') {
        payload.manualWinningNumbers = manualNumbers.split(',').map(n => Number(n.trim()));
      }

      await lotteryAPI.draw(lottery._id, payload);
      toast.success('Sorteo realizado exitosamente');
      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al realizar sorteo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Realizar Sorteo</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-6">
          {/* Lottery Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">{lottery.name}</h3>
            <p className="text-sm text-gray-600">Control: {lottery.controlNumber}</p>
            <p className="text-sm text-gray-600">
              Boletos vendidos: {lottery.soldTickets}/{lottery.maxTickets}
            </p>
          </div>

          {/* Selection Mode */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Modo de Selección de Ganadores
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setSelectionMode('random')}
                className={`flex items-center justify-center space-x-2 px-4 py-3 rounded-lg border-2 transition-all ${
                  selectionMode === 'random'
                    ? 'border-primary-600 bg-primary-50 text-primary-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Shuffle size={20} />
                <span className="font-semibold">Aleatorio</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectionMode('manual')}
                className={`flex items-center justify-center space-x-2 px-4 py-3 rounded-lg border-2 transition-all ${
                  selectionMode === 'manual'
                    ? 'border-primary-600 bg-primary-50 text-primary-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Edit3 size={20} />
                <span className="font-semibold">Manual</span>
              </button>
            </div>
          </div>

          {/* Manual Number Input */}
          {selectionMode === 'manual' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Números Ganadores (separados por comas)
              </label>
              <input
                type="text"
                value={manualNumbers}
                onChange={(e) => setManualNumbers(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="Ej: 1234, 5678, 9012"
              />
              <p className="text-xs text-gray-500 mt-2">
                Rango válido: {lottery.numbersRange?.min || 0} - {lottery.numbersRange?.max || lottery.maxTickets - 1}
              </p>
              <p className="text-xs font-semibold text-primary-700 mt-1">
                Se necesitan {lottery.prizes?.length || 0} números (1 por cada premio)
              </p>
            </div>
          )}

          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              {selectionMode === 'random' ? (
                <>
                  Se seleccionarán {lottery.prizes?.length || 0} números ganadores aleatoriamente
                  (1 por cada premio). El primer número corresponderá al {lottery.prizes?.[0]?.name || '1er Premio'},
                  el segundo al {lottery.prizes?.[1]?.name || '2do Premio'}, y así sucesivamente.
                </>
              ) : (
                <>
                  Ingresa {lottery.prizes?.length || 0} números ganadores separados por comas
                  (1 por cada premio). El primer número será para el {lottery.prizes?.[0]?.name || '1er Premio'},
                  el segundo para el {lottery.prizes?.[1]?.name || '2do Premio'}, etc.
                </>
              )}
            </p>
          </div>

          {/* Warning */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm font-semibold text-yellow-800">
              ⚠️ Esta acción es irreversible
            </p>
            <p className="text-sm text-yellow-700 mt-1">
              Una vez realizado el sorteo, no se podrá modificar. Los ganadores serán notificados
              y los premios serán acreditados automáticamente.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              onClick={handleDraw}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Procesando...' : 'Realizar Sorteo'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DrawLotteryModal;
