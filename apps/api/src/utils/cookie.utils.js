import { env } from '../config/env.js';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/api/v1/auth',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
};

/**
 * Sets the raw refresh token into a secure HttpOnly cookie on the response
 * @param {import('express').Response} res
 * @param {string} token - Raw refresh token
 */
export function setRefreshTokenCookie(res, token) {
  res.cookie(env.COOKIE_NAME, token, COOKIE_OPTIONS);
}

/**
 * Clears the refresh token cookie
 * @param {import('express').Response} res
 */
export function clearRefreshTokenCookie(res) {
  res.clearCookie(env.COOKIE_NAME, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/api/v1/auth',
  });
}

/**
 * Extracts the refresh token from incoming cookies
 * @param {import('express').Request} req
 * @returns {string|null}
 */
export function getRefreshTokenFromRequest(req) {
  return req.cookies?.[env.COOKIE_NAME] || null;
}
