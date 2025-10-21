import { Router } from 'express';
import {
  getAllEmailTemplates,
  getEmailTemplateByType,
  upsertEmailTemplate,
  deleteEmailTemplate,
  toggleEmailTemplate,
} from '../controllers/emailTemplateController';
import { authenticate, isAdmin, hasPermission } from '../middlewares/auth';

const router = Router();

/**
 * @route   GET /api/email-templates
 * @desc    Obtiene todas las plantillas de email
 * @access  Private/Admin or Gerente with permission
 */
router.get('/', authenticate, getAllEmailTemplates);

/**
 * @route   GET /api/email-templates/:type
 * @desc    Obtiene una plantilla de email por tipo
 * @access  Private/Admin or Gerente with permission
 */
router.get('/:type', authenticate, getEmailTemplateByType);

/**
 * @route   POST /api/email-templates
 * @desc    Crea o actualiza una plantilla de email
 * @access  Private/Admin or Gerente with permission
 */
router.post('/', authenticate, isAdmin, upsertEmailTemplate);

/**
 * @route   DELETE /api/email-templates/:type
 * @desc    Elimina una plantilla de email
 * @access  Private/Admin
 */
router.delete('/:type', authenticate, isAdmin, deleteEmailTemplate);

/**
 * @route   PUT /api/email-templates/:type/toggle
 * @desc    Activa o desactiva una plantilla de email
 * @access  Private/Admin or Gerente with permission
 */
router.put('/:type/toggle', authenticate, isAdmin, toggleEmailTemplate);

export default router;
