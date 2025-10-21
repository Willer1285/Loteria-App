import { useState, useEffect, useRef } from 'react';
import { lotteryAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { X, Plus, Trash2, Image as ImageIcon } from 'lucide-react';

interface EditLotteryModalProps {
  lottery: any;
  onClose: () => void;
  onSuccess: () => void;
}

const EditLotteryModal: React.FC<EditLotteryModalProps> = ({ lottery, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    lotteryName: '',
    description: '',
    image: '',
    ticketPrice: '',
    drawDate: '',
    maxTickets: '',
    maxTicketsPerPlayer: '0',
    selectionType: 'both' as 'manual' | 'random' | 'both',
  });

  const [prizes, setPrizes] = useState([
    { name: '1er Premio', amount: '', position: 1 },
  ]);

  const [randomButtons, setRandomButtons] = useState<number[]>([5, 10, 50]);
  const [newRandomButton, setNewRandomButton] = useState('');

  useEffect(() => {
    if (lottery) {
      const drawDate = new Date(lottery.drawDate);
      const formattedDate = drawDate.toISOString().slice(0, 16);

      setFormData({
        name: lottery.name || '',
        lotteryName: lottery.lotteryName || '',
        description: lottery.description || '',
        image: lottery.image || '',
        ticketPrice: lottery.ticketPrice?.toString() || '',
        drawDate: formattedDate || '',
        maxTickets: lottery.maxTickets?.toString() || '',
        maxTicketsPerPlayer: lottery.maxTicketsPerPlayer?.toString() || '0',
        selectionType: lottery.selectionType || 'both',
      });

      if (lottery.image) {
        setImagePreview(lottery.image);
      }

      if (lottery.prizes && lottery.prizes.length > 0) {
        setPrizes(lottery.prizes.map((p: any) => ({
          name: p.name,
          amount: p.amount.toString(),
          position: p.position,
        })));
      }

      if (lottery.randomButtons && lottery.randomButtons.length > 0) {
        setRandomButtons(lottery.randomButtons);
      }
    }
  }, [lottery]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('La imagen no debe superar 5MB');
        return;
      }

      if (!file.type.startsWith('image/')) {
        toast.error('Solo se permiten archivos de imagen');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImagePreview(base64String);
        setFormData({ ...formData, image: base64String });
      };
      reader.readAsDataURL(file);
    }
  };

  const addPrize = () => {
    setPrizes([
      ...prizes,
      { name: `${prizes.length + 1}${prizes.length === 0 ? 'er' : prizes.length === 1 ? 'do' : 'to'} Premio`, amount: '', position: prizes.length + 1 },
    ]);
  };

  const removePrize = (index: number) => {
    setPrizes(prizes.filter((_, i) => i !== index));
  };

  const updatePrize = (index: number, field: string, value: string) => {
    const updated = [...prizes];
    updated[index] = { ...updated[index], [field]: value };
    setPrizes(updated);
  };

  const addRandomButton = () => {
    if (newRandomButton && !isNaN(Number(newRandomButton))) {
      setRandomButtons([...randomButtons, Number(newRandomButton)]);
      setNewRandomButton('');
    }
  };

  const removeRandomButton = (index: number) => {
    setRandomButtons(randomButtons.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones
    if (prizes.some(p => !p.amount || parseFloat(p.amount) <= 0)) {
      toast.error('Todos los premios deben tener un monto válido');
      return;
    }

    if (formData.selectionType === 'random' && randomButtons.length === 0) {
      toast.error('Debe configurar al menos un botón de selección al azar');
      return;
    }

    setLoading(true);

    try {
      await lotteryAPI.update(lottery._id, {
        name: formData.name,
        lotteryName: formData.lotteryName,
        description: formData.description,
        image: formData.image,
        ticketPrice: parseFloat(formData.ticketPrice),
        drawDate: formData.drawDate,
        maxTickets: parseInt(formData.maxTickets),
        maxTicketsPerPlayer: parseInt(formData.maxTicketsPerPlayer),
        prizes: prizes.map(p => ({
          name: p.name,
          amount: parseFloat(p.amount),
          position: p.position,
        })),
        numbersRange: {
          min: 0,
          max: parseInt(formData.maxTickets) - 1,
          count: 1,
        },
        selectionType: formData.selectionType,
        randomButtons: formData.selectionType !== 'manual' ? randomButtons.sort((a, b) => a - b) : [],
      });

      toast.success('Sorteo actualizado exitosamente');
      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al actualizar sorteo');
    } finally {
      setLoading(false);
    }
  };

  // No permitir editar si ya hay boletos vendidos
  const hasTicketsSold = lottery.soldTickets > 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-xl p-6 max-w-4xl w-full my-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Editar Sorteo</h2>
            <p className="text-sm text-gray-600 mt-1">
              Control: {lottery.controlNumber}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {hasTicketsSold && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              <strong>Advertencia:</strong> Este sorteo tiene {lottery.soldTickets} boletos vendidos.
              La edición está limitada para proteger las compras existentes.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Imagen del Sorteo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Imagen del Sorteo
            </label>
            <div className="flex items-center space-x-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-40 h-40 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-primary-500 transition-colors overflow-hidden"
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center">
                    <ImageIcon className="mx-auto text-gray-400" size={40} />
                    <p className="text-xs text-gray-500 mt-2">Click para cargar</p>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              <div className="flex-1">
                <p className="text-sm text-gray-600">
                  Formatos: JPG, PNG, GIF
                </p>
                <p className="text-sm text-gray-600">
                  Tamaño máximo: 5MB
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                Lotería *
              </label>
              <input
                type="text"
                name="lotteryName"
                value={formData.lotteryName}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Precio del Boleto *
              </label>
              <input
                type="number"
                name="ticketPrice"
                value={formData.ticketPrice}
                onChange={handleChange}
                step="0.01"
                min="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                required
                disabled={hasTicketsSold}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cantidad de Boletos *
              </label>
              <input
                type="number"
                name="maxTickets"
                value={formData.maxTickets}
                onChange={handleChange}
                min="1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                required
                disabled={hasTicketsSold}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Máx. Boletos por Jugador
              </label>
              <input
                type="number"
                name="maxTicketsPerPlayer"
                value={formData.maxTicketsPerPlayer}
                onChange={handleChange}
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
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

          {/* Premios */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">Premios</h3>
              <button
                type="button"
                onClick={addPrize}
                className="flex items-center space-x-1 px-3 py-1 text-sm bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 transition-colors"
                disabled={hasTicketsSold}
              >
                <Plus size={16} />
                <span>Agregar Premio</span>
              </button>
            </div>
            <div className="space-y-3">
              {prizes.map((prize, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <input
                    type="text"
                    value={prize.name}
                    onChange={(e) => updatePrize(index, 'name', e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    required
                  />
                  <input
                    type="number"
                    value={prize.amount}
                    onChange={(e) => updatePrize(index, 'amount', e.target.value)}
                    className="w-40 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    step="0.01"
                    min="0.01"
                    required
                    disabled={hasTicketsSold}
                  />
                  {prizes.length > 1 && !hasTicketsSold && (
                    <button
                      type="button"
                      onClick={() => removePrize(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Configuración de Selección */}
          <div className="border-t pt-4">
            <h3 className="font-semibold text-gray-900 mb-3">
              Configuración de Selección
            </h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Selección *
              </label>
              <select
                name="selectionType"
                value={formData.selectionType}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                required
              >
                <option value="manual">Solo Selección Manual</option>
                <option value="random">Solo Selección Al Azar</option>
                <option value="both">Ambas Opciones</option>
              </select>
            </div>

            {formData.selectionType !== 'manual' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Botones de Selección Al Azar
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {randomButtons.map((num, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-1 px-3 py-1 bg-primary-100 text-primary-700 rounded-lg"
                    >
                      <span>{num} boletos</span>
                      <button
                        type="button"
                        onClick={() => removeRandomButton(index)}
                        className="ml-2 text-primary-900 hover:text-red-600"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    value={newRandomButton}
                    onChange={(e) => setNewRandomButton(e.target.value)}
                    className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="Cantidad"
                    min="1"
                  />
                  <button
                    type="button"
                    onClick={addRandomButton}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Agregar
                  </button>
                </div>
              </div>
            )}
          </div>

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
