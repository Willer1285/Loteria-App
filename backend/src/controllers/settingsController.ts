import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import Settings from '../models/Settings';

/**
 * Obtiene la configuración de la aplicación
 */
export const getSettings = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    let settings = await Settings.findOne();

    if (!settings) {
      // Crear configuración por defecto si no existe
      settings = await Settings.create({
        appName: 'Lotería App',
        paymentMethods: [],
        currency: 'USD',
        timezone: 'America/New_York',
      });
    }

    res.json({ settings });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener configuración' });
  }
};

/**
 * Actualiza la configuración de la aplicación (solo admin)
 */
export const updateSettings = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const updates = req.body;

    let settings = await Settings.findOne();

    if (!settings) {
      settings = await Settings.create(updates);
    } else {
      Object.assign(settings, updates);
      await settings.save();
    }

    res.json({
      message: 'Configuración actualizada exitosamente',
      settings,
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar configuración' });
  }
};

/**
 * Actualiza el logo de la aplicación
 */
export const updateLogo = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { logo, logoCollapsed } = req.body;

    let settings = await Settings.findOne();

    if (!settings) {
      settings = await Settings.create({ logo, logoCollapsed });
    } else {
      if (logo) settings.logo = logo;
      if (logoCollapsed) settings.logoCollapsed = logoCollapsed;
      await settings.save();
    }

    res.json({
      message: 'Logo actualizado exitosamente',
      settings,
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar logo' });
  }
};

/**
 * Agrega un método de pago
 */
export const addPaymentMethod = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { name, fields, icon, qrCode } = req.body;

    let settings = await Settings.findOne();

    if (!settings) {
      settings = await Settings.create({
        paymentMethods: [{ name, fields, icon, qrCode, isActive: true }],
      });
    } else {
      settings.paymentMethods.push({
        name,
        fields,
        icon,
        qrCode,
        isActive: true,
      });
      await settings.save();
    }

    res.json({
      message: 'Método de pago agregado exitosamente',
      settings,
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al agregar método de pago' });
  }
};

/**
 * Actualiza un método de pago
 */
export const updatePaymentMethod = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { index } = req.params;
    const updates = req.body;

    const settings = await Settings.findOne();

    if (!settings) {
      res.status(404).json({ error: 'Configuración no encontrada' });
      return;
    }

    const methodIndex = parseInt(index);
    if (methodIndex < 0 || methodIndex >= settings.paymentMethods.length) {
      res.status(404).json({ error: 'Método de pago no encontrado' });
      return;
    }

    Object.assign(settings.paymentMethods[methodIndex], updates);
    await settings.save();

    res.json({
      message: 'Método de pago actualizado exitosamente',
      settings,
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar método de pago' });
  }
};

/**
 * Elimina un método de pago
 */
export const deletePaymentMethod = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { index } = req.params;

    const settings = await Settings.findOne();

    if (!settings) {
      res.status(404).json({ error: 'Configuración no encontrada' });
      return;
    }

    const methodIndex = parseInt(index);
    if (methodIndex < 0 || methodIndex >= settings.paymentMethods.length) {
      res.status(404).json({ error: 'Método de pago no encontrado' });
      return;
    }

    settings.paymentMethods.splice(methodIndex, 1);
    await settings.save();

    res.json({
      message: 'Método de pago eliminado exitosamente',
      settings,
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar método de pago' });
  }
};
