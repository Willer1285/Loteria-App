import { Request, Response } from 'express';
import crypto from 'crypto';
import User from '../models/User';
import { validationResult } from 'express-validator';

/**
 * Solicita un reseteo de contraseña
 * Genera un token y lo guarda en la base de datos
 */
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { email } = req.body;

    // Buscar usuario
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      // Por seguridad, no revelamos si el email existe o no
      res.json({
        message: 'Si el correo existe, recibirás un enlace de recuperación.',
      });
      return;
    }

    // Generar token de reseteo
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Hash del token antes de guardarlo
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Guardar token hasheado y fecha de expiración (1 hora)
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hora
    await user.save();

    // En producción, aquí enviarías un email con el token
    // Por ahora, lo devolvemos en la respuesta (SOLO PARA DESARROLLO)
    console.log('🔑 Token de reseteo de contraseña:', resetToken);
    console.log('📧 Usuario:', user.email);

    res.json({
      message: 'Si el correo existe, recibirás un enlace de recuperación.',
      // SOLO PARA DESARROLLO - Remover en producción
      resetToken: resetToken,
      resetUrl: `http://localhost:3000/reset-password/${resetToken}`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al procesar solicitud' });
  }
};

/**
 * Resetea la contraseña usando el token
 */
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { token, newPassword } = req.body;

    // Hash del token recibido
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Buscar usuario con token válido y no expirado
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      res.status(400).json({ error: 'Token inválido o expirado' });
      return;
    }

    // Actualizar contraseña
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({
      message: 'Contraseña actualizada exitosamente. Ahora puedes iniciar sesión.',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al resetear contraseña' });
  }
};

/**
 * Verifica si un token de reseteo es válido
 */
export const verifyResetToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.params;

    // Hash del token
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Buscar usuario con token válido
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      res.status(400).json({
        valid: false,
        error: 'Token inválido o expirado'
      });
      return;
    }

    res.json({
      valid: true,
      email: user.email,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al verificar token' });
  }
};
