# Business CRM and Lead Management System

A multi-organization Business CRM and Lead Management System for small and medium-sized businesses (SMBs). Built with **React**, **Node.js/Express**, and **PostgreSQL** using raw parameterized SQL queries.

---

## 1. Prerequisites and Required Software

Before running this project on your local machine, ensure you have installed:

- **Node.js**: v20.x or higher (LTS recommended)
- **npm**: v10.x or higher
- **Docker Desktop**: With Docker Engine and Docker Compose enabled
- **Git**

---

## 2. Project Architecture and Folder Structure

```
business-crm/
├── apps/
│   ├── api/                              # Backend Express.js Application (ES Modules)
│   │   ├── src/
│   │   │   ├── config/
│   │   │   │   ├── database.js          # pg.Pool connection & withTransaction helper
│   │   │   │   └── env.js               # Zod environment variable validation
│   │   │   ├── middleware/
│   │   │   │   ├── error.middleware.js  # Centralized error handling
│   │   │   │   └── not-found.middleware.js # 404 handler
│   │   │   ├── utils/                   # Shared utility helpers
│   │   │   ├── app.js                   # Express app configuration & health routes
│   │   │   └── server.js                # Server entry point & graceful shutdown
│   │   └── package.json
│   │
│   └── web/                              # Frontend React + Vite Application
│       ├── src/
│       │   ├── layouts/
│       │   │   └── AppLayout.jsx        # Top navbar & main shell layout
│       │   ├── pages/
│       │   │   └── HomePage.jsx         # Initial home screen with connectivity test
│       │   ├── services/
│       │   │   └── api.js               # Axios API client (proxied to /api)
│       │   ├── App.jsx                  # React Router & TanStack Query client
│       │   ├── main.jsx                 # React DOM entry point
│       │   └── index.css                # Tailwind CSS directives
│       ├── index.html
│       ├── vite.config.js               # Vite proxy config (/api -> http://localhost:5000)
│       ├── tailwind.config.js
│       ├── postcss.config.js
│       └── package.json
│
├── docs/                                 # Architectural Specifications
│   ├── functional-requirements.md
│   ├── role-permissions.md
│   ├── application-workflows.md
│   ├── database-design.md
│   ├── api-design.md
│   ├── architecture.md
│   └── frontend-pages.md
│
├── infrastructure/
│   └── docker/
│       └── docker-compose.yml           # PostgreSQL 16 container with persistent volume
│
├── .env.example                          # Environment variables template
├── .env                                  # Local development credentials (git-ignored)
├── .gitignore
├── .eslintrc.json                        # ESLint configuration
├── .prettierrc                           # Prettier configuration
├── package.json                          # Root npm workspaces configuration
└── README.md
```

---

## 3. Environment Setup

Copy `.env.example` to `.env` in the root of the project:

```bash
cp .env.example .env
```

Verify your `.env` contains:

```env
NODE_ENV=development

# PostgreSQL Configuration
DB_USER=crm_admin
DB_PASSWORD=crm_secret_password
DB_NAME=business_crm
DB_PORT=5432
DB_HOST=localhost

# Backend API Configuration
PORT=5000
FRONTEND_URL=http://localhost:5173
DATABASE_URL="postgresql://crm_admin:crm_secret_password@localhost:5432/business_crm"

# Frontend Configuration
VITE_API_BASE_URL=/api
```

---

## 4. Step-by-Step Local Development Workflow

### Step 1: Start PostgreSQL via Docker Compose
Run the following command from the project root:

```bash
docker compose -f infrastructure/docker/docker-compose.yml up -d
```
*(Or use the npm script: `npm run db:up`)*

To check container status:
```bash
docker compose -f infrastructure/docker/docker-compose.yml ps
```

### Step 2: Install Dependencies
Install all workspace dependencies from the project root:

```bash
npm install
```

### Step 3: Start Frontend and Backend Together
Run the root development command:

```bash
npm run dev
```

This launches both servers concurrently:
- **Backend API**: `http://localhost:5000`
- **Frontend App**: `http://localhost:5173`

Alternatively, you can run them in separate terminals:
- Backend only: `npm run dev:api`
- Frontend only: `npm run dev:web`

---

## 5. Verifying Connectivity

### A. Verify Backend Health Check
Open your browser or run:
```bash
curl http://localhost:5000/api/v1/health
```
Expected response (`200 OK`):
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "message": "Business CRM Backend API is running",
    "uptime": 12,
    "environment": "development"
  }
}
```

### B. Verify Database Connectivity
```bash
curl http://localhost:5000/api/v1/health/db
```
Expected response (`200 OK`):
```json
{
  "success": true,
  "data": {
    "status": "connected",
    "database": "business_crm",
    "responseTimeMs": 4,
    "message": "PostgreSQL connection verified successfully"
  }
}
```

### C. Verify in the Browser UI
1. Open `http://localhost:5173` in your browser.
2. Click the **"Test Backend Connectivity"** button.
3. Both the **Backend API** and **PostgreSQL DB** indicators will turn green with response times displayed.

---

## 6. Stopping Containers

When you are done developing:

```bash
docker compose -f infrastructure/docker/docker-compose.yml down
```
*(Or use the npm script: `npm run db:down`)*

> **Note:** The database volume (`business_crm_postgres_data`) preserves all data across container restarts. To remove the volume and start completely fresh, use:
> ```bash
> docker compose -f infrastructure/docker/docker-compose.yml down -v
> ```

---

## 7. Code Quality and Linting

- Run linting:
  ```bash
  npm run lint
  ```
- Format code:
  ```bash
  npm run format
  ```
- Build frontend:
  ```bash
  npm run build:web
  ```

