import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';
import { Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';

const ResetPassword = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [email, setEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  useEffect(() => {
    verifyToken();
  }, [token]);

  const verifyToken = async () => {
    if (!token) {
      toast.error('Token inválido');
      navigate('/login');
      return;
    }

    try {
      const response = await authAPI.verifyResetToken(token);
      if (response.data.valid) {
        setTokenValid(true);
        setEmail(response.data.email);
      } else {
        toast.error('El enlace ha expirado o es inválido');
        setTimeout(() => navigate('/forgot-password'), 2000);
      }
    } catch (error: any) {
      toast.error('El enlace ha expirado o es inválido');
      setTimeout(() => navigate('/forgot-password'), 2000);
    } finally {
      setVerifying(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);

    try {
      await authAPI.resetPassword(token!, newPassword);
      toast.success('Contraseña actualizada exitosamente');
      setResetSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (error: any) {
      toast.error(
        error.response?.data?.error ||
          'Error al resetear contraseña. Inténtalo de nuevo.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (verifying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando enlace...</p>
        </div>
      </div>
    );
  }

  if (!tokenValid) {
    return null; // Ya redirigimos en el useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        {!resetSuccess ? (
          <>
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
                <Lock className="text-primary-600" size={32} />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Crear Nueva Contraseña
              </h1>
              <p className="text-gray-600">Para la cuenta: {email}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nueva Contraseña
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent pr-12"
                    placeholder="Mínimo 6 caracteres"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmar Contraseña
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent pr-12"
                    placeholder="Repite la contraseña"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {newPassword && confirmPassword && (
                <div
                  className={`text-sm ${
                    newPassword === confirmPassword
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
                >
                  {newPassword === confirmPassword
                    ? '✓ Las contraseñas coinciden'
                    : '✗ Las contraseñas no coinciden'}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Actualizando...' : 'Restablecer Contraseña'}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center space-y-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <CheckCircle className="text-green-600" size={32} />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                ¡Contraseña Actualizada!
              </h2>
              <p className="text-gray-600">
                Tu contraseña ha sido restablecida exitosamente.
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Redirigiendo al inicio de sesión...
              </p>
            </div>

            <Link
              to="/login"
              className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors"
            >
              Iniciar Sesión Ahora
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
