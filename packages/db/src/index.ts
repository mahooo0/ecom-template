export { prisma, PrismaClient } from './prisma.js';
export { OrderModel, CartModel, connectMongoDB, mongoose } from './mongoose.js';
export type {
  IOrder,
  IOrderItem,
  IOrderAddress,
  IShippingInfo,
  IPaymentInfo,
  IOrderStatusChange,
  ICart,
  ICartItem
} from './mongoose.js';
