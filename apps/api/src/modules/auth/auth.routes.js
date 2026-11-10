import { Router } from 'express';
import { authController } from './auth.controller.js';
import { validate, loginSchema, changePasswordSchema } from './auth.validation.js';
import { authenticate } from '../../middleware/authenticate.middleware.js';
import { authorizeRoles } from '../../middleware/authorize.middleware.js';
import { rateLimiter } from '../../middleware/rate-limit.middleware.js';
import { env } from '../../config/env.js';

const router = Router();

// Public routes
router.post(
  '/login',
  rateLimiter({ max: env.RATE_LIMIT_AUTH_MAX, windowMs: env.RATE_LIMIT_WINDOW_MS }),
  validate(loginSchema),
  authController.login,
);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);
router.post(
  '/demo-session',
  rateLimiter({ max: 30, windowMs: env.RATE_LIMIT_WINDOW_MS }),
  authController.createDemoSession,
);

// Protected routes (require valid JWT access token)
router.get('/me', authenticate, authController.getMe);
router.post('/change-password', authenticate, validate(changePasswordSchema), authController.changePassword);
router.post('/logout-all', authenticate, authController.logoutAll);

// RBAC Role Verification Routes
router.get('/test-admin', authenticate, authorizeRoles('ADMIN', 'SUPER_ADMIN'), (req, res) => {
  res.status(200).json({ success: true, message: 'Admin or SuperAdmin access granted' });
});

router.get(
  '/test-manager',
  authenticate,
  authorizeRoles('ADMIN', 'MANAGER', 'SUPER_ADMIN'),
  (req, res) => {
    res.status(200).json({ success: true, message: 'Manager, Admin or SuperAdmin access granted' });
  },
);

export const authRouter = router;
