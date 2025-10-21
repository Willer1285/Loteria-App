import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Ticket, User, LogIn } from 'lucide-react';

interface PublicLayoutProps {
  children: React.ReactNode;
}

const PublicLayout: React.FC<PublicLayoutProps> = ({ children }) => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Public Header */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <Ticket className="text-primary-600" size={32} />
              <div>
                <h1 className="text-2xl font-bold text-primary-600">Lotería App</h1>
                <p className="text-xs text-gray-600">Tu suerte te espera</p>
              </div>
            </Link>

            {/* Navigation */}
            <nav className="flex items-center space-x-6">
              <Link
                to="/"
                className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
              >
                Sorteos
              </Link>

              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    <User size={20} />
                    <span>Mi Cuenta</span>
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 font-medium transition-colors"
                  >
                    <LogIn size={20} />
                    <span>Iniciar Sesión</span>
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
                  >
                    Registrarse
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-bold text-gray-900 mb-4">Lotería App</h3>
              <p className="text-gray-600 text-sm">
                La plataforma de loterías más confiable. Juega de forma segura y transparente.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-4">Enlaces Rápidos</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/" className="text-gray-600 hover:text-primary-600">
                    Sorteos Activos
                  </Link>
                </li>
                {!user && (
                  <>
                    <li>
                      <Link to="/register" className="text-gray-600 hover:text-primary-600">
                        Registrarse
                      </Link>
                    </li>
                    <li>
                      <Link to="/login" className="text-gray-600 hover:text-primary-600">
                        Iniciar Sesión
                      </Link>
                    </li>
                  </>
                )}
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-4">Información</h3>
              <p className="text-gray-600 text-sm">
                Todos los sorteos son verificables y transparentes. Los premios se pagan automáticamente.
              </p>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-gray-600 text-sm">
            <p>&copy; 2024 Lotería App. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
