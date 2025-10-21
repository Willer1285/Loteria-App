import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';

export interface AuthRequest extends Request {
  user?: IUser;
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      res.status(401).json({ error: 'Acceso denegado. Token no proporcionado.' });
      return;
    }

    const jwtSecret = process.env.JWT_SECRET || 'default-secret';
    const decoded = jwt.verify(token, jwtSecret) as { userId: string };

    const user = await User.findById(decoded.userId);

    if (!user || !user.isActive) {
      res.status(401).json({ error: 'Usuario no válido o inactivo.' });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token inválido.' });
  }
};

export const isAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (req.user?.role !== 'admin') {
    res.status(403).json({ error: 'Acceso denegado. Se requieren privilegios de administrador.' });
    return;
  }
  next();
};

export const isAdminOrGerente = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (req.user?.role !== 'admin' && req.user?.role !== 'gerente') {
    res.status(403).json({ error: 'Acceso denegado. Se requieren privilegios de administrador o gerente.' });
    return;
  }
  next();
};

export const hasPermission = (permission: string) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    // Admin siempre tiene todos los permisos
    if (req.user?.role === 'admin') {
      next();
      return;
    }

    // Gerente debe tener el permiso específico
    if (req.user?.role === 'gerente' && req.user.permissions) {
      const permissions = req.user.permissions as any;
      if (permissions[permission]) {
        next();
        return;
      }
    }

    res.status(403).json({ error: 'No tienes permiso para realizar esta acción.' });
  };
};
