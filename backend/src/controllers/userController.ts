import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import User from '../models/User';

/**
 * Obtiene todos los usuarios (solo admin)
 */
export const getAllUsers = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { role, isActive, page = 1, limit = 20 } = req.query;

    const filter: any = {};
    if (role) filter.role = role;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await User.countDocuments(filter);

    res.json({
      users,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
};

/**
 * Obtiene un usuario por ID (solo admin)
 */
export const getUserById = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select('-password');

    if (!user) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }

    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener usuario' });
  }
};

/**
 * Actualiza un usuario
 */
export const updateUser = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Los usuarios normales solo pueden actualizarse a sí mismos
    if (req.user?.role !== 'admin' && String(req.user?._id) !== id) {
      res.status(403).json({ error: 'No tienes permiso para actualizar este usuario' });
      return;
    }

    // Los usuarios normales no pueden cambiar su rol o estado
    if (req.user?.role !== 'admin') {
      delete updates.role;
      delete updates.isActive;
      delete updates.balance;
    }

    const user = await User.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }

    res.json({
      message: 'Usuario actualizado exitosamente',
      user,
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar usuario' });
  }
};

/**
 * Desactiva un usuario (solo admin)
 */
export const deactivateUser = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    ).select('-password');

    if (!user) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }

    res.json({
      message: 'Usuario desactivado exitosamente',
      user,
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al desactivar usuario' });
  }
};

/**
 * Activa un usuario (solo admin)
 */
export const activateUser = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndUpdate(
      id,
      { isActive: true },
      { new: true }
    ).select('-password');

    if (!user) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }

    res.json({
      message: 'Usuario activado exitosamente',
      user,
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al activar usuario' });
  }
};

/**
 * Obtiene estadísticas de un usuario
 */
export const getUserStats = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.params.id || String(req.user!._id);

    // Los usuarios normales solo pueden ver sus propias estadísticas
    if (req.user?.role !== 'admin' && String(req.user?._id) !== userId) {
      res.status(403).json({ error: 'No tienes permiso para ver estas estadísticas' });
      return;
    }

    const user = await User.findById(userId).select(
      'firstName lastName email balance totalSpent totalWon ticketsPurchased'
    );

    if (!user) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }

    res.json({
      stats: {
        user: {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
        },
        balance: user.balance,
        totalSpent: user.totalSpent,
        totalWon: user.totalWon,
        ticketsPurchased: user.ticketsPurchased,
        netProfit: user.totalWon - user.totalSpent,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener estadísticas del usuario' });
  }
};
