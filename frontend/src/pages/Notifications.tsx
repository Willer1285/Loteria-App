import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { notificationAPI } from '../services/api';
import toast from 'react-hot-toast';
import {
  Bell,
  Check,
  Trash2,
  Trophy,
  DollarSign,
  TrendingUp,
  TrendingDown,
  User,
  X,
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  metadata?: any;
  createdAt: string;
}

const Notifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    loadNotifications();
  }, [filter]);

  const loadNotifications = async () => {
    try {
      const response = await notificationAPI.getAll({
        limit: 100,
        unreadOnly: filter === 'unread',
      });
      setNotifications(response.data.notifications);
    } catch (error) {
      toast.error('Error al cargar notificaciones');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationAPI.markAsRead(id);
      setNotifications(
        notifications.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch (error) {
      toast.error('Error al marcar notificación');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
      toast.success('Todas las notificaciones marcadas como leídas');
    } catch (error) {
      toast.error('Error al marcar todas las notificaciones');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await notificationAPI.delete(id);
      setNotifications(notifications.filter((n) => n._id !== id));
      toast.success('Notificación eliminada');
    } catch (error) {
      toast.error('Error al eliminar notificación');
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'prize_won':
        return <Trophy className="text-yellow-500" size={24} />;
      case 'deposit_approved':
      case 'withdrawal_approved':
        return <DollarSign className="text-green-500" size={24} />;
      case 'deposit_rejected':
      case 'withdrawal_rejected':
        return <X className="text-red-500" size={24} />;
      case 'ranking_up':
        return <TrendingUp className="text-green-500" size={24} />;
      case 'ranking_down':
        return <TrendingDown className="text-orange-500" size={24} />;
      case 'profile_updated':
        return <User className="text-blue-500" size={24} />;
      default:
        return <Bell className="text-gray-500" size={24} />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'prize_won':
        return 'bg-yellow-50 border-yellow-200';
      case 'deposit_approved':
      case 'withdrawal_approved':
        return 'bg-green-50 border-green-200';
      case 'deposit_rejected':
      case 'withdrawal_rejected':
        return 'bg-red-50 border-red-200';
      case 'ranking_up':
        return 'bg-green-50 border-green-200';
      case 'ranking_down':
        return 'bg-orange-50 border-orange-200';
      case 'profile_updated':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Notificaciones</h1>
            <p className="text-gray-600 mt-1">
              {unreadCount > 0
                ? `Tienes ${unreadCount} notificación${unreadCount > 1 ? 'es' : ''} sin leer`
                : 'No tienes notificaciones sin leer'}
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Check size={18} />
              <span>Marcar todas como leídas</span>
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-4 border-b">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-3 border-b-2 font-semibold transition-colors ${
              filter === 'all'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Todas ({notifications.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-3 border-b-2 font-semibold transition-colors ${
              filter === 'unread'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            No leídas ({unreadCount})
          </button>
        </div>

        {/* Notifications List */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : notifications.length > 0 ? (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification._id}
                className={`border rounded-xl p-4 transition-all ${
                  notification.isRead
                    ? 'bg-white border-gray-200'
                    : `${getNotificationColor(notification.type)} border`
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {notification.title}
                        </h3>
                        <p className="text-gray-700 mt-1">{notification.message}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          {format(new Date(notification.createdAt), 'PPp', {
                            locale: es,
                          })}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-2 ml-4">
                        {!notification.isRead && (
                          <button
                            onClick={() => handleMarkAsRead(notification._id)}
                            className="p-2 hover:bg-white rounded-lg transition-colors"
                            title="Marcar como leída"
                          >
                            <Check size={18} className="text-green-600" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(notification._id)}
                          className="p-2 hover:bg-white rounded-lg transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 size={18} className="text-red-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Bell className="mx-auto text-gray-400 mb-4" size={64} />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {filter === 'unread'
                ? 'No tienes notificaciones sin leer'
                : 'No tienes notificaciones'}
            </h3>
            <p className="text-gray-600">
              {filter === 'unread'
                ? 'Todas tus notificaciones han sido leídas'
                : 'Las notificaciones aparecerán aquí cuando haya novedades'}
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Notifications;
