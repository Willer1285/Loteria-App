import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [resetToken, setResetToken] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error('Por favor ingresa tu correo electrónico');
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.forgotPassword(email);
      setSubmitted(true);

      // SOLO PARA DESARROLLO - En producción esto no vendría en la respuesta
      if (response.data.resetToken) {
        setResetToken(response.data.resetToken);
        toast.success('Token generado (modo desarrollo)');
      } else {
        toast.success('Se ha enviado un enlace a tu correo electrónico');
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.error ||
          'Error al procesar solicitud. Inténtalo de nuevo.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
            <Mail className="text-primary-600" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ¿Olvidaste tu contraseña?
          </h1>
          <p className="text-gray-600">
            No te preocupes, te ayudaremos a recuperarla
          </p>
        </div>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Correo Electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="tu@email.com"
                required
              />
              <p className="text-sm text-gray-500 mt-2">
                Ingresa el correo electrónico asociado a tu cuenta
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Enviando...' : 'Enviar Enlace de Recuperación'}
            </button>

            <Link
              to="/login"
              className="flex items-center justify-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Volver al inicio de sesión</span>
            </Link>
          </form>
        ) : (
          <div className="text-center space-y-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <CheckCircle className="text-green-600" size={32} />
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                ¡Solicitud Enviada!
              </h2>
              <p className="text-gray-600 mb-4">
                Si existe una cuenta con el correo <strong>{email}</strong>,
                recibirás un enlace para restablecer tu contraseña.
              </p>
              <p className="text-sm text-gray-500">
                Revisa tu bandeja de entrada y carpeta de spam.
              </p>
            </div>

            {/* SOLO PARA DESARROLLO */}
            {resetToken && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm font-semibold text-yellow-800 mb-2">
                  🔧 Modo Desarrollo
                </p>
                <p className="text-xs text-yellow-700 mb-2">
                  Token de recuperación:
                </p>
                <code className="block bg-white px-3 py-2 rounded text-xs break-all">
                  {resetToken}
                </code>
                <Link
                  to={`/reset-password/${resetToken}`}
                  className="inline-block mt-3 px-4 py-2 bg-yellow-600 text-white rounded-lg text-sm hover:bg-yellow-700 transition-colors"
                >
                  Usar este token →
                </Link>
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={() => {
                  setSubmitted(false);
                  setEmail('');
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Intentar con otro correo
              </button>

              <Link
                to="/login"
                className="block w-full px-4 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors text-center"
              >
                Volver al inicio de sesión
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
