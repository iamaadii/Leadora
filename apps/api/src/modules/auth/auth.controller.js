import { authService } from './auth.service.js';
import {
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
  getRefreshTokenFromRequest,
} from '../../utils/cookie.utils.js';

export const authController = {
  /**
   * POST /api/v1/auth/login
   */
  async login(req, res, next) {
    try {
      const { user, accessToken, rawRefreshToken } = await authService.login(req.body);

      // Set HttpOnly refresh token cookie
      setRefreshTokenCookie(res, rawRefreshToken);

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          accessToken,
          user,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/v1/auth/refresh
   */
  async refresh(req, res, next) {
    try {
      const rawRefreshToken = getRefreshTokenFromRequest(req);
      const { accessToken, rawRefreshToken: newRawToken } = await authService.refreshSession(rawRefreshToken);

      // Rotate cookie
      setRefreshTokenCookie(res, newRawToken);

      res.status(200).json({
        success: true,
        message: 'Session refreshed successfully',
        data: {
          accessToken,
        },
      });
    } catch (err) {
      // Clear potentially invalid/expired cookie on refresh error
      clearRefreshTokenCookie(res);
      next(err);
    }
  },

  /**
   * POST /api/v1/auth/logout
   */
  async logout(req, res, next) {
    try {
      const rawRefreshToken = getRefreshTokenFromRequest(req);
      await authService.logout(rawRefreshToken);

      clearRefreshTokenCookie(res);

      res.status(200).json({
        success: true,
        message: 'Logged out successfully',
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/v1/auth/logout-all
   */
  async logoutAll(req, res, next) {
    try {
      await authService.logoutAll(req.user.id);
      clearRefreshTokenCookie(res);

      res.status(200).json({
        success: true,
        message: 'All active sessions have been terminated',
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/v1/auth/me
   */
  async getMe(req, res, next) {
    try {
      const user = await authService.getMe(req.user.id);

      res.status(200).json({
        success: true,
        data: {
          user,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/v1/auth/change-password
   */
  async changePassword(req, res, next) {
    try {
      await authService.changePassword(req.user.id, req.body);
      clearRefreshTokenCookie(res);

      res.status(200).json({
        success: true,
        message: 'Password changed successfully. Please log in again.',
      });
    } catch (err) {
      next(err);
    }
  },
};

