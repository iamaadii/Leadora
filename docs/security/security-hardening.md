# Security Hardening Guide

This document explains the security protections built into Leadora in simple words.

---

## 1. Login & Token Protection

- **Short-Lived Access Tokens:** Access tokens expire after 10 minutes. They are stored only in memory in JavaScript, never in `localStorage`, so malicious scripts cannot steal them.
- **Secure Refresh Cookies:** Refresh tokens are delivered in an `HttpOnly` cookie. The browser automatically sends the cookie, but browser JavaScript cannot read it.
- **Token Rotation:** Every time a session refreshes, the old token is revoked and a new one is issued. If someone tries to reuse an old token, the system detects it and logs the user out immediately.
- **Instant Deactivation:** If an Admin deactivates an employee account or a Super Admin suspends a company, the user's access ends immediately on their very next click.

---

## 2. Password Security

- **Argon2 Hashing:** Passwords are never saved as plain text. They are hashed using Argon2id before writing to the database.
- **Safe Error Messages:** When someone fails to log in, the system returns a generic error: *"Invalid email or password"*. It never reveals whether the email exists or not.
- **No Password Leaks:** Passwords and password hashes are never printed in server logs or returned in API responses.

---

## 3. Rate Limiting (Brute-Force Defense)

- **Login Limiter:** Limits how many login attempts can be made from a single IP address in a short time.
- **Public API Limiter:** Prevents spam requests from slowing down the server.

---

## 4. SQL Injection Defense

- **No String Concatenation:** We never write SQL queries by joining user input into strings (e.g. `WHERE email = '` + email + `'`).
- **Parameterized Queries:** All SQL queries use safe parameters (`$1, $2, $3`). The database treats input strictly as values, making SQL injection impossible.

---

## 5. Multi-Tenant Privacy

- Every query filters by `organization_id = $1`.
- The user's company ID is taken directly from their verified login token, never from input sent by the browser.
- A user can never access or guess records belonging to another company. Attempting to open another company's lead returns a standard 404 (Not Found).

