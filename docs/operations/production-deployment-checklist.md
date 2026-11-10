# Production Deployment Checklist

This document is a simple step-by-step checklist to follow before launching Leadora into production.

---

## 1. Before You Deploy

- [ ] **Database Ready:** PostgreSQL 16+ is running with SSL enabled.
- [ ] **Backup Taken:** A fresh backup of the database has been taken and verified.
- [ ] **Production Keys:** `NODE_ENV=production` is set, and a random 64-character `JWT_ACCESS_SECRET` is generated.
- [ ] **Domain Configured:** `FRONTEND_URL` is set to your real domain (e.g. `https://crm.example.com`).
- [ ] **HTTPS Active:** SSL certificates (HTTPS) are active so secure cookies can be delivered.
- [ ] **Tests Pass:** `npm --workspace=apps/api test` passes all tests.
- [ ] **Lint Clean:** `npm run lint` passes with 0 errors.
- [ ] **Frontend Built:** `npm run build:web` succeeds without errors.

---

## 2. Deployment Steps

### Step 1: Run Database Migrations
Run all SQL migration files against the production database:
```bash
npm --workspace=apps/api run db:migrate
```

### Step 2: Start the Backend Server
Start the backend using your container runner or process supervisor:
```bash
node apps/api/src/server.js
```

### Step 3: Deploy the Frontend
Upload the static files from `apps/web/dist` to your web server (e.g., Nginx, Cloudflare Pages, AWS S3).
Ensure URL rewriting is active so all paths point to `index.html`.

---

## 3. After Deployment (Smoke Test)

- [ ] **Health Check:** Open `https://api.yourdomain.com/api/v1/health` and verify it returns `status: "healthy"`.
- [ ] **Database Check:** Open `https://api.yourdomain.com/api/v1/health/db` and verify database connectivity.
- [ ] **Login Test:** Log in with an Admin account and verify the dashboard loads.
- [ ] **Lead Creation:** Create a sample lead and verify it appears on the Kanban board.
- [ ] **Export Test:** Download a sample report in CSV, Excel, and PDF formats to confirm exports work.

