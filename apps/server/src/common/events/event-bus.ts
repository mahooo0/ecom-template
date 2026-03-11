import { EventEmitter } from 'events';

type EventMap = {
  'order.created': { orderId: string; userId: string; totalAmount: number };
  'order.updated': { orderId: string; status: string };
  'order.shipped': { orderId: string; userId: string; carrier: string; trackingNumber: string };
  'payment.completed': { orderId: string; paymentIntentId: string };
  'payment.failed': { orderId: string; error: string };
  'product.created': { productId: string };
  'product.updated': { productId: string };
  'product.deleted': { productId: string };
};

class EventBus {
  private emitter = new EventEmitter();

  emit<K extends keyof EventMap>(event: K, data: EventMap[K]): void {
    this.emitter.emit(event, data);
  }

  on<K extends keyof EventMap>(event: K, handler: (data: EventMap[K]) => void): void {
    this.emitter.on(event, handler);
  }

  off<K extends keyof EventMap>(event: K, handler: (data: EventMap[K]) => void): void {
    this.emitter.off(event, handler);
  }
}

export const eventBus = new EventBus();
