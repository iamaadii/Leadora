# Organization Settings Documentation

## 1. Overview

Organization Settings govern company-wide identity and regional localization defaults for individual multi-tenant organizations. Settings are scoped strictly to the tenant organization and can only be updated by tenant users possessing the `ADMIN` role.

---

## 2. Data Model

Organization settings are persisted on the `organizations` table:

```sql
ALTER TABLE organizations
ADD COLUMN IF NOT EXISTS currency VARCHAR(10) DEFAULT 'USD',
ADD COLUMN IF NOT EXISTS timezone VARCHAR(100) DEFAULT 'America/New_York';
```

- **`name`**: Display name of the tenant enterprise (editable).
- **`slug`**: Multi-tenant identifier slug (immutable after creation).
- **`currency`**: 3-character ISO currency code (e.g., `USD`, `EUR`, `GBP`, `CAD`, `AUD`, `JPY`, `INR`).
- **`timezone`**: Valid IANA standard timezone string (e.g., `America/New_York`, `Europe/London`, `Asia/Kolkata`, `UTC`).

---

## 3. RBAC & Security Boundaries

- **`ADMIN`**: Full read and write access to organization settings.
- **`MANAGER` & `EMPLOYEE`**: `HTTP 403 Forbidden` on update. Read permitted where required for display defaults.
- **`SUPER_ADMIN`**: `HTTP 403 Forbidden` on tenant settings endpoint (Super Admin oversees organizations at the platform level via `/api/v1/platform/organizations`).

---

## 4. API Specification

### `GET /api/v1/organization/settings`
- **Headers**: `Authorization: Bearer <token>`
- **Response**:
```json
{
  "success": true,
  "data": {
    "id": "c1f77d54-1bbf-4c74-9f79-e399589d8f37",
    "name": "Acme Sales Corp",
    "slug": "acme-sales",
    "currency": "USD",
    "timezone": "America/New_York",
    "status": "ACTIVE",
    "createdAt": "2026-11-09T18:00:00.000Z"
  }
}
```

### `PATCH /api/v1/organization/settings`
- **Headers**: `Authorization: Bearer <token>` (Admin only)
- **Request Body**:
```json
{
  "name": "Acme Global Solutions",
  "currency": "EUR",
  "timezone": "Europe/London"
}
```
- **Validation**:
  - `name`: String between 2 and 100 characters.
  - `currency`: 3-character uppercase ISO code (`/^[A-Z]{3}$/`).
  - `timezone`: String between 2 and 100 characters.
- **Response**: `HTTP 200 OK` with updated settings object.

---

## 5. Frontend Implementation

- Located at `/settings` in `apps/web/src/pages/SettingsPage.jsx`.
- Real-time form with TanStack Query mutation (`useUpdateOrganizationSettings`).
- Provides feedback through notification toasts and updates company name across navigation topbar and sidebar.
