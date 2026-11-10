import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { z } from 'zod';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Potential paths for .env depending on how the workspace is launched
const envCandidates = [
  path.resolve(__dirname, '../../../../.env'), // Root from apps/api/src/config
  path.resolve(__dirname, '../../.env'),       // apps/api/.env
  path.resolve(process.cwd(), '.env'),         // Current working directory
  path.resolve(process.cwd(), '../../.env'),   // Root if cwd is apps/api
];

for (const envPath of envCandidates) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
  }
}

// Fallback to process.env defaults
dotenv.config();

const DEFAULT_DEV_JWT_SECRET = 'super-secret-jwt-access-token-key-minimum-32-chars-long';

const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z
      .union([z.string(), z.number()])
      .transform((val) => (typeof val === 'string' ? parseInt(val, 10) : val))
      .default(5000),
    FRONTEND_URL: z.string().url().default('http://localhost:5173'),
    CORS_ORIGIN: z.string().optional(),
    DATABASE_URL: z
      .string()
      .min(1)
      .default('postgresql://crm_admin:crm_secret_password@localhost:5432/business_crm'),
    DATABASE_SSL: z
      .preprocess((val) => val === 'true' || val === true, z.boolean())
      .default(false),
    DATABASE_SSL_REJECT_UNAUTHORIZED: z
      .preprocess((val) => val !== 'false' && val !== false, z.boolean())
      .default(true),
    JWT_ACCESS_SECRET: z.string().min(16).default(DEFAULT_DEV_JWT_SECRET),
    ACCESS_TOKEN_EXPIRES_IN: z.string().default('10m'),
    REFRESH_TOKEN_EXPIRES_IN: z.string().default('7d'),
    COOKIE_NAME: z.string().default('refreshToken'),
    COOKIE_SAME_SITE: z.enum(['lax', 'strict', 'none']).default('lax'),
    RATE_LIMIT_WINDOW_MS: z
      .union([z.string(), z.number()])
      .transform((val) => (typeof val === 'string' ? parseInt(val, 10) : val))
      .default(15 * 60 * 1000),
    RATE_LIMIT_MAX_REQUESTS: z
      .union([z.string(), z.number()])
      .transform((val) => (typeof val === 'string' ? parseInt(val, 10) : val))
      .default(100),
    RATE_LIMIT_AUTH_MAX: z
      .union([z.string(), z.number()])
      .transform((val) => (typeof val === 'string' ? parseInt(val, 10) : val))
      .default(10),
  })
  .refine(
    (data) => {
      if (data.NODE_ENV === 'production') {
        return (
          data.JWT_ACCESS_SECRET !== DEFAULT_DEV_JWT_SECRET &&
          data.JWT_ACCESS_SECRET.length >= 32
        );
      }
      return true;
    },
    {
      message:
        'In production mode, JWT_ACCESS_SECRET must be explicitly set, at least 32 characters long, and must not use the development default.',
      path: ['JWT_ACCESS_SECRET'],
    },
  );

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:');
  console.error(JSON.stringify(parsed.error.format(), null, 2));
  process.exit(1);
}

export const env = parsed.data;
