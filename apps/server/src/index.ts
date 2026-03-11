import express from 'express';
import cors from 'cors';
import { clerkMiddleware } from '@clerk/express';
import { connectMongoDB } from '@repo/db';
import { config } from './config/index.js';
import { errorHandler } from './common/middleware/error-handler.js';
import { productRoutes } from './modules/product/product.routes.js';
import { categoryRoutes } from './modules/category/category.routes.js';
import { orderRoutes } from './modules/order/order.routes.js';
import { authRoutes } from './modules/auth/auth.routes.js';
import { paymentRoutes } from './modules/payment/payment.routes.js';
import { shippingRoutes } from './modules/shipping/shipping.routes.js';
import { eventBus } from './common/events/event-bus.js';

const app = express();

// Middleware
app.use(cors({ origin: [config.clientUrl, config.adminUrl] }));
app.use(clerkMiddleware());

// Webhook route needs raw body for signature verification
app.use('/api/auth/webhooks', express.raw({ type: 'application/json' }));

// Regular JSON parsing for all other routes
app.use(express.json());

// Routes
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/shipping', shippingRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler
app.use(errorHandler);

// Event listeners
eventBus.on('order.created', (data) => {
  console.log(`[Event] Order created: ${data.orderId}`);
});

eventBus.on('payment.completed', (data) => {
  console.log(`[Event] Payment completed for order: ${data.orderId}`);
});

// Start server
async function start() {
  await connectMongoDB(config.mongodbUri);

  app.listen(config.port, () => {
    console.log(`Server running on http://localhost:${config.port}`);
    console.log(`Environment: ${config.nodeEnv}`);
  });
}

start().catch(console.error);
