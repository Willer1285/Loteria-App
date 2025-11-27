import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User';
import { validationResult } from 'express-validator';
import { createNotification } from './notificationController';

/**
 * Genera un username único basado en el email
 */
async function generateUsername(email: string, existingUserId?: string): Promise<string> {
  const emailPart = email.split('@')[0];
  let baseUsername = emailPart
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .substring(0, 20);

  if (baseUsername.length < 3) {
    baseUsername = 'user' + Math.floor(Math.random() * 10000);
  }

  let username = baseUsername;
  let counter = 1;

  const query = existingUserId
    ? { username, _id: { $ne: existingUserId } }
    : { username };

  while (await User.findOne(query)) {
    const suffix = counter.toString();
    username = baseUsername.substring(0, 20 - suffix.length) + suffix;
    counter++;
  }

  return username;
}

/**
 * Asegura que un usuario tenga username (genera uno si no existe)
 */
async function ensureUsername(user: any): Promise<void> {
  if (!user.username || user.username === '') {
    user.username = await generateUsername(user.email, user._id);
    await user.save();
    console.log(`✅ Username generado automáticamente para ${user.email}: ${user.username}`);
  }
}

/**
 * Registra un nuevo usuario
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { email, username, password, firstName, lastName, phone, address } = req.body;

    // Verificar si el email ya existe
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      res.status(400).json({ error: 'El email ya está registrado' });
      return;
    }

    // Verificar si el username ya existe
    if (username) {
      const existingUsername = await User.findOne({ username });
      if (existingUsername) {
        res.status(400).json({ error: 'El nombre de usuario ya está en uso' });
        return;
      }
    }

    // Crear nuevo usuario con username (si no se proporciona, se genera automáticamente)
    const finalUsername = username || await generateUsername(email);

    const user = await User.create({
      email,
      username: finalUsername,
      password,
      firstName,
      lastName,
      phone,
      address,
    });

    // Generar token
    const jwtSecret = process.env.JWT_SECRET || 'default-secret';
    const token = jwt.sign(
      { userId: String(user._id) },
      jwtSecret,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as jwt.SignOptions
    );

    // Enviar notificación de bienvenida
    await createNotification(
      String(user._id),
      'profile_updated',
      '¡Bienvenido a Lotería App! 🎉',
      `Hola ${user.firstName}, tu cuenta ha sido creada exitosamente. Tu nombre de usuario es "${user.username}". ¡Comienza a participar en nuestros sorteos y buena suerte!`,
      String(user._id),
      { isWelcome: true }
    );

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        balance: user.balance,
      },
      token,
    });
  } catch (error: any) {
    console.error('Error al registrar usuario:', error);
    res.status(500).json({
      error: 'Error al registrar usuario',
      details: error.message,
      validationErrors: error.errors
    });
  }
};

/**
 * Inicia sesión de usuario
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { email, password } = req.body;

    // Buscar usuario
    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ error: 'Credenciales inválidas' });
      return;
    }

    // Verificar contraseña
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ error: 'Credenciales inválidas' });
      return;
    }

    // Verificar si el usuario está activo
    if (!user.isActive) {
      res.status(403).json({ error: 'Cuenta desactivada' });
      return;
    }

    // Asegurar que el usuario tenga username (migración automática)
    await ensureUsername(user);

    // Generar token
    const jwtSecret = process.env.JWT_SECRET || 'default-secret';
    const token = jwt.sign(
      { userId: String(user._id) },
      jwtSecret,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as jwt.SignOptions
    );

    res.json({
      message: 'Inicio de sesión exitoso',
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        balance: user.balance,
        avatar: user.avatar,
        phone: user.phone,
        address: user.address,
        totalSpent: user.totalSpent,
        totalWon: user.totalWon,
        ticketsPurchased: user.ticketsPurchased,
      },
      token,
    });
  } catch (error: any) {
    console.error('Error al iniciar sesión:', error);
    res.status(500).json({
      error: 'Error al iniciar sesión',
      details: error.message
    });
  }
};

/**
 * Obtiene el perfil del usuario autenticado
 */
export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;

    // Asegurar que el usuario tenga username (migración automática)
    await ensureUsername(user);

    res.json({
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        balance: user.balance,
        avatar: user.avatar,
        phone: user.phone,
        address: user.address,
        totalSpent: user.totalSpent,
        totalWon: user.totalWon,
        ticketsPurchased: user.ticketsPurchased,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener perfil' });
  }
};
