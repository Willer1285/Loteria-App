import { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { emailTemplateAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { Mail, Edit, Eye, Trash2, Plus, Power, X } from 'lucide-react';

const EMAIL_TEMPLATE_TYPES = [
  { value: 'welcome', label: 'Bienvenida', description: 'Enviado cuando un usuario se registra' },
  { value: 'ticket_purchase', label: 'Compra de Boleto', description: 'Confirmación de compra de boletos' },
  { value: 'password_reset', label: 'Recuperación de Contraseña', description: 'Email para restablecer contraseña' },
  { value: 'wallet_recharge', label: 'Recarga de Billetera', description: 'Confirmación de depósito' },
  { value: 'withdrawal', label: 'Retiro', description: 'Confirmación de retiro de fondos' },
  { value: 'prize_won', label: 'Premio Ganado', description: 'Notificación de premio ganado' },
  { value: 'lottery_result', label: 'Resultado de Sorteo', description: 'Resultados del sorteo' },
];

const EmailTemplates = () => {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const response = await emailTemplateAPI.getAll();
      setTemplates(response.data.templates || []);
    } catch (error) {
      toast.error('Error al cargar plantillas');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (type: string) => {
    try {
      await emailTemplateAPI.toggle(type);
      toast.success('Plantilla actualizada');
      loadTemplates();
    } catch (error) {
      toast.error('Error al actualizar plantilla');
    }
  };

  const handleDelete = async (type: string) => {
    if (!confirm('¿Estás seguro de eliminar esta plantilla?')) {
      return;
    }

    try {
      await emailTemplateAPI.delete(type);
      toast.success('Plantilla eliminada');
      loadTemplates();
    } catch (error) {
      toast.error('Error al eliminar plantilla');
    }
  };

  const getTemplateInfo = (type: string) => {
    return EMAIL_TEMPLATE_TYPES.find((t) => t.value === type);
  };

  const getTemplateStatus = (type: string) => {
    return templates.find((t) => t.type === type);
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
          <h1 className="text-3xl font-bold text-gray-900">
            Plantillas de Email
          </h1>
          <p className="text-gray-600 mt-1">
            Configura las plantillas de correo electrónico del sistema
          </p>
        </div>

        {/* Template Types Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {EMAIL_TEMPLATE_TYPES.map((templateInfo) => {
            const existingTemplate = getTemplateStatus(templateInfo.value);
            const isConfigured = !!existingTemplate;
            const isActive = existingTemplate?.isActive;

            return (
              <div
                key={templateInfo.value}
                className={`bg-white rounded-xl shadow-md p-6 border-2 transition-all ${
                  isActive
                    ? 'border-green-200'
                    : isConfigured
                    ? 'border-yellow-200'
                    : 'border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-3">
                    <div
                      className={`p-3 rounded-lg ${
                        isActive
                          ? 'bg-green-100'
                          : isConfigured
                          ? 'bg-yellow-100'
                          : 'bg-gray-100'
                      }`}
                    >
                      <Mail
                        className={
                          isActive
                            ? 'text-green-600'
                            : isConfigured
                            ? 'text-yellow-600'
                            : 'text-gray-600'
                        }
                        size={24}
                      />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">
                        {templateInfo.label}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {templateInfo.description}
                      </p>
                      <div className="mt-2">
                        {isConfigured ? (
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              isActive
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {isActive ? 'Activa' : 'Inactiva'}
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
                            No configurada
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {isConfigured ? (
                    <>
                      <button
                        onClick={() => setSelectedTemplate(existingTemplate)}
                        className="flex items-center space-x-1 px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                      >
                        <Eye size={16} />
                        <span>Ver</span>
                      </button>
                      <button
                        onClick={() => setEditingTemplate(existingTemplate)}
                        className="flex items-center space-x-1 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <Edit size={16} />
                        <span>Editar</span>
                      </button>
                      <button
                        onClick={() => handleToggleActive(templateInfo.value)}
                        className={`flex items-center space-x-1 px-3 py-2 text-sm rounded-lg transition-colors ${
                          isActive
                            ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                      >
                        <Power size={16} />
                        <span>{isActive ? 'Desactivar' : 'Activar'}</span>
                      </button>
                      <button
                        onClick={() => handleDelete(templateInfo.value)}
                        className="flex items-center space-x-1 px-3 py-2 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                      >
                        <Trash2 size={16} />
                        <span>Eliminar</span>
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => {
                        setEditingTemplate({
                          type: templateInfo.value,
                          subject: '',
                          htmlContent: '',
                          textContent: '',
                          isActive: true,
                        });
                      }}
                      className="flex items-center space-x-1 px-3 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      <Plus size={16} />
                      <span>Crear Plantilla</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Preview Modal */}
        {selectedTemplate && (
          <TemplatePreviewModal
            template={selectedTemplate}
            templateInfo={getTemplateInfo(selectedTemplate.type)!}
            onClose={() => setSelectedTemplate(null)}
          />
        )}

        {/* Edit Modal */}
        {editingTemplate && (
          <TemplateEditModal
            template={editingTemplate}
            templateInfo={getTemplateInfo(editingTemplate.type)!}
            onClose={() => setEditingTemplate(null)}
            onSuccess={() => {
              setEditingTemplate(null);
              loadTemplates();
            }}
          />
        )}
      </div>
    </AdminLayout>
  );
};

// Template Preview Modal
interface TemplatePreviewModalProps {
  template: any;
  templateInfo: any;
  onClose: () => void;
}

const TemplatePreviewModal: React.FC<TemplatePreviewModalProps> = ({
  template,
  templateInfo,
  onClose,
}) => {
  const [viewMode, setViewMode] = useState<'html' | 'text'>('html');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">
              {templateInfo.label}
            </h3>
            <p className="text-sm text-gray-600">{templateInfo.description}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Asunto:</p>
          <p className="text-gray-900 font-semibold">{template.subject}</p>
        </div>

        <div className="mb-4">
          <div className="flex space-x-2 mb-2">
            <button
              onClick={() => setViewMode('html')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                viewMode === 'html'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Vista HTML
            </button>
            <button
              onClick={() => setViewMode('text')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                viewMode === 'text'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Vista Texto
            </button>
          </div>

          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 min-h-64">
            {viewMode === 'html' ? (
              <div
                dangerouslySetInnerHTML={{ __html: template.htmlContent }}
                className="prose max-w-none"
              />
            ) : (
              <pre className="whitespace-pre-wrap text-sm text-gray-900">
                {template.textContent}
              </pre>
            )}
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
};

// Template Edit Modal
interface TemplateEditModalProps {
  template: any;
  templateInfo: any;
  onClose: () => void;
  onSuccess: () => void;
}

const TemplateEditModal: React.FC<TemplateEditModalProps> = ({
  template,
  templateInfo,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    subject: template.subject || '',
    htmlContent: template.htmlContent || '',
    textContent: template.textContent || '',
    isActive: template.isActive !== undefined ? template.isActive : true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await emailTemplateAPI.upsert(template.type, formData);
      toast.success('Plantilla guardada exitosamente');
      onSuccess();
    } catch (error) {
      toast.error('Error al guardar plantilla');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">
              Editar: {templateInfo.label}
            </h3>
            <p className="text-sm text-gray-600">{templateInfo.description}</p>
          </div>
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
              Asunto *
            </label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) =>
                setFormData({ ...formData, subject: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              placeholder="Bienvenido a nuestra plataforma"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contenido HTML *
            </label>
            <textarea
              value={formData.htmlContent}
              onChange={(e) =>
                setFormData({ ...formData, htmlContent: e.target.value })
              }
              rows={10}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 font-mono text-sm"
              placeholder="<h1>Hola {{firstName}}</h1><p>...</p>"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Usa variables como: {`{{firstName}}, {{lastName}}, {{email}}, {{amount}}, etc.`}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contenido de Texto *
            </label>
            <textarea
              value={formData.textContent}
              onChange={(e) =>
                setFormData({ ...formData, textContent: e.target.value })
              }
              rows={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 font-mono text-sm"
              placeholder="Hola {{firstName}}, ..."
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Versión de texto plano (fallback para clientes de email sin HTML)
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) =>
                setFormData({ ...formData, isActive: e.target.checked })
              }
              className="w-5 h-5 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
            />
            <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
              Activar esta plantilla
            </label>
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
              {loading ? 'Guardando...' : 'Guardar Plantilla'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmailTemplates;
