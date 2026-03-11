import { Router } from 'express';
import { tagController } from './tag.controller.js';
import { requireAdmin } from '../../common/middleware/auth.middleware.js';
import { validate } from '../../common/middleware/validate.js';
import { createTagSchema } from './tag.schemas.js';

const router = Router();

// Public routes
router.get('/', (req, res, next) => tagController.getAll(req, res, next));

// Admin routes
router.post(
  '/',
  requireAdmin,
  validate(createTagSchema),
  (req, res, next) => tagController.create(req, res, next)
);
router.delete('/:id', requireAdmin, (req, res, next) => tagController.delete(req, res, next));

export { router as tagRoutes };
