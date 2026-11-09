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
