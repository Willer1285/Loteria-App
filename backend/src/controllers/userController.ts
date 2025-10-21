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

/**
 * Crea un nuevo usuario (solo admin o gerente con permiso)
 */
export const createUser = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { email, password, firstName, lastName, role, phone, address, permissions } = req.body;

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ error: 'El email ya está registrado' });
      return;
    }

    // Validar que solo admin puede crear otros admins
    if (role === 'admin' && req.user?.role !== 'admin') {
      res.status(403).json({ error: 'Solo un administrador puede crear otro administrador' });
      return;
    }

    // Crear nuevo usuario
    const userData: any = {
      email,
      password,
      firstName,
      lastName,
      role: role || 'jugador',
      phone,
      address,
    };

    // Si es gerente, agregar permisos
    if (role === 'gerente' && permissions) {
      userData.permissions = permissions;
    }

    const user = await User.create(userData);

    res.status(201).json({
      message: 'Usuario creado exitosamente',
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        permissions: user.permissions,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear usuario' });
  }
};

/**
 * Banea un usuario (solo admin o gerente con permiso)
 */
export const banUser = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    // No permitir banear administradores
    const userToBan = await User.findById(id);
    if (!userToBan) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }

    if (userToBan.role === 'admin') {
      res.status(403).json({ error: 'No se puede banear a un administrador' });
      return;
    }

    const user = await User.findByIdAndUpdate(
      id,
      {
        isBanned: true,
        bannedReason: reason || 'No especificado',
        bannedAt: new Date(),
        isActive: false,
      },
      { new: true }
    ).select('-password');

    if (!user) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }

    res.json({
      message: 'Usuario baneado exitosamente',
      user,
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al banear usuario' });
  }
};

/**
 * Desbanea/Restaura un usuario (solo admin o gerente con permiso)
 */
export const unbanUser = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndUpdate(
      id,
      {
        isBanned: false,
        bannedReason: undefined,
        bannedAt: undefined,
        isActive: true,
      },
      { new: true }
    ).select('-password');

    if (!user) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }

    res.json({
      message: 'Usuario restaurado exitosamente',
      user,
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al restaurar usuario' });
  }
};

/**
 * Obtiene todos los usuarios baneados (solo admin o gerente)
 */
export const getBannedUsers = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const users = await User.find({ isBanned: true })
      .select('-password')
      .sort({ bannedAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await User.countDocuments({ isBanned: true });

    res.json({
      users,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener usuarios baneados' });
  }
};

/**
 * Elimina un usuario permanentemente (solo admin)
 */
export const deleteUser = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    // No permitir eliminar administradores
    const userToDelete = await User.findById(id);
    if (!userToDelete) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }

    if (userToDelete.role === 'admin') {
      res.status(403).json({ error: 'No se puede eliminar a un administrador' });
      return;
    }

    await User.findByIdAndDelete(id);

    res.json({ message: 'Usuario eliminado permanentemente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar usuario' });
  }
};

/**
 * Actualiza el avatar de un usuario
 */
export const updateAvatar = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { avatar } = req.body;

    // Los usuarios solo pueden actualizar su propio avatar (a menos que sean admin)
    if (req.user?.role !== 'admin' && req.user?.role !== 'gerente' && String(req.user?._id) !== id) {
      res.status(403).json({ error: 'No tienes permiso para actualizar este avatar' });
      return;
    }

    const user = await User.findByIdAndUpdate(
      id,
      { avatar },
      { new: true }
    ).select('-password');

    if (!user) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }

    res.json({
      message: 'Avatar actualizado exitosamente',
      user,
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar avatar' });
  }
};
