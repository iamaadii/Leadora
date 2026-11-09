import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.js';
import { pool } from './config/database.js';
import { errorMiddleware } from './middleware/error.middleware.js';
import { notFoundMiddleware } from './middleware/not-found.middleware.js';

export function createApp() {
  const app = express();

  // Helmet security headers
  app.use(helmet());

  // CORS configuration
  app.use(
    cors({
      origin: env.FRONTEND_URL,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    }),
  );

  // Request body parsing
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  // Request logger
  if (env.NODE_ENV !== 'test') {
    app.use(morgan('dev'));
  }

  // Basic API Health check
  app.get('/api/v1/health', (req, res) => {
    res.status(200).json({
      success: true,
      data: {
        status: 'healthy',
        message: 'Business CRM Backend API is running',
        uptime: Math.floor(process.uptime()),
        timestamp: new Date().toISOString(),
        environment: env.NODE_ENV,
      },
    });
  });

  // Database Connectivity Health check
  app.get('/api/v1/health/db', async (req, res) => {
    try {
      const startTime = Date.now();
      const result = await pool.query('SELECT 1 AS alive, NOW() AS server_time, current_database() AS database_name;');
      const durationMs = Date.now() - startTime;

      return res.status(200).json({
        success: true,
        data: {
          status: 'connected',
          database: result.rows[0].database_name,
          serverTime: result.rows[0].server_time,
          responseTimeMs: durationMs,
          message: 'PostgreSQL connection verified successfully',
        },
      });
    } catch (err) {
      return res.status(503).json({
        success: false,
        error: {
          code: 'DATABASE_UNAVAILABLE',
          message: 'PostgreSQL database is currently unreachable. Ensure Docker container is running.',
          details: err.message,
        },
      });
    }
  });

  // 404 Handler
  app.use(notFoundMiddleware);

  // Centralized Error Handler
  app.use(errorMiddleware);

  return app;
}

export const app = createApp();

