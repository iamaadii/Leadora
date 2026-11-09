# Technical Architecture and System Design

## 1. Architectural Strategy

This application is built as a **Modular Monolith**.

### Why a Modular Monolith?
- **Single codebase:** Easy for one developer to run, test, and debug.
- **ACID Transactions:** Changes that must happen together (like moving a lead stage and adding an activity log) run in a single SQL transaction. There is no complicated distributed transaction overhead.
- **Speed:** Function calls inside the server are instant, with zero network lag between microservices.
- **Maintainability:** Code is divided into clean layers with strict responsibilities.

```
+-------------------------------------------------------------------------------+
|                             REACT FRONTEND (Vite)                             |
|          React Router  |  TanStack Query  |  Tailwind CSS  |  Axios           |
+-------------------------------------------------------------------------------+
                                        |
                          HTTP / REST API (JSON)
                                        |
+-------------------------------------------------------------------------------+
|                            EXPRESS BACKEND (Node.js)                          |
|                                                                               |
|   1. ROUTES       : Define URL paths and HTTP verbs                           |
|         │                                                                     |
|         ▼                                                                     |
|   2. MIDDLEWARE   : Check JWT Cookie, verify Roles, validate Zod schemas      |
|         │                                                                     |
|         ▼                                                                     |
|   3. CONTROLLERS  : Read request, call Service, send clean JSON response      |
|         │                                                                     |
|         ▼                                                                     |
|   4. SERVICES     : Business rules, duplicate checks, permission validation   |
|         │                                                                     |
|         ▼                                                                     |
|   5. REPOSITORIES : Execute parameterized raw SQL queries ($1, $2)            |
|         │                                                                     |
|         ▼                                                                     |
|   6. POSTGRESQL   : Relational database with row-level organization_id filters|
+-------------------------------------------------------------------------------+
```

---

## 2. Layer Responsibilities Explained

Each backend folder has one clear responsibility. No shortcuts:

1. **Routes (`routes/*.js`)**
   - Connects HTTP paths (e.g. `POST /api/v1/leads`) to middleware and controller functions.
   - Does zero data processing.
2. **Middleware (`middleware/*.js`)**
   - `authMiddleware.js`: Checks the JWT cookie and attaches `req.user` (`userId`, `organizationId`, `role`).
   - `roleMiddleware.js`: Checks if the user's role is allowed (e.g. `requireRole(['ADMIN', 'MANAGER'])`).
   - `validateMiddleware.js`: Validates `req.body`, `req.query`, or `req.params` with Zod.
3. **Controllers (`controllers/*.js`)**
   - Receives the request from Express.
   - Extracts input data and passes it to the corresponding Service.
   - Returns a structured JSON response (`res.status(200).json(...)`).
   - **Important:** Controllers NEVER contain SQL queries or business calculation logic.
4. **Services (`services/*.js`)**
   - The heart of the application.
   - Implements business logic (e.g., "Check if a lead with this email already exists before saving", "Calculate overdue days", "Send in-app notification when a lead is assigned").
   - Decides when to open a database transaction.
5. **Repositories (`repositories/*.js`)**
   - The only place in the whole project where raw SQL queries are written.
   - Uses the `pg` connection pool.
   - Always uses parameterized placeholders (`$1, $2, $3`) to completely eliminate SQL injection.
6. **Database (`db/*.js`)**
   - Manages the PostgreSQL connection pool using `pg.Pool`.
   - Provides a helper function for running SQL transactions (`withTransaction`).

---

## 3. Database Transactions Example

When two database writes must succeed or fail together, the Service uses a transaction:

```javascript
// Example: Creating a lead and writing its first activity log together
export async function createLeadWithActivity(leadData, user) {
  return await withTransaction(async (client) => {
    // 1. Insert lead using the transaction client
    const newLead = await leadRepository.createLead(client, leadData, user.organizationId);

    // 2. Insert activity log using the same client
    await activityRepository.createLog(client, {
      organizationId: user.organizationId,
      leadId: newLead.id,
      userId: user.id,
      type: 'LEAD_CREATED',
      summary: `Lead created by ${user.firstName} ${user.lastName}`,
    });

    return newLead;
  });
}
```
If anything crashes before step 2 finishes, PostgreSQL rolls back step 1 automatically.

---

## 4. Frontend Architecture and Pages

The frontend is a single-page application built with React, Vite, and Tailwind CSS.

### 4.1 Folder Structure
```
frontend/
├── src/
│   ├── components/         # Reusable buttons, cards, modals, tables, badges
│   ├── context/            # AuthContext (stores logged-in user state)
│   ├── hooks/              # Custom hooks (e.g. useAuth, useDebounce)
│   ├── layouts/            # AppLayout (Sidebar, Top Navigation), AuthLayout
│   ├── pages/              # Screen components
│   │   ├── LoginPage.jsx
│   │   ├── DashboardPage.jsx
│   │   ├── LeadsListPage.jsx
│   │   ├── LeadDetailPage.jsx
│   │   ├── KanbanPage.jsx
│   │   ├── FollowUpsPage.jsx
│   │   ├── TeamsPage.jsx
│   │   ├── UsersPage.jsx
│   │   ├── ReportsPage.jsx
│   │   └── SettingsPage.jsx
│   ├── services/           # Axios API functions (e.g. leadService.js)
│   ├── App.jsx             # React Router setup
│   ├── main.jsx            # Entry point
│   └── index.css           # Tailwind CSS imports
```

### 4.2 Data Fetching with TanStack Query
- **TanStack Query** handles API state, caching, and auto-refetching:
  - Reading leads: `useQuery({ queryKey: ['leads', filters], queryFn: () => getLeads(filters) })`
  - Updating a lead: `useMutation` automatically refreshes the lead list cache after a successful update.
  - Instant UI feedback with optimistic updates on the Kanban board.

---

## 5. Authentication and Security Strategy

1. **Login Flow:**
   - User submits email and password.
   - Server checks Argon2 password hash.
   - Server issues a JWT signed with a secret key.
   - JWT payload contains `{ id, organizationId, role }`.
   - Token is sent to browser in an `HttpOnly`, `SameSite=Strict`, `Secure` (in production) cookie.
2. **Why HttpOnly Cookies?**
   - Storing tokens in browser `localStorage` allows malicious scripts to steal them (XSS attack).
   - `HttpOnly` cookies cannot be accessed by browser JavaScript, providing strong protection.
3. **Data Isolation (Multi-Tenancy):**
   - The user cannot choose which organization to view.
   - `req.user.organizationId` comes directly from the cryptographically verified JWT.
   - Every SQL query uses this verified ID: `WHERE organization_id = $1`.

---

## 6. Error Handling Strategy

### 6.1 Custom Error Class
```javascript
export class AppError extends Error {
  constructor(message, statusCode = 400, code = 'BAD_REQUEST', details = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}
```

### 6.2 Centralized Express Error Handler
All unhandled errors pass into one central error middleware at the bottom of the Express app:
- Form validation errors return `422 Unprocessable Entity`.
- Authentication errors return `401 Unauthorized`.
- Forbidden errors return `403 Forbidden`.
- Missing records return `404 Not Found`.
- Duplicate key errors from PostgreSQL (code `23505`) return `409 Conflict`.
- All other unexpected errors return `500 Internal Server Error` with a safe message so database details are never leaked.

---

## 7. Local Database Setup via Docker Compose

PostgreSQL runs locally in Docker so no local machine configuration is needed:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: crm_postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${DB_USER:-crm_admin}
      POSTGRES_PASSWORD: ${DB_PASSWORD:-crm_secret_password}
      POSTGRES_DB: ${DB_NAME:-business_crm}
    ports:
      - "${DB_PORT:-5432}:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER:-crm_admin} -d ${DB_NAME:-business_crm}"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
```

