import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard,
  Ticket,
  Users,
  DollarSign,
  ShoppingCart,
  Trophy,
  Settings,
  Mail,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

const Sidebar = ({ collapsed, setCollapsed, mobileOpen, setMobileOpen }: SidebarProps) => {
  const location = useLocation();
  const { user } = useAuth();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin', permission: null },
    { icon: Ticket, label: 'Sorteos', path: '/admin/lotteries', permission: 'canManageLotteries' },
    { icon: Users, label: 'Usuarios', path: '/admin/users', permission: 'canManageUsers' },
    { icon: ShoppingCart, label: 'Venta de Boletos', path: '/admin/ticket-sales', permission: 'canManageTickets' },
    { icon: DollarSign, label: 'Pagos', path: '/admin/payments', permission: 'canManagePayments' },
    { icon: Trophy, label: 'Rankings', path: '/admin/rankings', permission: 'canViewReports' },
    { icon: Mail, label: 'Correos', path: '/admin/emails', permission: 'canManageEmails' },
    { icon: Settings, label: 'Configuración', path: '/admin/settings', permission: 'canManageSettings' },
  ];

  const hasPermission = (permission: string | null) => {
    if (!permission) return true;
    if (user?.role === 'admin') return true;
    if (user?.role === 'gerente' && user.permissions) {
      return user.permissions[permission as keyof typeof user.permissions];
    }
    return false;
  };

  const filteredMenuItems = menuItems.filter(item => hasPermission(item.permission));

  return (
    <>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full bg-gradient-to-b from-primary-800 to-primary-900 text-white z-50
          transition-all duration-300 ease-in-out
          ${collapsed ? 'w-20' : 'w-64'}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
          shadow-2xl
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-primary-700">
          {!collapsed && (
            <div className="flex items-center gap-2 animate-fade-in">
              <Ticket className="text-white" size={32} />
              <span className="font-bold text-xl">Lotería App</span>
            </div>
          )}
          {collapsed && (
            <div className="w-full flex justify-center">
              <Ticket className="text-white" size={28} />
            </div>
          )}

          {/* Desktop Toggle */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:block p-1 rounded-lg hover:bg-primary-700 transition-colors"
          >
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>

          {/* Mobile Close */}
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1 rounded-lg hover:bg-primary-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-2">
            {filteredMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={() => setMobileOpen(false)}
                    className={`
                      flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200
                      ${isActive
                        ? 'bg-primary-600 text-white shadow-lg'
                        : 'text-primary-100 hover:bg-primary-700 hover:text-white'
                      }
                      ${collapsed ? 'justify-center' : ''}
                    `}
                    title={collapsed ? item.label : ''}
                  >
                    <Icon size={22} className="flex-shrink-0" />
                    {!collapsed && (
                      <span className="font-medium animate-fade-in">{item.label}</span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Info */}
        {!collapsed && user && (
          <div className="p-4 border-t border-primary-700 animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.firstName} className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  user.firstName.charAt(0).toUpperCase()
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-xs text-primary-300 truncate capitalize">
                  {user.role}
                </p>
              </div>
            </div>
          </div>
        )}

        {collapsed && user && (
          <div className="p-4 border-t border-primary-700 flex justify-center">
            <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold">
              {user.avatar ? (
                <img src={user.avatar} alt={user.firstName} className="w-10 h-10 rounded-full object-cover" />
              ) : (
                user.firstName.charAt(0).toUpperCase()
              )}
            </div>
          </div>
        )}
      </aside>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-30 lg:hidden p-2 bg-primary-600 text-white rounded-lg shadow-lg hover:bg-primary-700 transition-colors"
      >
        <Menu size={24} />
      </button>
    </>
  );
};

export default Sidebar;
