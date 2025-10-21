import { useState, useEffect } from 'react';
import { lotteryAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { X } from 'lucide-react';

interface EditLotteryModalProps {
  lottery: any;
  onClose: () => void;
  onSuccess: () => void;
}

const EditLotteryModal: React.FC<EditLotteryModalProps> = ({ lottery, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    controlNumber: '',
    name: '',
    description: '',
    image: '',
    ticketPrice: '',
    drawDate: '',
    maxTickets: '',
    numbersMin: '1',
    numbersMax: '50',
    numbersCount: '6',
  });

  useEffect(() => {
    if (lottery) {
      // Format the draw date for datetime-local input
      const drawDate = new Date(lottery.drawDate);
      const formattedDate = drawDate.toISOString().slice(0, 16);

      setFormData({
        controlNumber: lottery.controlNumber || '',
        name: lottery.name || '',
        description: lottery.description || '',
        image: lottery.image || '',
        ticketPrice: lottery.ticketPrice?.toString() || '',
        drawDate: formattedDate || '',
        maxTickets: lottery.maxTickets?.toString() || '',
        numbersMin: lottery.numbersRange?.min?.toString() || '1',
        numbersMax: lottery.numbersRange?.max?.toString() || '50',
        numbersCount: lottery.numbersRange?.count?.toString() || '6',
      });
    }
  }, [lottery]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await lotteryAPI.update(lottery._id, {
        controlNumber: formData.controlNumber,
        name: formData.name,
        description: formData.description,
        image: formData.image || undefined,
        ticketPrice: parseFloat(formData.ticketPrice),
        drawDate: formData.drawDate,
        maxTickets: parseInt(formData.maxTickets),
        numbersRange: {
          min: parseInt(formData.numbersMin),
          max: parseInt(formData.numbersMax),
          count: parseInt(formData.numbersCount),
        },
      });

      toast.success('Sorteo actualizado exitosamente');
      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al actualizar sorteo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Editar Sorteo</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Número de Control *
            </label>
            <input
              type="text"
              name="controlNumber"
              value={formData.controlNumber}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              placeholder="Ej: LOT-2024-001"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre del Sorteo *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL de Imagen (opcional)
            </label>
            <input
              type="url"
              name="image"
              value={formData.image}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              placeholder="https://ejemplo.com/imagen.jpg"
            />
            <p className="text-xs text-gray-500 mt-1">
              URL de la imagen promocional del sorteo
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Precio por Boleto *
              </label>
              <input
                type="number"
                name="ticketPrice"
                value={formData.ticketPrice}
                onChange={handleChange}
                step="0.01"
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Máximo de Boletos *
              </label>
              <input
                type="number"
                name="maxTickets"
                value={formData.maxTickets}
                onChange={handleChange}
                min="1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha y Hora del Sorteo *
            </label>
            <input
              type="datetime-local"
              name="drawDate"
              value={formData.drawDate}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold text-gray-900 mb-3">
              Configuración de Números
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número Mínimo
                </label>
                <input
                  type="number"
                  name="numbersMin"
                  value={formData.numbersMin}
                  onChange={handleChange}
                  min="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número Máximo
                </label>
                <input
                  type="number"
                  name="numbersMax"
                  value={formData.numbersMax}
                  onChange={handleChange}
                  min="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cantidad de Números
                </label>
                <input
                  type="number"
                  name="numbersCount"
                  value={formData.numbersCount}
                  onChange={handleChange}
                  min="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              <strong>Nota:</strong> Solo puedes editar sorteos activos que no tengan boletos vendidos.
            </p>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Actualizando...' : 'Actualizar Sorteo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditLotteryModal;
