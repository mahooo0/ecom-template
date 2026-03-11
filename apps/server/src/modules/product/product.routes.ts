import { Router } from 'express';
import { productController } from './product.controller.js';
import { requireAdmin } from '../../common/middleware/auth.middleware.js';
import { validate } from '../../common/middleware/validate.js';
import { csvUpload } from '../../middleware/upload.middleware.js';
import {
  createProductSchema,
  updateProductRequestSchema,
  statusChangeSchema,
  bulkStatusSchema,
  bulkDeleteSchema,
} from './product.schemas.js';

const router = Router();

// Public routes
router.get('/', (req, res, next) => productController.getAll(req, res, next));
router.get('/filter', (req, res, next) => productController.filter(req, res, next));
router.get('/facets', (req, res, next) => productController.facets(req, res, next));
router.get('/slug/:slug', (req, res, next) => productController.getBySlug(req, res, next));
router.get('/:id', (req, res, next) => productController.getById(req, res, next));

// Admin routes - CSV import (must come before /:id routes)
router.post(
  '/import',
  requireAdmin,
  csvUpload,
  (req, res, next) => productController.importProducts(req, res, next)
);

// Admin routes - bulk operations (must come before /:id routes)
router.patch(
  '/bulk/status',
  requireAdmin,
  validate(bulkStatusSchema),
  (req, res, next) => productController.bulkUpdateStatus(req, res, next)
);
router.post(
  '/bulk/delete',
  requireAdmin,
  validate(bulkDeleteSchema),
  (req, res, next) => productController.bulkDelete(req, res, next)
);

// Admin routes - single product operations
router.post(
  '/',
  requireAdmin,
  validate(createProductSchema),
  (req, res, next) => productController.create(req, res, next)
);
router.put(
  '/:id',
  requireAdmin,
  validate(updateProductRequestSchema),
  (req, res, next) => productController.update(req, res, next)
);
router.patch(
  '/:id/status',
  requireAdmin,
  validate(statusChangeSchema),
  (req, res, next) => productController.updateStatus(req, res, next)
);
router.delete('/:id', requireAdmin, (req, res, next) => productController.delete(req, res, next));

export { router as productRoutes };
