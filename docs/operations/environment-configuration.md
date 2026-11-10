# Environment Configuration Guide

This guide explains all environment settings (`.env` file) in simple words.

---

## 1. Quick Example (`.env`)

```env
# Server mode and port
NODE_ENV=development
PORT=5000

# Web app address
FRONTEND_URL=http://localhost:5173

# Database connection
DATABASE_URL=postgresql://crm_admin:crm_secret_password@localhost:5432/business_crm
DATABASE_SSL=false

# Security secrets
JWT_ACCESS_SECRET=super-secret-jwt-access-token-key-minimum-32-chars-long
ACCESS_TOKEN_EXPIRES_IN=10m
REFRESH_TOKEN_EXPIRES_IN=7d
COOKIE_NAME=refreshToken
COOKIE_SAME_SITE=lax

# Rate limits
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_AUTH_MAX=10
```

---

## 2. Variables Explained

| Setting | What It Does | Example |
| :--- | :--- | :--- |
| `NODE_ENV` | Tells the server if it is running in `development`, `test`, or `production`. | `development` |
| `PORT` | The port the backend server listens on. | `5000` |
| `FRONTEND_URL` | The URL of your web frontend. Used to allow API calls (CORS). | `http://localhost:5173` |
| `DATABASE_URL` | The connection link to your PostgreSQL database. | `postgresql://user:pass@localhost:5432/crm` |
| `DATABASE_SSL` | Set to `true` if your cloud database requires encrypted SSL. | `false` (local) or `true` (cloud) |
| `JWT_ACCESS_SECRET` | Secret key used to sign login tokens. Must be at least 32 characters. | (random 64-char string in production) |
| `ACCESS_TOKEN_EXPIRES_IN` | How long a login access token stays valid. | `10m` (10 minutes) |
| `REFRESH_TOKEN_EXPIRES_IN` | How long an active login session lasts. | `7d` (7 days) |
| `RATE_LIMIT_AUTH_MAX` | Maximum number of login attempts allowed before throttling. | `10` |

---

## 3. Production Safety Check

When `NODE_ENV=production`:
- The server checks your `.env` file at startup.
- If `JWT_ACCESS_SECRET` is missing or uses the default test key, the server refuses to start to protect your users.
- You can generate a strong random key by running:
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```

