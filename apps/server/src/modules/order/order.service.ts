import { OrderModel, type IOrder } from '@repo/db';
import { eventBus } from '../../common/events/event-bus.js';
import { AppError } from '../../common/middleware/error-handler.js';

export class OrderService {
  async getAll(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [orders, total] = await Promise.all([
      OrderModel.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      OrderModel.countDocuments(),
    ]);

    return {
      data: orders,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getByUserId(userId: string) {
    return OrderModel.find({ userId }).sort({ createdAt: -1 }).lean();
  }

  async getById(id: string) {
    const order = await OrderModel.findById(id).lean();
    if (!order) throw new AppError(404, 'Order not found');
    return order;
  }

  async create(data: {
    userId: string;
    items: IOrder['items'];
    shippingAddress: IOrder['shippingAddress'];
    totalAmount: number;
  }) {
    const order = await OrderModel.create({
      userId: data.userId,
      items: data.items,
      shippingAddress: data.shippingAddress,
      totalAmount: data.totalAmount,
      status: 'pending',
    });

    eventBus.emit('order.created', {
      orderId: order.id as string,
      userId: data.userId,
      totalAmount: data.totalAmount,
    });

    return order;
  }

  async updateStatus(id: string, status: IOrder['status']) {
    const order = await OrderModel.findByIdAndUpdate(id, { status }, { new: true }).lean();
    if (!order) throw new AppError(404, 'Order not found');

    eventBus.emit('order.updated', { orderId: id, status });
    return order;
  }

  async addTracking(id: string, data: {
    carrier: string;
    trackingNumber: string;
    estimatedDelivery?: Date;
  }) {
    // 1. Find the current order to get its status for statusHistory
    const currentOrder = await OrderModel.findById(id);
    if (!currentOrder) throw new AppError(404, 'Order not found');

    // 2. Validate order is in a shippable state (paid or processing)
    const shippableStatuses = ['paid', 'processing'];
    if (!shippableStatuses.includes(currentOrder.status)) {
      throw new AppError(400, `Cannot add tracking to order with status: ${currentOrder.status}`);
    }

    // 3. Update order with tracking info and status change
    const order = await OrderModel.findByIdAndUpdate(
      id,
      {
        $set: {
          'shipping.carrier': data.carrier,
          'shipping.trackingNumber': data.trackingNumber,
          'shipping.shippedAt': new Date(),
          'shipping.estimatedDelivery': data.estimatedDelivery ?? null,
          status: 'shipped',
        },
        $push: {
          statusHistory: {
            from: currentOrder.status,
            to: 'shipped',
            changedAt: new Date(),
            note: `Shipped via ${data.carrier}. Tracking: ${data.trackingNumber}`,
          },
        },
      },
      { new: true }
    );

    // 4. Emit order.shipped event
    eventBus.emit('order.shipped', {
      orderId: id,
      userId: order!.userId,
      carrier: data.carrier,
      trackingNumber: data.trackingNumber,
    });

    return order;
  }
}

export const orderService = new OrderService();
