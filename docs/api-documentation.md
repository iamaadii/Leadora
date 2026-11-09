# REST API Documentation — Phase 3: Authentication & Authorization

This document provides complete API reference documentation for the Authentication and Role-Based Authorization module of the Business CRM and Lead Management System.

---

## 1. Global Conventions & Standards

- **Base URL:** `/api/v1`
- **Request Content-Type:** `application/json`
- **Response Format:** Uniform JSON envelope
- **Authentication Strategy:** Dual-token model
  - **Access Token:** Short-lived JWT (~10 minutes) passed in the HTTP `Authorization: Bearer <accessToken>` header. Kept exclusively in frontend application memory (never stored in `localStorage` or `sessionStorage`).
  - **Refresh Token:** Cryptographically random opaque 64-byte token (~7 days) stored in an `HttpOnly`, `SameSite=Lax`, `Secure` (production) cookie named `refresh_token`. Only SHA-256 hashes of refresh tokens are stored in the PostgreSQL database.
- **Rate Limiting:** IP-based rate limiting enabled on sensitive authentication endpoints (e.g. `POST /api/v1/auth/login`: max 10 requests per 15 minutes).

---

## 2. Standard Response Envelopes

### 2.1 Success Response Envelope
```json
{
  "success": true,
  "message": "Optional descriptive success message",
  "data": { ... }
}
```

### 2.2 Error Response Envelope
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE_STRING",
    "message": "Human-readable error description",
    "details": [ ... ]
  }
}
```

### Common HTTP Status Codes
| Status Code | Meaning | Typical Usage |
| :--- | :--- | :--- |
| `200 OK` | Success | Successful login, refresh, logout, profile fetch |
| `400 Bad Request` | Bad Request | Validation errors, invalid current password |
| `401 Unauthorized` | Unauthorized | Missing, expired, or invalid token; invalid credentials |
| `403 Forbidden` | Forbidden | Account deactivated or insufficient RBAC role privileges |
| `404 Not Found` | Not Found | User or resource not found |
| `429 Too Many Requests` | Rate Limited | Too many login attempts within window |
| `500 Internal Server Error` | Server Error | Unhandled database or system exception |

---

## 3. Endpoints

### 3.1 Login User / Super Admin

Authenticates an organization user or platform Super Admin. Generates a short-lived JWT access token returned in the response body, and sets a rotating refresh token in an `HttpOnly` cookie.

- **Method:** `POST`
- **URL:** `/api/v1/auth/login`
- **Access Level:** Public (Rate limited: 10 requests / 15 min)
- **Headers:** `Content-Type: application/json`

#### Request Body
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `email` | `string` | Yes | Valid email address |
| `password` | `string` | Yes | Account password |
| `organizationSlug` | `string` | No* | Required for organization users (`ADMIN`, `MANAGER`, `EMPLOYEE`). Omit for platform `SUPER_ADMIN`. |

#### Example Request (Organization User)
```json
{
  "email": "admin@acme.com",
  "password": "Password123!",
  "organizationSlug": "acme"
}
```

#### Example Request (Platform Super Admin)
```json
{
  "email": "superadmin@platform.com",
  "password": "Password123!"
}
```

#### Success Response (`200 OK`)
**Set-Cookie Header:** `refresh_token=<opaque_token>; Path=/api/v1/auth; HttpOnly; SameSite=Lax; Max-Age=604800`
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "e4b1e5a2-3f82-4e0d-9b5a-1b4e2f8a1c90",
      "email": "admin@acme.com",
      "firstName": "Acme",
      "lastName": "Admin",
      "role": "ADMIN",
      "phone": "+1-555-0101",
      "organizationId": "d3c0e1a1-2b71-4d9c-8a4e-0a3e1f7a0b89",
      "organization": {
        "id": "d3c0e1a1-2b71-4d9c-8a4e-0a3e1f7a0b89",
        "name": "Acme Sales Corp",
        "slug": "acme"
      }
    }
  }
}
```

#### Error Responses
- **`400 Bad Request`** (Invalid email format):
  ```json
  {
    "success": false,
    "error": {
      "code": "VALIDATION_ERROR",
      "message": "Validation failed",
      "details": [{ "field": "email", "message": "Please provide a valid email address" }]
    }
  }
  ```
- **`401 Unauthorized`** (Invalid credentials or inactive account):
  ```json
  {
    "success": false,
    "error": {
      "code": "INVALID_CREDENTIALS",
      "message": "Invalid email or password"
    }
  }
  ```

---

### 3.2 Refresh Access Token

Issues a new short-lived JWT access token and rotates the refresh token using atomic single-use token rotation with reuse detection.

- **Method:** `POST`
- **URL:** `/api/v1/auth/refresh`
- **Access Level:** Public (Requires valid `refresh_token` HttpOnly cookie)
- **Headers:** None required
- **Cookie:** `refresh_token=<token>`

#### Success Response (`200 OK`)
**Set-Cookie Header:** Updates cookie with the new rotated refresh token.
```json
{
  "success": true,
  "message": "Session refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Error Responses
- **`401 Unauthorized`** (Missing or expired cookie):
  ```json
  {
    "success": false,
    "error": {
      "code": "UNAUTHORIZED",
      "message": "No refresh token provided. Please log in."
    }
  }
  ```
- **`401 Unauthorized`** (Token reuse detected):
  When a previously revoked token is submitted, the server detects potential token theft, revokes all active sessions for that user immediately, and returns:
  ```json
  {
    "success": false,
    "error": {
      "code": "SESSION_REVOKED",
      "message": "Session security compromise detected. All sessions revoked. Please log in again."
    }
  }
  ```

---

### 3.3 Logout Current Session

Revokes the active refresh token session in PostgreSQL and clears the `refresh_token` HttpOnly cookie.

- **Method:** `POST`
- **URL:** `/api/v1/auth/logout`
- **Access Level:** Public / Authenticated (Reads cookie if present)
- **Cookie:** `refresh_token=<token>`

#### Success Response (`200 OK`)
**Set-Cookie Header:** `refresh_token=; Path=/api/v1/auth; Expires=Thu, 01 Jan 1970 00:00:00 GMT`
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### 3.4 Logout All Sessions

Terminates all active sessions for the authenticated user by revoking all their refresh tokens in PostgreSQL and clearing their cookie.

- **Method:** `POST`
- **URL:** `/api/v1/auth/logout-all`
- **Access Level:** Authenticated
- **Headers:** `Authorization: Bearer <accessToken>`

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "message": "All active sessions have been terminated"
}
```

#### Error Responses
- **`401 Unauthorized`** (Missing or expired access token):
  ```json
  {
    "success": false,
    "error": {
      "code": "UNAUTHORIZED",
      "message": "Authentication token missing or invalid"
    }
  }
  ```

---

### 3.5 Get Current Authenticated User (`/me`)

Retrieves the currently authenticated user's profile, role, and organization information. Performs real-time checks ensuring user and tenant accounts are active.

- **Method:** `GET`
- **URL:** `/api/v1/auth/me`
- **Access Level:** Authenticated (`SUPER_ADMIN`, `ADMIN`, `MANAGER`, `EMPLOYEE`)
- **Headers:** `Authorization: Bearer <accessToken>`

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "e4b1e5a2-3f82-4e0d-9b5a-1b4e2f8a1c90",
      "email": "admin@acme.com",
      "firstName": "Acme",
      "lastName": "Admin",
      "role": "ADMIN",
      "phone": "+1-555-0101",
      "organizationId": "d3c0e1a1-2b71-4d9c-8a4e-0a3e1f7a0b89",
      "organization": {
        "id": "d3c0e1a1-2b71-4d9c-8a4e-0a3e1f7a0b89",
        "name": "Acme Sales Corp",
        "slug": "acme"
      }
    }
  }
}
```

---

### 3.6 Change Password

Changes the authenticated user's password after verifying their current password. Revokes all active refresh tokens for the user and forces re-authentication across all devices.

- **Method:** `POST`
- **URL:** `/api/v1/auth/change-password`
- **Access Level:** Authenticated
- **Headers:** `Authorization: Bearer <accessToken>`, `Content-Type: application/json`

#### Request Body
| Field | Type | Required | Constraints |
| :--- | :--- | :--- | :--- |
| `currentPassword` | `string` | Yes | Existing password |
| `newPassword` | `string` | Yes | Minimum 8 chars, at least 1 uppercase letter, at least 1 number |

#### Example Request
```json
{
  "currentPassword": "Password123!",
  "newPassword": "NewSecurePassword999!"
}
```

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "message": "Password changed successfully. Please log in again with your new password."
}
```

#### Error Responses
- **`400 Bad Request`** (Incorrect current password):
  ```json
  {
    "success": false,
    "error": {
      "code": "INVALID_PASSWORD",
      "message": "Current password is incorrect"
    }
  }
  ```
- **`400 Bad Request`** (Weak new password):
  ```json
  {
    "success": false,
    "error": {
      "code": "VALIDATION_ERROR",
      "message": "Validation failed",
      "details": [{ "field": "newPassword", "message": "New password must contain at least one uppercase letter" }]
    }
  }
  ```

---

### 3.7 Role Verification Test Endpoints

Used to test Role-Based Access Control (RBAC) middleware implementation.

#### A. Admin Only Route
- **Method:** `GET`
- **URL:** `/api/v1/auth/test-admin`
- **Access Level:** `SUPER_ADMIN`, `ADMIN`
- **Headers:** `Authorization: Bearer <accessToken>`
- **Response:**
  - `200 OK` for Admins and Super Admins.
  - `403 Forbidden` (`FORBIDDEN`: `Access denied. Insufficient role permissions.`) for Managers and Employees.

#### B. Manager Route
- **Method:** `GET`
- **URL:** `/api/v1/auth/test-manager`
- **Access Level:** `SUPER_ADMIN`, `ADMIN`, `MANAGER`
- **Headers:** `Authorization: Bearer <accessToken>`
- **Response:**
  - `200 OK` for Managers, Admins, and Super Admins.
  - `403 Forbidden` for Employees.

---

## 4. Role-Based Access Matrix

| Endpoint | `SUPER_ADMIN` | `ADMIN` | `MANAGER` | `EMPLOYEE` |
| :--- | :---: | :---: | :---: | :---: |
| `POST /auth/login` | Allowed | Allowed | Allowed | Allowed |
| `POST /auth/refresh` | Allowed | Allowed | Allowed | Allowed |
| `POST /auth/logout` | Allowed | Allowed | Allowed | Allowed |
| `POST /auth/logout-all` | Allowed | Allowed | Allowed | Allowed |
| `GET /auth/me` | Allowed | Allowed | Allowed | Allowed |
| `POST /auth/change-password` | Allowed | Allowed | Allowed | Allowed |
| `GET /auth/test-admin` | Allowed | Allowed | Denied (403) | Denied (403) |
| `GET /auth/test-manager` | Allowed | Allowed | Allowed | Denied (403) |

---

## 5. Lead Management Module (`/api/v1/leads`) — Phase 5

All lead endpoints require authentication via Bearer JWT token (`Authorization: Bearer <accessToken>`).
Data isolation is strictly enforced at the organization level: tenant users can only access leads belonging to their own organization (`organization_id = req.user.organizationId`). Platform Super Admins do not access organization leads directly (403 Forbidden).

### 5.1 Create Lead
- **Method:** `POST`
- **URL:** `/api/v1/leads`
- **Access Level:** `ADMIN`, `MANAGER`, `EMPLOYEE`
- **Headers:** `Authorization: Bearer <accessToken>`, `Content-Type: application/json`

#### Request Body
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `name` | `string` | Yes | Lead contact name (1-255 chars) |
| `email` | `string` | No | Valid email address |
| `phone` | `string` | No | Phone contact (max 50 chars) |
| `company` | `string` | No | Organization/company name |
| `source` | `string` | No | Lead acquisition channel (Default: `WEBSITE`) |
| `status` | `string` | No | `NEW`, `CONTACTED`, `INTERESTED`, `QUALIFIED`, `PROPOSAL_SENT`, `CONVERTED`, `LOST` (Default: `NEW`) |
| `assigned_to_id` | `UUID` | No | Active employee in same organization. Employees can only assign to themselves. |
| `description` | `string` | No | Background notes and qualification details |

#### Example Request
```json
{
  "name": "Sarah Connor",
  "email": "sarah@cyberdyne.com",
  "phone": "+1-555-0199",
  "company": "Cyberdyne Systems",
  "source": "WEBSITE",
  "status": "NEW",
  "assigned_to_id": "8d1bdd99-3fae-42c2-9f73-b257dd52e0a8",
  "description": "Enterprise security prospect"
}
```

#### Success Response (`201 Created`)
```json
{
  "success": true,
  "message": "Lead created successfully",
  "data": {
    "id": "e4b1e5a2-3f82-4e0d-9b5a-1b4e2f8a1c90",
    "organization_id": "d3c0e1a1-2b71-4d9c-8a4e-0a3e1f7a0b89",
    "name": "Sarah Connor",
    "email": "sarah@cyberdyne.com",
    "phone": "+1-555-0199",
    "company": "Cyberdyne Systems",
    "source": "WEBSITE",
    "status": "NEW",
    "assigned_to_id": "8d1bdd99-3fae-42c2-9f73-b257dd52e0a8",
    "description": "Enterprise security prospect",
    "created_by_id": "4c63ca67-9459-45c2-bca5-70cd00a41120",
    "archived_at": null,
    "created_at": "2026-11-09T22:30:00.000Z",
    "updated_at": "2026-11-09T22:30:00.000Z"
  }
}
```

---

### 5.2 List Leads
- **Method:** `GET`
- **URL:** `/api/v1/leads`
- **Access Level:** `ADMIN`, `MANAGER`, `EMPLOYEE`
- **Query Parameters:**
  - `page`: Page number (Default: `1`)
  - `limit`: Records per page (Default: `10`, Max: `100`)
  - `search`: Filter matching name, email, phone, or company (case-insensitive)
  - `status`: Filter by lead stage
  - `source`: Filter by acquisition channel
  - `assigned_to_id`: Filter by assigned employee UUID
  - `startDate`: Filter created on or after ISO date
  - `endDate`: Filter created on or before ISO date
  - `sortBy`: Allowlist (`created_at`, `updated_at`, `name`, `company`, `status`; Default: `created_at`)
  - `sortOrder`: `ASC` or `DESC` (Default: `DESC`)
  - `isArchived`: `true` to view archived leads, `false` for active (Default: `false`)

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "data": [
    {
      "id": "e4b1e5a2-3f82-4e0d-9b5a-1b4e2f8a1c90",
      "name": "Sarah Connor",
      "company": "Cyberdyne Systems",
      "status": "NEW",
      "source": "WEBSITE",
      "assigned_to_id": "8d1bdd99-3fae-42c2-9f73-b257dd52e0a8",
      "assigned_to_first_name": "Alice",
      "assigned_to_last_name": "Smith",
      "assigned_to_email": "alice@acme.com",
      "created_at": "2026-11-09T22:30:00.000Z"
    }
  ],
  "meta": {
    "total": 45,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  }
}
```

---

### 5.3 Get Lead Details
- **Method:** `GET`
- **URL:** `/api/v1/leads/:id`
- **Access Level:** `ADMIN`, `MANAGER`, `EMPLOYEE` (Assigned or creator only for Employees)

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "data": {
    "id": "e4b1e5a2-3f82-4e0d-9b5a-1b4e2f8a1c90",
    "name": "Sarah Connor",
    "email": "sarah@cyberdyne.com",
    "phone": "+1-555-0199",
    "company": "Cyberdyne Systems",
    "source": "WEBSITE",
    "status": "NEW",
    "assigned_to_first_name": "Alice",
    "assigned_to_last_name": "Smith",
    "created_by_first_name": "Acme",
    "created_by_last_name": "Admin",
    "created_at": "2026-11-09T22:30:00.000Z",
    "updated_at": "2026-11-09T22:30:00.000Z",
    "recent_activities": [
      {
        "id": "f5c2e6b3-4f93-5e1e-ac6b-2c5f3a9b2d01",
        "activity_type": "LEAD_CREATED",
        "description": "Lead \"Sarah Connor\" created and assigned to Alice Smith",
        "actor_first_name": "Acme",
        "actor_last_name": "Admin",
        "created_at": "2026-11-09T22:30:00.000Z"
      }
    ]
  }
}
```

---

### 5.4 Update Lead
- **Method:** `PATCH`
- **URL:** `/api/v1/leads/:id`
- **Access Level:** `ADMIN`, `MANAGER`, `EMPLOYEE` (Employees cannot reassign leads)
- **Request Body:** Partial fields (`name`, `email`, `phone`, `company`, `source`, `status`, `assigned_to_id`, `description`)

---

### 5.5 Archive Lead
- **Method:** `PATCH`
- **URL:** `/api/v1/leads/:id/archive`
- **Access Level:** `ADMIN`
- **Description:** Soft-archives the lead by setting `archived_at = NOW()` and logs a `LEAD_ARCHIVED` activity.

---

### 5.6 Restore Archived Lead
- **Method:** `PATCH`
- **URL:** `/api/v1/leads/:id/restore`
- **Access Level:** `ADMIN`
- **Description:** Restores an archived lead by setting `archived_at = NULL` and logs a `LEAD_RESTORED` activity.

---

### 5.7 Get Lead Activity History
- **Method:** `GET`
- **URL:** `/api/v1/leads/:id/activities`
- **Access Level:** `ADMIN`, `MANAGER`, `EMPLOYEE`
- **Query Parameters:** `page`, `limit` (Default: `20`)
- **Description:** Returns paginated chronological event feed for the specified lead.

---

### 5.8 Get Assignable Employees
- **Method:** `GET`
- **URL:** `/api/v1/leads/assignees`
- **Access Level:** `ADMIN`, `MANAGER`, `EMPLOYEE`
- **Description:** Returns active staff members within the tenant organization for selection in assignee dropdowns.

