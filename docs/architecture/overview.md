# System Architecture

This document explains how the Leadora CRM system is built and how its parts talk to each other.

---

## 1. How the System is Built

Leadora is built as a **Modular Monolith**.

### What does Modular Monolith mean?
- **One Project:** All backend code lives in one folder (`apps/api`) and all frontend code lives in another (`apps/web`).
- **Easy to Run:** You do not need to start dozens of microservices. You only start one backend server, one frontend server, and one PostgreSQL database.
- **Safe Transactions:** When multiple things must happen together (like moving a lead stage and writing an activity log), they run in a single database transaction. If anything fails, everything rolls back safely.
- **Fast:** The server calls functions directly in memory with zero network delay between services.

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
|   1. ROUTES       : Match URL paths (like /api/v1/leads)                      |
|         │                                                                     |
|         ▼                                                                     |
|   2. MIDDLEWARE   : Check login cookie, check user role, validate inputs      |
|         │                                                                     |
|         ▼                                                                     |
|   3. CONTROLLERS  : Read the request, call the service, send JSON response    |
|         │                                                                     |
|         ▼                                                                     |
|   4. SERVICES     : Business rules, check permissions, handle logic           |
|         │                                                                     |
|         ▼                                                                     |
|   5. REPOSITORIES : Run raw SQL queries with safe placeholders ($1, $2)       |
|         │                                                                     |
|         ▼                                                                     |
|   6. POSTGRESQL   : Relational database with strict organization data filters |
+-------------------------------------------------------------------------------+
```

---

## 2. Backend Layers

Every folder in the backend has one simple job:

1. **Routes (`routes/*.js`)**
   - Connects a URL path (like `POST /api/v1/leads`) to the right middleware and controller.
   - Does no data processing.
2. **Middleware (`middleware/*.js`)**
   - `authenticate.middleware.js`: Reads the JWT login cookie and attaches the user info (`userId`, `organizationId`, `role`).
   - `authorize.middleware.js`: Checks if the user's role is allowed to open this route.
   - `rate-limit.middleware.js`: Stops brute force attacks by limiting how many requests an IP can make.
   - `error.middleware.js`: Catches errors and returns clean error messages.
3. **Controllers (`controllers/*.js`)**
   - Takes input from the request.
   - Passes data to the Service.
   - Returns a structured JSON response.
   - Never writes SQL queries.
4. **Services (`services/*.js`)**
   - The brain of the app.
   - Contains all business rules (like checking duplicate emails, checking manager team boundaries, creating activity logs).
   - Starts database transactions when multiple steps must happen together.
5. **Repositories (`repositories/*.js`)**
   - The only place where SQL queries are written.
   - Uses parameterized placeholders (`$1, $2`) so attackers cannot inject malicious SQL.
6. **Database Config (`config/database.js`)**
   - Manages the PostgreSQL connection pool.
   - Provides `withTransaction` helper to run multi-step actions safely.

---

## 3. Database Transactions

When two database actions must succeed together, we wrap them in a transaction:

```javascript
export async function createLeadWithActivity(leadData, user) {
  return await withTransaction(async (client) => {
    // 1. Create the lead
    const newLead = await leadRepository.createLead(client, leadData, user.organizationId);

    // 2. Add activity log
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

If step 2 fails, step 1 is automatically canceled by the database.

---

## 4. Frontend Design

The frontend is a single-page app built with React, Vite, and Tailwind CSS.

- **Pages:** Each screen (Dashboard, Leads, Kanban, Teams, Reports) is a page component.
- **Components:** Reusable UI pieces like buttons, modals, badges, cards, and tables.
- **TanStack Query:** Handles fetching, caching, and auto-refreshing server data without reloading the page.
- **Axios:** Sends API requests with credentials so login cookies are automatically included.

---

## 5. Security & Privacy

1. **HttpOnly Cookies:** Login tokens are stored in HttpOnly cookies so JavaScript cannot read or steal them.
2. **Multi-Tenant Data Privacy:** Users can only see records belonging to their own organization. The organization ID is taken directly from the verified token, never from user input.
3. **Password Security:** All passwords are protected using Argon2 before saving to the database.

