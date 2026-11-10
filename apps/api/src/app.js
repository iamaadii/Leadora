import express from 'express';
import crypto from 'crypto';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import { pool } from './config/database.js';
import { authRouter } from './modules/auth/auth.routes.js';
import { leadsRouter } from './modules/leads/leads.routes.js';
import employeesRouter from './modules/employees/employees.routes.js';
import teamsRouter from './modules/teams/teams.routes.js';
import { followupsRouter } from './modules/followups/followups.routes.js';
import { dashboardRouter } from './modules/dashboard/dashboard.routes.js';
import { reportsRouter, platformReportsRouter } from './modules/reports/reports.routes.js';
import { notificationsRouter } from './modules/notifications/notifications.routes.js';
import { organizationRouter } from './modules/organization/organization.routes.js';
import { usersRouter } from './modules/users/users.routes.js';
import { platformRouter } from './modules/platform/platform.routes.js';
import { activitiesRouter } from './modules/activities/activities.routes.js';
import { errorMiddleware } from './middleware/error.middleware.js';
import { notFoundMiddleware } from './middleware/not-found.middleware.js';

export function createApp() {
  const app = express();

  // Request ID tracking middleware
  app.use((req, res, next) => {
    const incomingId = req.headers['x-request-id'];
    req.id =
      typeof incomingId === 'string' && incomingId.length <= 128
        ? incomingId
        : crypto.randomUUID();
    res.setHeader('X-Request-Id', req.id);
    next();
  });

  // Helmet security headers
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );

  // CORS configuration
  const allowedOrigins = env.CORS_ORIGIN
    ? env.CORS_ORIGIN.split(',').map((o) => o.trim())
    : [env.FRONTEND_URL];

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, or server-to-server)
        if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
      exposedHeaders: ['X-Request-Id'],
    }),
  );

  // Cookie parser
  app.use(cookieParser());

  // Request body parsing
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  // Request logger
  if (env.NODE_ENV !== 'test') {
    app.use(morgan('[:date[iso]] :method :url :status :response-time ms - :res[content-length]'));
  }

  // Basic API Health check (supports both /health and /api/v1/health)
  const healthHandler = (req, res) => {
    res.status(200).json({
      success: true,
      data: {
        status: 'healthy',
        message: 'Leadora CRM Backend API is running',
        uptime: Math.floor(process.uptime()),
        timestamp: new Date().toISOString(),
        environment: env.NODE_ENV,
      },
    });
  };

  app.get('/health', healthHandler);
  app.get('/api/v1/health', healthHandler);

  // Database Connectivity Health check (safe for production - no sensitive schema/name leaks)
  app.get('/api/v1/health/db', async (req, res) => {
    try {
      const startTime = Date.now();
      const result = await pool.query('SELECT 1 AS alive, NOW() AS server_time;');
      const durationMs = Date.now() - startTime;

      return res.status(200).json({
        success: true,
        data: {
          status: 'connected',
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
          message: 'PostgreSQL database is currently unreachable.',
          details: env.NODE_ENV === 'production' ? null : err.message,
        },
      });
    }
  });

  // Authentication & Session Routes
  app.use('/api/v1/auth', authRouter);

  // Lead Management Routes
  app.use('/api/v1/leads', leadsRouter);

  // Employee Management Routes (Phase 6)
  app.use('/api/v1/employees', employeesRouter);

  // Team Management Routes (Phase 6)
  app.use('/api/v1/teams', teamsRouter);

  // Follow-ups & Task Scheduling Routes (Phase 7)
  app.use('/api/v1/followups', followupsRouter);

  // Dashboard & Analytics Routes (Phase 8)
  app.use('/api/v1/dashboard', dashboardRouter);

  // Reports & Data Export Routes (Phase 9)
  app.use('/api/v1/reports', reportsRouter);
  app.use('/api/v1/platform/reports', platformReportsRouter);

  // Phase 10 Modules: Notifications, Organization Settings, Users, Platform, Activities
  app.use('/api/v1/notifications', notificationsRouter);
  app.use('/api/v1/organization', organizationRouter);
  app.use('/api/v1/users', usersRouter);
  app.use('/api/v1/platform', platformRouter);
  app.use('/api/v1/activities', activitiesRouter);

  // 404 Handler
  app.use(notFoundMiddleware);

  // Centralized Error Handler
  app.use(errorMiddleware);

  return app;
}

export const app = createApp();
