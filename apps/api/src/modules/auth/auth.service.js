import argon2 from 'argon2';
import { userRepository } from '../../repositories/user.repository.js';
import { refreshTokenRepository } from '../../repositories/refresh-token.repository.js';
import { pool, withTransaction } from '../../config/database.js';
import {
  generateAccessToken,
  generateRefreshToken,
  hashRefreshToken,
  calculateExpiryDate,
} from '../../utils/token.utils.js';
import { AppError } from '../../errors/app-error.js';

export const authService = {
  /**
   * Authenticates user credentials and generates dual tokens
   * @param {object} params
   * @param {string} params.email
   * @param {string} params.password
   * @param {string} [params.organizationSlug]
   * @returns {Promise<object>} { user, accessToken, rawRefreshToken }
   */
  async login({ email, password, organizationSlug }) {
    let user;

    if (organizationSlug) {
      // Regular organization user
      user = await userRepository.findByEmailAndOrgSlug(email, organizationSlug);

      if (!user) {
        throw AppError.unauthorized('Invalid email, password, or organization slug', 'INVALID_CREDENTIALS');
      }

      if (!user.organization_is_active) {
        throw AppError.unauthorized('Your organization has been suspended or deactivated', 'ORGANIZATION_INACTIVE');
      }
    } else {
      // Platform Super Admin login (organizationSlug omitted)
      user = await userRepository.findSuperAdminByEmail(email);

      if (!user) {
        throw AppError.unauthorized('Invalid email or password', 'INVALID_CREDENTIALS');
      }
    }

    if (!user.is_active) {
      throw AppError.unauthorized('Your user account has been deactivated', 'USER_INACTIVE');
    }

    // Verify password with Argon2
    const passwordValid = await argon2.verify(user.password_hash, password);
    if (!passwordValid) {
      throw AppError.unauthorized('Invalid email or password', 'INVALID_CREDENTIALS');
    }

    // Update last login timestamp asynchronously
    userRepository.updateLastLogin(user.id).catch((err) => {
      console.error('Error updating last login:', err);
    });

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const rawRefreshToken = generateRefreshToken();
    const tokenHash = hashRefreshToken(rawRefreshToken);
    const expiresAt = calculateExpiryDate();

    // Persist hashed refresh token
    await refreshTokenRepository.create({
      userId: user.id,
      tokenHash,
      expiresAt,
    });

    const safeUser = {
      id: user.id,
      organizationId: user.organization_id || null,
      organizationName: user.organization_name || null,
      organizationSlug: user.organization_slug || null,
      organizationCurrency: user.organization_currency || 'USD',
      organizationTimezone: user.organization_timezone || 'America/New_York',
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      phone: user.phone || null,
      role: user.role,
      lastLoginAt: user.last_login_at || null,
    };

    return {
      user: safeUser,
      accessToken,
      rawRefreshToken,
    };
  },

  /**
   * Refreshes an active session with automatic token rotation and reuse detection
   * @param {string} rawRefreshToken
   * @returns {Promise<object>} { accessToken, rawRefreshToken }
   */
  async refreshSession(rawRefreshToken) {
    if (!rawRefreshToken) {
      throw AppError.unauthorized('Refresh token is required', 'REFRESH_TOKEN_REQUIRED');
    }

    const tokenHash = hashRefreshToken(rawRefreshToken);
    const record = await refreshTokenRepository.findByTokenHash(tokenHash);

    if (!record) {
      throw AppError.unauthorized('Invalid refresh session', 'REFRESH_TOKEN_INVALID');
    }

    // REUSE DETECTION: If a previously revoked token is presented, terminate ALL sessions for security
    if (record.revoked_at !== null) {
      console.warn(`[SECURITY ALERT] Refresh token reuse detected for user ${record.user_id}! Revoking all sessions.`);
      await refreshTokenRepository.revokeAllForUser(record.user_id);
      throw AppError.unauthorized(
        'Security violation: Refresh token reuse detected. All active sessions have been terminated. Please log in again.',
        'REFRESH_TOKEN_REUSED',
      );
    }

    // Check expiration
    if (new Date(record.expires_at).getTime() < Date.now()) {
      await refreshTokenRepository.revokeById(record.id);
      throw AppError.unauthorized('Refresh token has expired. Please log in again.', 'REFRESH_TOKEN_EXPIRED');
    }

    // Verify user and organization are still active
    const user = await userRepository.findById(record.user_id);
    if (!user || !user.is_active) {
      await refreshTokenRepository.revokeById(record.id);
      throw AppError.unauthorized('User account is inactive', 'USER_INACTIVE');
    }

    if (user.role !== 'SUPER_ADMIN' && user.organization_id && !user.organization_is_active) {
      await refreshTokenRepository.revokeById(record.id);
      throw AppError.unauthorized('Organization account is inactive', 'ORGANIZATION_INACTIVE');
    }

    // Atomic Token Rotation inside a single SQL transaction
    const newRawRefreshToken = generateRefreshToken();
    const newTokenHash = hashRefreshToken(newRawRefreshToken);
    const newExpiresAt = calculateExpiryDate();

    await withTransaction(async (client) => {
      // 1. Revoke the old token
      await refreshTokenRepository.revokeById(record.id, client);

      // 2. Insert the new rotated token
      await refreshTokenRepository.create(
        {
          userId: user.id,
          tokenHash: newTokenHash,
          expiresAt: newExpiresAt,
        },
        client,
      );
    });

    const newAccessToken = generateAccessToken(user);

    return {
      accessToken: newAccessToken,
      rawRefreshToken: newRawRefreshToken,
    };
  },

  /**
   * Revokes the current session's refresh token
   * @param {string} rawRefreshToken
   */
  async logout(rawRefreshToken) {
    if (rawRefreshToken) {
      const tokenHash = hashRefreshToken(rawRefreshToken);
      await refreshTokenRepository.revokeByTokenHash(tokenHash);
    }
  },

  /**
   * Revokes all active refresh sessions for a user
   * @param {string} userId
   */
  async logoutAll(userId) {
    await refreshTokenRepository.revokeAllForUser(userId);
  },

  /**
   * Updates user password and terminates existing refresh sessions
   * @param {string} userId
   * @param {object} params
   * @param {string} params.currentPassword
   * @param {string} params.newPassword
   */
  async changePassword(userId, { currentPassword, newPassword }) {
    const user = await userRepository.findWithPasswordById(userId);

    if (!user) {
      throw AppError.notFound('User not found', 'USER_NOT_FOUND');
    }

    const isMatch = await argon2.verify(user.password_hash, currentPassword);
    if (!isMatch) {
      throw AppError.badRequest('Current password is incorrect', 'INVALID_CURRENT_PASSWORD');
    }

    const newHash = await argon2.hash(newPassword);

    await withTransaction(async (client) => {
      // Update password hash
      await userRepository.updatePasswordHash(userId, newHash, client);

      // Revoke all existing refresh sessions to force re-login
      await refreshTokenRepository.revokeAllForUser(userId, client);
    });
  },

  /**
   * Fetches current authenticated user profile
   * @param {string} userId
   * @returns {Promise<object>}
   */
  async getMe(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw AppError.notFound('User profile not found', 'USER_NOT_FOUND');
    }

    return {
      id: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      phone: user.phone || null,
      role: user.role,
      organizationId: user.organization_id || null,
      organizationName: user.organization_name || null,
      organizationSlug: user.organization_slug || null,
      organizationCurrency: user.organization_currency || 'USD',
      organizationTimezone: user.organization_timezone || 'America/New_York',
      isActive: user.is_active,
      lastLoginAt: user.last_login_at,
      createdAt: user.created_at,
    };
  },

  /**
   * Initializes a safe, restricted, read-only demo session
   * Bound exclusively to the leadora-demo organization with role DEMO
   * @returns {Promise<object>}
   */
  async createDemoSession() {
    // 1. Find demo organization
    const orgRes = await pool.query(
      `SELECT id, name, slug, currency, timezone, is_active FROM organizations WHERE slug = 'leadora-demo' LIMIT 1;`,
    );

    if (orgRes.rows.length === 0 || !orgRes.rows[0].is_active) {
      throw AppError.internal('Demo organization is currently unavailable.', 'DEMO_UNAVAILABLE');
    }

    const demoOrg = orgRes.rows[0];

    // 2. Find demo viewer user
    const userRes = await pool.query(
      `SELECT id, organization_id, first_name, last_name, email, role, is_active
       FROM users
       WHERE organization_id = $1 AND email = 'demo-viewer@leadora.example.com'
       LIMIT 1;`,
      [demoOrg.id],
    );

    if (userRes.rows.length === 0 || !userRes.rows[0].is_active) {
      throw AppError.internal('Demo viewer user is currently unavailable.', 'DEMO_USER_UNAVAILABLE');
    }

    const demoUser = userRes.rows[0];

    // 3. Generate signed access token with isDemo: true
    const accessToken = generateAccessToken(
      {
        id: demoUser.id,
        organization_id: demoOrg.id,
        role: 'DEMO',
      },
      { isDemo: true },
    );

    return {
      accessToken,
      user: {
        id: demoUser.id,
        organizationId: demoOrg.id,
        organizationName: demoOrg.name,
        organizationSlug: demoOrg.slug,
        organizationCurrency: demoOrg.currency || 'USD',
        organizationTimezone: demoOrg.timezone || 'America/New_York',
        firstName: demoUser.first_name,
        lastName: demoUser.last_name,
        email: demoUser.email,
        role: 'DEMO',
        isDemo: true,
      },
    };
  },
};

