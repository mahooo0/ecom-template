import type { Request, Response, NextFunction } from 'express';
import { productService } from './product.service.js';
import type { ProductStatus } from '@repo/types';

export class ProductController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const status = req.query.status as ProductStatus | undefined;
      const productType = req.query.productType as string | undefined;
      const search = req.query.search as string | undefined;
      const sortBy = req.query.sortBy as 'createdAt' | 'name' | 'price' | 'updatedAt' | undefined;
      const sortOrder = req.query.sortOrder as 'asc' | 'desc' | undefined;

      const result = await productService.getAll({
        page,
        limit,
        status,
        productType,
        search,
        sortBy,
        sortOrder,
      });
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await productService.getById(req.params.id as string);
      res.json({ success: true, data: product });
    } catch (error) {
      next(error);
    }
  }

  async getBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await productService.getBySlug(req.params.slug as string);
      res.json({ success: true, data: product });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await productService.create(req.body);
      res.status(201).json({ success: true, data: product });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await productService.update(req.params.id as string, req.body);
      res.json({ success: true, data: product });
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await productService.updateStatus(
        req.params.id as string,
        req.body.status as ProductStatus
      );
      res.json({ success: true, data: product });
    } catch (error) {
      next(error);
    }
  }

  async bulkUpdateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await productService.bulkUpdateStatus(
        req.body.ids as string[],
        req.body.status as ProductStatus
      );
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async bulkDelete(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await productService.bulkDelete(req.body.ids as string[]);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await productService.delete(req.params.id as string);
      res.json({ success: true, message: 'Product deleted' });
    } catch (error) {
      next(error);
    }
  }

  async importProducts(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
      }

      const result = await productService.importFromCsv(req.file.buffer);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}

export const productController = new ProductController();
