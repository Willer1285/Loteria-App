import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import EmailTemplate, { EmailTemplateType } from '../models/EmailTemplate';

/**
 * Obtiene todas las plantillas de email
 */
export const getAllEmailTemplates = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const templates = await EmailTemplate.find().sort({ type: 1 });

    res.json({ templates });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener plantillas de email' });
  }
};

/**
 * Obtiene una plantilla de email por tipo
 */
export const getEmailTemplateByType = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { type } = req.params;

    const template = await EmailTemplate.findOne({ type });

    if (!template) {
      res.status(404).json({ error: 'Plantilla no encontrada' });
      return;
    }

    res.json({ template });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener plantilla de email' });
  }
};

/**
 * Crea o actualiza una plantilla de email
 */
export const upsertEmailTemplate = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { type, name, subject, htmlContent, textContent, variables, isActive } = req.body;

    let template = await EmailTemplate.findOne({ type });

    if (template) {
      // Actualizar plantilla existente
      template.name = name;
      template.subject = subject;
      template.htmlContent = htmlContent;
      template.textContent = textContent;
      template.variables = variables;
      template.isActive = isActive !== undefined ? isActive : template.isActive;
      await template.save();

      res.json({
        message: 'Plantilla actualizada exitosamente',
        template,
      });
    } else {
      // Crear nueva plantilla
      template = await EmailTemplate.create({
        type,
        name,
        subject,
        htmlContent,
        textContent,
        variables,
        isActive: isActive !== undefined ? isActive : true,
      });

      res.status(201).json({
        message: 'Plantilla creada exitosamente',
        template,
      });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error al guardar plantilla de email' });
  }
};

/**
 * Elimina una plantilla de email
 */
export const deleteEmailTemplate = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { type } = req.params;

    const template = await EmailTemplate.findOneAndDelete({ type });

    if (!template) {
      res.status(404).json({ error: 'Plantilla no encontrada' });
      return;
    }

    res.json({ message: 'Plantilla eliminada exitosamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar plantilla de email' });
  }
};

/**
 * Activa o desactiva una plantilla de email
 */
export const toggleEmailTemplate = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { type } = req.params;
    const { isActive } = req.body;

    const template = await EmailTemplate.findOne({ type });

    if (!template) {
      res.status(404).json({ error: 'Plantilla no encontrada' });
      return;
    }

    template.isActive = isActive;
    await template.save();

    res.json({
      message: `Plantilla ${isActive ? 'activada' : 'desactivada'} exitosamente`,
      template,
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar plantilla de email' });
  }
};
