import type { Request, Response, NextFunction } from 'express';
import { orderService } from './order.service.js';

export class OrderController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const result = await orderService.getAll(page, limit);
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  async getByUserId(req: Request, res: Response, next: NextFunction) {
    try {
      const orders = await orderService.getByUserId(req.params.userId as string);
      res.json({ success: true, data: orders });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const order = await orderService.getById(req.params.id as string);
      res.json({ success: true, data: order });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const order = await orderService.create(req.body);
      res.status(201).json({ success: true, data: order });
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const order = await orderService.updateStatus(req.params.id as string, req.body.status);
      res.json({ success: true, data: order });
    } catch (error) {
      next(error);
    }
  }

  async addTracking(req: Request, res: Response, next: NextFunction) {
    try {
      const { carrier, trackingNumber, estimatedDelivery } = req.body;

      // Validate required fields
      if (!carrier || !trackingNumber) {
        return res.status(400).json({
          success: false,
          error: 'Carrier and tracking number are required',
        });
      }

      const order = await orderService.addTracking(req.params.id as string, {
        carrier,
        trackingNumber,
        estimatedDelivery: estimatedDelivery ? new Date(estimatedDelivery) : undefined,
      });

      res.json({ success: true, data: order });
    } catch (error) {
      next(error);
    }
  }
}

export const orderController = new OrderController();
