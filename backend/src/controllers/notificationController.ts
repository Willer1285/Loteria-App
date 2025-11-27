import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import Notification from '../models/Notification';
import User from '../models/User';
import nodemailer from 'nodemailer';

// Configurar transportador de email
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Crea una notificación y opcionalmente envía email
 */
export const createNotification = async (
  userId: string,
  type: string,
  title: string,
  message: string,
  relatedId?: string,
  metadata?: any,
  sendEmail: boolean = true
): Promise<void> => {
  try {
    // Crear notificación en la base de datos
    await Notification.create({
      userId,
      type,
      title,
      message,
      relatedId,
      metadata,
      isRead: false,
    });

    // Enviar email si está habilitado
    if (sendEmail && process.env.SMTP_USER) {
      const user = await User.findById(userId);
      if (user && user.email) {
        try {
          await transporter.sendMail({
            from: process.env.SMTP_FROM || process.env.SMTP_USER,
            to: user.email,
            subject: title,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #2563eb;">${title}</h2>
                <p style="font-size: 16px; color: #374151;">${message}</p>
                <hr style="border: 1px solid #e5e7eb; margin: 20px 0;" />
                <p style="font-size: 14px; color: #6b7280;">
                  Este es un mensaje automático de Lotería App. Por favor no responder a este correo.
                </p>
              </div>
            `,
          });
          console.log(`📧 Email enviado a ${user.email}: ${title}`);
        } catch (emailError) {
          console.error('Error al enviar email:', emailError);
          // No lanzar error, la notificación ya se creó
        }
      }
    }
  } catch (error) {
    console.error('Error al crear notificación:', error);
    throw error;
  }
};

/**
 * Obtiene todas las notificaciones del usuario autenticado
 */
export const getUserNotifications = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { limit = 50, unreadOnly = false } = req.query;
    const userId = req.user?._id;

    const query: any = { userId };
    if (unreadOnly === 'true') {
      query.isRead = false;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    const unreadCount = await Notification.countDocuments({
      userId,
      isRead: false,
    });

    res.json({
      notifications,
      unreadCount,
    });
  } catch (error) {
    console.error('Error al obtener notificaciones:', error);
    res.status(500).json({ error: 'Error al obtener notificaciones' });
  }
};

/**
 * Marca una notificación como leída
 */
export const markAsRead = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;

    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      res.status(404).json({ error: 'Notificación no encontrada' });
      return;
    }

    res.json({
      message: 'Notificación marcada como leída',
      notification,
    });
  } catch (error) {
    console.error('Error al marcar notificación:', error);
    res.status(500).json({ error: 'Error al marcar notificación' });
  }
};

/**
 * Marca todas las notificaciones del usuario como leídas
 */
export const markAllAsRead = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?._id;

    await Notification.updateMany(
      { userId, isRead: false },
      { isRead: true }
    );

    res.json({
      message: 'Todas las notificaciones marcadas como leídas',
    });
  } catch (error) {
    console.error('Error al marcar todas las notificaciones:', error);
    res.status(500).json({ error: 'Error al marcar todas las notificaciones' });
  }
};

/**
 * Elimina una notificación
 */
export const deleteNotification = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;

    const notification = await Notification.findOneAndDelete({
      _id: id,
      userId,
    });

    if (!notification) {
      res.status(404).json({ error: 'Notificación no encontrada' });
      return;
    }

    res.json({
      message: 'Notificación eliminada exitosamente',
    });
  } catch (error) {
    console.error('Error al eliminar notificación:', error);
    res.status(500).json({ error: 'Error al eliminar notificación' });
  }
};

/**
 * Obtiene el contador de notificaciones no leídas
 */
export const getUnreadCount = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?._id;

    const unreadCount = await Notification.countDocuments({
      userId,
      isRead: false,
    });

    res.json({ unreadCount });
  } catch (error) {
    console.error('Error al obtener contador de no leídas:', error);
    res.status(500).json({ error: 'Error al obtener contador' });
  }
};
