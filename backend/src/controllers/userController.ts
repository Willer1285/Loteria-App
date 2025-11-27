import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import User from '../models/User';
import { createNotification } from './notificationController';

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

    // Los usuarios normales no pueden cambiar su rol, estado, balance ni username
    if (req.user?.role !== 'admin') {
      delete updates.role;
      delete updates.isActive;
      delete updates.balance;
      delete updates.username;
    }

    // Si el admin está actualizando el username, verificar que sea único
    if (updates.username && req.user?.role === 'admin') {
      const existingUser = await User.findOne({ username: updates.username, _id: { $ne: id } });
      if (existingUser) {
        res.status(400).json({ error: 'El nombre de usuario ya está en uso' });
        return;
      }
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

    // Crear notificación de cambios en el perfil (solo si el usuario se actualiza a sí mismo)
    if (String(req.user?._id) === id && req.user?.role !== 'admin') {
      // Detectar qué campos fueron actualizados
      const updatedFields: string[] = [];
      if (updates.firstName || updates.lastName) updatedFields.push('nombre');
      if (updates.phone) updatedFields.push('teléfono');
      if (updates.address) updatedFields.push('dirección');
      if (updates.email) updatedFields.push('email');
      if (updates.avatar) updatedFields.push('foto de perfil');

      if (updatedFields.length > 0) {
        const fieldsText = updatedFields.join(', ');
        await createNotification(
          String(user._id),
          'profile_updated',
          'Perfil actualizado',
          `Has actualizado tu ${fieldsText} exitosamente.`,
          String(user._id),
          { updatedFields }
        );
      }
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

    // Enviar notificación de cuenta desactivada
    await createNotification(
      String(user._id),
      'profile_updated',
      'Cuenta desactivada ⚠️',
      'Tu cuenta ha sido desactivada temporalmente por un administrador. Para más información, por favor contacta al soporte.',
      String(user._id),
      { accountDeactivated: true }
    );

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

    // Enviar notificación de cuenta activada
    await createNotification(
      String(user._id),
      'profile_updated',
      'Cuenta activada ✅',
      '¡Tu cuenta ha sido activada exitosamente! Ya puedes acceder a todos los servicios de la plataforma.',
      String(user._id),
      { accountActivated: true }
    );

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

    // Enviar notificación al usuario baneado
    await createNotification(
      String(user._id),
      'profile_updated',
      'Cuenta suspendida ⚠️',
      `Tu cuenta ha sido suspendida. Motivo: ${user.bannedReason}. Por favor contacta al administrador para más información.`,
      String(user._id),
      {
        bannedReason: user.bannedReason,
        bannedAt: user.bannedAt
      }
    );

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

    // Enviar notificación al usuario desbaneado
    await createNotification(
      String(user._id),
      'profile_updated',
      'Cuenta restaurada ✅',
      '¡Buenas noticias! Tu cuenta ha sido restaurada y ahora puedes acceder a todos los servicios de la plataforma. ¡Bienvenido de vuelta!',
      String(user._id),
      { accountRestored: true }
    );

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

/**
 * Actualiza el email de un usuario
 */
export const updateEmail = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { email } = req.body;

    // Los usuarios solo pueden actualizar su propio email (a menos que sean admin)
    if (req.user?.role !== 'admin' && String(req.user?._id) !== id) {
      res.status(403).json({ error: 'No tienes permiso para actualizar este email' });
      return;
    }

    // Verificar que el email no esté en uso
    const existingUser = await User.findOne({ email });
    if (existingUser && String(existingUser._id) !== id) {
      res.status(400).json({ error: 'El email ya está en uso' });
      return;
    }

    const user = await User.findByIdAndUpdate(
      id,
      { email },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }

    // Enviar notificación de cambio de email (alerta de seguridad)
    await createNotification(
      String(user._id),
      'profile_updated',
      'Email actualizado 📧',
      `Tu dirección de email ha sido actualizada exitosamente a: ${email}. Si no fuiste tú quien realizó este cambio, por favor contacta al administrador inmediatamente.`,
      String(user._id),
      {
        newEmail: email,
        emailChanged: true
      }
    );

    res.json({
      message: 'Email actualizado exitosamente',
      user,
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar email' });
  }
};

/**
 * Actualiza la contraseña de un usuario
 */
export const updatePassword = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;

    // Los usuarios solo pueden actualizar su propia contraseña
    if (String(req.user?._id) !== id) {
      res.status(403).json({ error: 'No tienes permiso para actualizar esta contraseña' });
      return;
    }

    const user = await User.findById(id);
    if (!user) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }

    // Verificar que la contraseña actual sea correcta
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      res.status(401).json({ error: 'Contraseña actual incorrecta' });
      return;
    }

    // Actualizar contraseña (el hash se hace automáticamente por el middleware pre-save)
    user.password = newPassword;
    await user.save();

    // Enviar notificación de cambio de contraseña
    await createNotification(
      String(user._id),
      'profile_updated',
      'Contraseña actualizada',
      'Tu contraseña ha sido cambiada exitosamente. Si no fuiste tú quien realizó este cambio, por favor contacta al administrador inmediatamente.',
      String(user._id),
      { passwordChanged: true }
    );

    res.json({
      message: 'Contraseña actualizada exitosamente',
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar contraseña' });
  }
};
