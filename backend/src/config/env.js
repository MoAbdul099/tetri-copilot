require('dotenv').config();
const { z } = require('zod');

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'staging', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(5000),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),

  // URLs
  APP_URL:     z.string().default('http://localhost:5173'),
  ADMIN_URL:   z.string().default('http://localhost:5174'),
  WEBSITE_URL: z.string().default('http://localhost:5175'),
  API_URL:     z.string().default('http://localhost:5000'),

  // Clerk
  CLERK_SECRET_KEY:      z.string().min(1, 'CLERK_SECRET_KEY is required'),
  CLERK_PUBLISHABLE_KEY: z.string().min(1, 'CLERK_PUBLISHABLE_KEY is required'),

  // Storage (optional — falls back to local filesystem)
  R2_ACCOUNT_ID:      z.string().optional(),
  R2_ACCESS_KEY_ID:   z.string().optional(),
  R2_SECRET_ACCESS_KEY: z.string().optional(),
  R2_BUCKET_NAME:     z.string().optional(),
  R2_PUBLIC_URL:      z.string().optional(),

  // Email (optional)
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM:     z.string().optional(),

  // Stripe (optional)
  STRIPE_SECRET_KEY:     z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),

  // AI (optional)
  OPENAI_API_KEY:    z.string().optional(),
  OPENAI_MODEL:      z.string().default('gpt-4o-mini'),
  ANTHROPIC_API_KEY: z.string().optional(),

  // Deployment (optional)
  DEPLOY_SECRET: z.string().optional(),
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
  console.error('Invalid environment variables:');
  Object.entries(result.error.flatten().fieldErrors).forEach(([key, errors]) => {
    console.error(`  ${key}: ${errors.join(', ')}`);
  });
  process.exit(1);
}

module.exports = result.data;
