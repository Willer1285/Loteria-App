import { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { settingsAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { Save, Plus, Edit, Trash2, Image as ImageIcon, QrCode } from 'lucide-react';

interface PaymentMethod {
  label: string;
  value: string;
  icon?: string;
  qrCode?: string;
}

const Settings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<any>(null);
  const [formData, setFormData] = useState({
    appName: '',
    logo: '',
    logoCollapsed: '',
    currency: 'USD',
    timezone: 'America/New_York',
  });
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [editingPayment, setEditingPayment] = useState<{ index: number; method: PaymentMethod } | null>(null);
  const [showAddPayment, setShowAddPayment] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await settingsAPI.get();
      const data = response.data.settings;
      setSettings(data);
      setFormData({
        appName: data.appName || '',
        logo: data.logo || '',
        logoCollapsed: data.logoCollapsed || '',
        currency: data.currency || 'USD',
        timezone: data.timezone || 'America/New_York',
      });
      setPaymentMethods(data.paymentMethods || []);
    } catch (error) {
      toast.error('Error al cargar configuración');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      await settingsAPI.update(formData);
      toast.success('Configuración guardada exitosamente');
      loadSettings();
    } catch (error) {
      toast.error('Error al guardar configuración');
    } finally {
      setSaving(false);
    }
  };

  const handleAddPaymentMethod = async (method: PaymentMethod) => {
    try {
      await settingsAPI.addPaymentMethod(method);
      toast.success('Método de pago agregado');
      setShowAddPayment(false);
      loadSettings();
    } catch (error) {
      toast.error('Error al agregar método de pago');
    }
  };

  const handleUpdatePaymentMethod = async (index: number, method: PaymentMethod) => {
    try {
      await settingsAPI.updatePaymentMethod(index, method);
      toast.success('Método de pago actualizado');
      setEditingPayment(null);
      loadSettings();
    } catch (error) {
      toast.error('Error al actualizar método de pago');
    }
  };

  const handleDeletePaymentMethod = async (index: number) => {
    if (!confirm('¿Estás seguro de eliminar este método de pago?')) {
      return;
    }

    try {
      await settingsAPI.deletePaymentMethod(index);
      toast.success('Método de pago eliminado');
      loadSettings();
    } catch (error) {
      toast.error('Error al eliminar método de pago');
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Configuración</h1>
          <p className="text-gray-600 mt-1">
            Administra la configuración general de la aplicación
          </p>
        </div>

        {/* General Settings */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Configuración General</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre de la Aplicación
              </label>
              <input
                type="text"
                name="appName"
                value={formData.appName}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="Mi Lotería"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Moneda
                </label>
                <select
                  name="currency"
                  value={formData.currency}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="USD">USD - Dólar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="MXN">MXN - Peso Mexicano</option>
                  <option value="COP">COP - Peso Colombiano</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Zona Horaria
                </label>
                <select
                  name="timezone"
                  value={formData.timezone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="America/New_York">America/New_York</option>
                  <option value="America/Los_Angeles">America/Los_Angeles</option>
                  <option value="America/Chicago">America/Chicago</option>
                  <option value="America/Mexico_City">America/Mexico_City</option>
                  <option value="America/Bogota">America/Bogota</option>
                </select>
              </div>
            </div>

            <div className="pt-4 border-t">
              <button
                onClick={handleSaveSettings}
                disabled={saving}
                className="flex items-center space-x-2 px-6 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50"
              >
                <Save size={20} />
                <span>{saving ? 'Guardando...' : 'Guardar Configuración'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Logo Configuration */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Configuración de Logo</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Logo Normal
              </label>
              <input
                type="url"
                name="logo"
                value={formData.logo}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="https://ejemplo.com/logo.png"
              />
              {formData.logo && (
                <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <p className="text-xs text-gray-500 mb-2">Vista previa:</p>
                  <img
                    src={formData.logo}
                    alt="Logo"
                    className="h-12 object-contain"
                    onError={(e) => {
                      e.currentTarget.src = 'https://via.placeholder.com/150?text=Logo';
                    }}
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Logo Contraído (Sidebar)
              </label>
              <input
                type="url"
                name="logoCollapsed"
                value={formData.logoCollapsed}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="https://ejemplo.com/logo-small.png"
              />
              {formData.logoCollapsed && (
                <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <p className="text-xs text-gray-500 mb-2">Vista previa:</p>
                  <img
                    src={formData.logoCollapsed}
                    alt="Logo Contraído"
                    className="h-8 object-contain"
                    onError={(e) => {
                      e.currentTarget.src = 'https://via.placeholder.com/50?text=L';
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t mt-6">
            <button
              onClick={handleSaveSettings}
              disabled={saving}
              className="flex items-center space-x-2 px-6 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50"
            >
              <Save size={20} />
              <span>{saving ? 'Guardando...' : 'Guardar Logos'}</span>
            </button>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Métodos de Pago</h2>
            <button
              onClick={() => setShowAddPayment(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors"
            >
              <Plus size={18} />
              <span>Agregar Método</span>
            </button>
          </div>

          <div className="space-y-4">
            {paymentMethods.map((method, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      {method.icon && (
                        <img
                          src={method.icon}
                          alt={method.label}
                          className="w-8 h-8 object-contain"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      )}
                      <div>
                        <h3 className="font-semibold text-gray-900">{method.label}</h3>
                        <p className="text-sm text-gray-600">{method.value}</p>
                      </div>
                    </div>
                    {method.qrCode && (
                      <div className="mt-2">
                        <img
                          src={method.qrCode}
                          alt="QR Code"
                          className="w-24 h-24 object-contain border border-gray-200 rounded"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => setEditingPayment({ index, method })}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDeletePaymentMethod(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {paymentMethods.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No hay métodos de pago configurados
              </div>
            )}
          </div>
        </div>

        {/* Add/Edit Payment Method Modal */}
        {(showAddPayment || editingPayment) && (
          <PaymentMethodModal
            method={editingPayment?.method}
            onClose={() => {
              setShowAddPayment(false);
              setEditingPayment(null);
            }}
            onSave={(method) => {
              if (editingPayment) {
                handleUpdatePaymentMethod(editingPayment.index, method);
              } else {
                handleAddPaymentMethod(method);
              }
            }}
          />
        )}
      </div>
    </AdminLayout>
  );
};

// Payment Method Modal Component
interface PaymentMethodModalProps {
  method?: PaymentMethod;
  onClose: () => void;
  onSave: (method: PaymentMethod) => void;
}

const PaymentMethodModal: React.FC<PaymentMethodModalProps> = ({ method, onClose, onSave }) => {
  const [formData, setFormData] = useState<PaymentMethod>({
    label: method?.label || '',
    value: method?.value || '',
    icon: method?.icon || '',
    qrCode: method?.qrCode || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full">
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          {method ? 'Editar' : 'Agregar'} Método de Pago
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre del Método *
            </label>
            <input
              type="text"
              value={formData.label}
              onChange={(e) => setFormData({ ...formData, label: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              placeholder="Ej: PayPal, Transferencia Bancaria"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Valor/Cuenta *
            </label>
            <input
              type="text"
              value={formData.value}
              onChange={(e) => setFormData({ ...formData, value: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              placeholder="Ej: usuario@paypal.com, Cuenta 123456"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL del Icono (opcional)
            </label>
            <div className="relative">
              <ImageIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="url"
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="https://ejemplo.com/icon.png"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL del Código QR (opcional)
            </label>
            <div className="relative">
              <QrCode className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="url"
                value={formData.qrCode}
                onChange={(e) => setFormData({ ...formData, qrCode: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="https://ejemplo.com/qr.png"
              />
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors"
            >
              {method ? 'Actualizar' : 'Agregar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings;
