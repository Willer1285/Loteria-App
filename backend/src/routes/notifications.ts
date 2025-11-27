import { Router } from 'express';
import { auth } from '../middlewares/auth';
import {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount,
} from '../controllers/notificationController';

const router = Router();

// Todas las rutas requieren autenticación
router.use(auth);

// Obtener notificaciones del usuario
router.get('/', getUserNotifications);

// Obtener contador de no leídas
router.get('/unread-count', getUnreadCount);

// Marcar notificación como leída
router.patch('/:id/read', markAsRead);

// Marcar todas como leídas
router.patch('/mark-all-read', markAllAsRead);

// Eliminar notificación
router.delete('/:id', deleteNotification);

export default router;
