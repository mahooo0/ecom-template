import 'dotenv/config';

export const config = {
  port: parseInt(process.env.PORT || '4000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL!,
  mongodbUri: process.env.MONGODB_URI!,
  clerkSecretKey: process.env.CLERK_SECRET_KEY!,
  clerkWebhookSecret: process.env.CLERK_WEBHOOK_SIGNING_SECRET!,
  stripeSecretKey: process.env.STRIPE_SECRET_KEY!,
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3002',
  adminUrl: process.env.ADMIN_URL || 'http://localhost:3003',
};
