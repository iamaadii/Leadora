# Platform Organization Management Documentation

## 1. Overview

Platform Organization Management empowers the platform `SUPER_ADMIN` to provision, monitor, and suspend tenant organizations across the entire multi-tenant system while preserving complete tenant data isolation.

---

## 2. Platform Boundaries & Multi-Tenant Isolation

1. **Isolation Principle**:
   - The Super Admin does not participate in tenant operations, pipelines, or customer leads directly.
   - All tenant customer records (`leads`, `followups`, `notes`) remain strictly segregated per organization ID.
2. **Administrative Role**:
   - Super Admins oversee high-level organization status (`ACTIVE` vs `SUSPENDED`).
   - Super Admins provision new tenant organizations alongside their initial tenant Administrator.

---

## 3. Provisioning & Suspension Lifecycle

### Atomic Provisioning
When a new organization is provisioned:
1. An isolated `organizations` database record is inserted within an atomic database transaction.
2. A root tenant user is created with role `ADMIN`.
3. The initial administrator's password is securely hashed using Argon2id.
4. If either step fails (e.g., duplicate slug or duplicate email), the entire transaction rolls back cleanly.

### Organization Suspension
When an organization is suspended:
1. `organizations.status` is updated to `'SUSPENDED'`.
2. All active refresh token sessions for all users belonging to that organization are immediately revoked from `refresh_tokens`.
3. Any attempt by suspended tenant users to authenticate (`POST /auth/login`) or refresh their session (`POST /auth/refresh`) is rejected with `HTTP 403 Forbidden` (`Organization account is suspended`).

---

## 4. API Specification

All endpoints in `/api/v1/platform` strictly enforce `requireRole(['SUPER_ADMIN'])`.

### `GET /api/v1/platform/organizations`
- **Query Params**:
  - `page` (integer, default 1)
  - `limit` (integer, default 20)
  - `search` (string, case-insensitive match on name or slug)
  - `status` (`ACTIVE` | `SUSPENDED`)
- **Response**: Paginated organization listings.

### `POST /api/v1/platform/organizations`
- **Request Body**:
```json
{
  "name": "Apex Global Logistics",
  "slug": "apex-global",
  "adminFirstName": "Arthur",
  "adminLastName": "Dent",
  "adminEmail": "admin@apex.com",
  "adminPassword": "Password123!"
}
```
- **Responses**:
  - `HTTP 201 Created`: Organization and Admin user created.
  - `HTTP 409 Conflict`: Organization slug or Admin email already exists.
  - `HTTP 422 Unprocessable Entity`: Validation failure.

### `PATCH /api/v1/platform/organizations/:id/status`
- **Request Body**: `{ "status": "SUSPENDED" }` or `{ "status": "ACTIVE" }`
- **Response**: `HTTP 200 OK` with updated status.

---

## 5. Frontend Implementation

- Located at `/platform/organizations` (`apps/web/src/pages/PlatformOrganizationsPage.jsx`).
- Restricted to `SUPER_ADMIN` via `RoleRoute`.
- Provides searchable table, status filter, Provisioning Modal, and Suspend/Reactivate confirmation dialogs.
- Linked directly from the Super Admin dashboard screen and sidebar.
