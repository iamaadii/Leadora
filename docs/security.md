# Security, Authentication & Role Permissions Guide

This document is the unified security and authorization specification for Leadora, detailing cryptographic protections, session management, and the complete Role-Based Access Control (RBAC) matrix.

---

## 1. Authentication & Token Architecture

Leadora implements an enterprise-grade, stateless authentication architecture with short-lived tokens and secure session rotation:

- **Access Tokens:** 10-minute lifetime. Stored strictly in-memory in JavaScript application state (never stored in `localStorage` or `sessionStorage` to eliminate XSS token theft).
- **Refresh Tokens:** 7-day lifetime. Transmitted exclusively inside an `HttpOnly`, `SameSite=Lax`, `Secure` (production) cookie.
- **Token Rotation:** Every token refresh operation invalidates the existing refresh token and issues a cryptographic replacement. If token reuse is detected, all associated family sessions are revoked immediately.
- **Instant Revocation:** Account deactivation or workspace suspension immediately terminates all active sessions in the database (`revoked_at = NOW()`), blocking the next API request.

---

## 2. Password Security & Defense-in-Depth

- **Argon2id Hashing:** User passwords are encrypted using memory-hard Argon2id (`argon2.hash`). No plaintext passwords ever touch persistent storage or application logs.
- **Timing Attack Resistance:** Password comparison uses constant-time validation.
- **Enumeration Protection:** Failed login requests return generic error envelopes (`"Authentication failed. Please verify your credentials."`), giving attackers zero signal regarding whether an email address exists.
- **SQL Injection Defense:** Zero ORM string interpolation. All SQL queries use PostgreSQL parameterized variables (`$1, $2, $3`).
- **Brute-Force Rate Limiting:** Dedicated Express rate-limiters throttle repeated authentication attempts by IP address.
- **Formula Injection Defense:** All spreadsheet and CSV exports sanitize cell values prefixed with dangerous command characters (`=`, `+`, `-`, `@`) with a leading tab/apostrophe.

---

## 3. Multi-Tenant Data Boundaries

- Every query executed by a tenant user includes `WHERE organization_id = $1`.
- `organization_id` is derived strictly from the cryptographic claims of the verified JWT token—never trusted from user request bodies or query parameters.
- Attempting to access or alter another organization's records results in a standard HTTP 404 (Not Found), preventing cross-tenant existence probing.

---

## 4. Role Hierarchy Overview

```
1. SUPER_ADMIN  ───> Manages platform workspaces and global tenant provisioning (org_id = NULL)
       │
       ▼
2. ADMIN        ───> Manages tenant organization profile, employees, teams, and settings
       │
       ▼
3. MANAGER      ───> Oversees assigned sales team, team leads, and member follow-ups
       │
       ▼
4. EMPLOYEE     ───> Manages own assigned leads, logs activities, and schedules tasks
```

---

## 5. Complete Role Permissions Matrix

| Feature / Action                      |  Super Admin  |      Admin      |    Manager    |   Employee   |
| :------------------------------------ | :-----------: | :-------------: | :-----------: | :----------: |
| **Platform & Organizations**          |               |                 |               |              |
| Create new customer workspace         |    **YES**    |       NO        |      NO       |      NO      |
| Suspend or reactivate workspace       |    **YES**    |       NO        |      NO       |      NO      |
| View platform-wide metrics            |    **YES**    |       NO        |      NO       |      NO      |
| Edit company name, currency, timezone |      NO       |     **YES**     |      NO       |      NO      |
| **Employees & Teams**                 |               |                 |               |              |
| Invite / provision new employee       |      NO       |     **YES**     |      NO       |      NO      |
| Change an employee's role             |      NO       |     **YES**     |      NO       |      NO      |
| Deactivate / reactivate employee      |      NO       |     **YES**     |      NO       |      NO      |
| Create sales team                     |      NO       |     **YES**     |      NO       |      NO      |
| Add / remove team members             |      NO       |     **YES**     |      NO       |      NO      |
| View team member roster               |      NO       |     **YES**     | **Own Team**  | **Own Team** |
| **Leads & Pipeline**                  |               |                 |               |              |
| Create new lead                       |      NO       |     **YES**     |    **YES**    |   **YES**    |
| View leads directory & Kanban         |      NO       | **All Company** | **Team Only** | **Own Only** |
| Edit lead details & status            |      NO       | **All Company** | **Team Only** | **Own Only** |
| Reassign lead                         |      NO       |     **YES**     | **Own Team**  |      NO      |
| Soft-delete (archive) / restore lead  |      NO       |     **YES**     |      NO       |      NO      |
| **Follow-ups & Tasks**                |               |                 |               |              |
| Schedule new follow-up                |      NO       |     **YES**     |    **YES**    |   **YES**    |
| View follow-ups & queues              |      NO       | **All Company** | **Team Only** | **Own Only** |
| Mark follow-up completed / cancelled  |      NO       | **All Company** | **Team Only** | **Own Only** |
| **Reports & Analytics**               |               |                 |               |              |
| View reports & export data            | Platform Only | **All Company** | **Team Only** | **Own Only** |
| View executive KPI dashboard          |      NO       | **All Company** | **Team Only** | **Own Only** |
