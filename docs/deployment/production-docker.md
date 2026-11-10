# Production Docker Deployment Guide for Leadora

## Overview

Leadora features a production-ready containerized architecture orchestrated via Docker Compose:
- **`web`**: Nginx Alpine multi-stage runtime serving optimized Vite SPA assets, handling security headers, gzip compression, and reverse-proxying `/api/` to the backend.
- **`api`**: Node.js 20 Alpine minimal container running as non-root `USER node` with built-in `/health` check.
- **`migrate`**: Transient one-shot container executing database migrations (`node src/database/migrate.js`) against PostgreSQL and cleanly terminating before the API initializes.
- **`postgres`**: PostgreSQL 16 Alpine with healthcheck, parameterized queries, and persistent Docker named volume.

---

## 1. Prerequisites

- Docker Engine 24+ and Docker Compose v2.20+
- Domain name pointed to your server IP (or localhost for local testing)
- A populated `.env` file based on `.env.example`

---

## 2. Configuration (`.env`)

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Set the production variables:
```ini
NODE_ENV=production
DB_USER=crm_admin
DB_PASSWORD=YOUR_STRONG_PASSWORD_HERE
DB_NAME=business_crm
WEB_PORT=80

# Generate 32+ character random secret: openssl rand -base64 32
JWT_ACCESS_SECRET="a98b4c2e81d7f45a0b92e76f183d5a2c94b7e8d1a3c6f2e0"
FRONTEND_URL=https://crm.yourdomain.com
CORS_ORIGIN=https://crm.yourdomain.com
```

---

## 3. Deployment Commands

### Build and Launch Services
```bash
docker compose -f infrastructure/docker/docker-compose.prod.yml up -d --build
```

### Check Running Containers
```bash
docker compose -f infrastructure/docker/docker-compose.prod.yml ps
```

### View Live Logs
```bash
docker compose -f infrastructure/docker/docker-compose.prod.yml logs -f api
```

### Bootstrap Initial Super Admin
```bash
docker compose -f infrastructure/docker/docker-compose.prod.yml exec api npm run admin:create
```

---

## 4. Reverse Proxy & SSE Considerations

`apps/web/nginx.conf` is preconfigured to support Server-Sent Events (SSE) by disabling proxy buffering on `/api/`:

```nginx
location /api/ {
    proxy_pass http://api:5000;
    proxy_http_version 1.1;
    proxy_buffering off;
    proxy_cache off;
    proxy_read_timeout 86400s;
    proxy_set_header Connection '';
    chunked_transfer_encoding off;
}
```

This prevents Nginx from holding notification chunks, delivering instant real-time notifications to users.
