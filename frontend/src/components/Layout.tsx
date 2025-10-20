import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Home,
  Ticket,
  ShoppingBag,
  DollarSign,
  Trophy,
  User,
  LogOut,
  Shield,
  CheckCircle,
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

  const navItems = [
    { path: '/dashboard', label: 'Inicio', icon: Home },
    { path: '/lotteries', label: 'Sorteos', icon: Ticket },
    { path: '/my-tickets', label: 'Mis Boletos', icon: ShoppingBag },
    { path: '/verify-ticket', label: 'Verificar', icon: CheckCircle },
    { path: '/payments', label: 'Pagos', icon: DollarSign },
    { path: '/rankings', label: 'Rankings', icon: Trophy },
    { path: '/profile', label: 'Perfil', icon: User },
  ];

  if (user?.role === 'admin') {
    navItems.unshift({
      path: '/admin',
      label: 'Admin',
      icon: Shield,
    });
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg z-10">
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold text-primary-600">Lotería App</h1>
          <p className="text-sm text-gray-600 mt-1">
            {user?.firstName} {user?.lastName}
          </p>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs text-gray-500">Saldo:</span>
            <span className="text-sm font-semibold text-green-600">
              ${user?.balance?.toFixed(2)}
            </span>
          </div>
        </div>

        <nav className="p-4">
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

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
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
