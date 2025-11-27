import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Home,
  Ticket,
  ShoppingBag,
  DollarSign,
  Trophy,
  User as UserIcon,
  LogOut,
  Shield,
  CheckCircle,
  Globe,
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Opciones base para todos los usuarios
  const baseNavItems = [
    { path: '/dashboard', label: 'Dashboard', icon: Home },
    { path: '/profile', label: 'Perfil', icon: UserIcon },
  ];

  // Opciones solo para jugadores
  const playerNavItems = [
    { path: '/lotteries', label: 'Sorteos', icon: Ticket },
    { path: '/my-tickets', label: 'Mis Compras', icon: ShoppingBag },
    { path: '/verify-ticket', label: 'Verificar', icon: CheckCircle },
    { path: '/payments', label: 'Pagos', icon: DollarSign },
    { path: '/rankings', label: 'Rankings', icon: Trophy },
  ];

  // Construir menú según rol
  const navItems = user?.role === 'admin' || user?.role === 'gerente'
    ? [
        {
          path: '/admin',
          label: 'Administración',
          icon: Shield,
        },
        ...baseNavItems,
      ]
    : [
        ...baseNavItems.slice(0, 1), // Inicio
        ...playerNavItems,
        ...baseNavItems.slice(1), // Perfil
      ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg z-10">
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold text-primary-600">Lotería App</h1>
          <div className="flex items-center space-x-3 mt-3">
            {/* Avatar del usuario */}
            <div className="w-12 h-12 rounded-full flex items-center justify-center overflow-hidden bg-primary-100 flex-shrink-0">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={`${user.firstName} ${user.lastName}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <UserIcon className="text-primary-600" size={24} />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-gray-500">Saldo:</span>
                <span className="text-xs font-semibold text-green-600">
                  ${user?.balance?.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <nav className="p-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 280px)' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
                  isActive
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-white">
          {/* Página Principal link for players only */}
          {user?.role !== 'admin' && user?.role !== 'gerente' && (
            <Link
              to="/"
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg mb-2 transition-colors text-sm ${
                location.pathname === '/'
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Globe size={16} />
              <span>Página Principal</span>
            </Link>
          )}

          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 px-4 py-3 rounded-lg w-full text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut size={20} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-8">{children}</main>
    </div>
  );
};

export default Layout;
