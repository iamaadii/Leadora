# REST API Design & Standards

This document explains the Leadora API rules, response formats, and status codes in simple words.

---

## 1. Basics

- **Base URL:** `/api/v1`
- **Format:** JSON for all request bodies and responses (`Content-Type: application/json`).
- **Authentication:** A secure, `HttpOnly` cookie containing a signed JWT token.
- **Language:** Node.js with Express and plain JavaScript ES Modules.

---

## 2. Standard Responses

Every API call returns a predictable JSON response:

### When a request succeeds:
```json
{
  "success": true,
  "data": {
    "id": "e4b1e5a2-3f82-4e0d-9b5a-1b4e2f8a1c90",
    "name": "Sarah Jenkins",
    "company": "Horizon Media",
    "status": "QUALIFIED"
  },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

### When a request fails:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input provided",
    "details": {
      "email": "Please provide a valid email address"
    }
  }
}
```

---

## 3. Status Codes

We use standard HTTP status codes:

| Code | Meaning | When It Happens |
| :---: | :--- | :--- |
| **200** | OK | Request succeeded. |
| **201** | Created | A new record (lead, user, task) was successfully created. |
| **204** | No Content | Record was successfully deleted. |
| **400** | Bad Request | The request is missing required fields or has bad data. |
| **401** | Unauthorized | You are not logged in, or your session expired. |
| **403** | Forbidden | You are logged in, but your role is not allowed to do this. |
| **404** | Not Found | The record does not exist or belongs to another company. |
| **409** | Conflict | The record already exists (e.g. duplicate email). |
| **422** | Unprocessable | Input validation failed (e.g. invalid email format). |
| **429** | Too Many Requests | Rate limit reached (too many requests in a short time). |
| **500** | Server Error | An unexpected server issue occurred. |

---

## 4. Input Validation with Zod

Before any data reaches the database, Express validates the request with Zod:
- Cleans and trims whitespace.
- Checks email formats.
- Ensures required fields are not empty.
- Verifies positive numbers for deal values.
- Rejects unexpected extra fields.

