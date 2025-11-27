import { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { notificationAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';

const NotificationBell = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    loadUnreadCount();
    // Actualizar cada 30 segundos
    const interval = setInterval(loadUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadUnreadCount = async () => {
    try {
      const response = await notificationAPI.getUnreadCount();
      setUnreadCount(response.data.unreadCount || 0);
    } catch (error) {
      console.error('Error al cargar contador de notificaciones:', error);
    }
  };

  return (
    <button
      onClick={() => navigate('/notifications')}
      className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
      title="Notificaciones"
    >
      <Bell size={24} className="text-gray-700" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </button>
  );
};

export default NotificationBell;
