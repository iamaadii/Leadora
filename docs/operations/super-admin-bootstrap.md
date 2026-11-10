# Super Admin Initial Bootstrap CLI

## Overview

Leadora includes a dedicated CLI command to provision the platform Super Admin account without polluting the database with demo organizations, sample leads, or test fixtures.

Script: `apps/api/src/scripts/create-super-admin.js`  
Root shortcut: `npm run admin:create`

---

## Interactive Usage

Run the command from the repository root:

```bash
npm run admin:create
```

You will be interactively prompted:
1. **Email**: Required valid email format.
2. **First Name**: Optional (defaults to `Super`).
3. **Last Name**: Optional (defaults to `Admin`).
4. **Password**: Minimum 8 characters. In interactive TTY environments, input is masked.

The password is securely hashed with Argon2id (`argon2.hash`). The user is inserted with `role = 'SUPER_ADMIN'` and `organization_id = NULL` (the hallmark of a platform administrator).

---

## Non-Interactive / CI/CD Usage

For automated environments, pass CLI arguments:

```bash
npm run admin:create -- --email=admin@yourdomain.com --password=YourStrongPassword123! --firstName=Lead --lastName=Admin
```

---

## Idempotence

If an account with the specified email already exists:
- If the account has `role = 'SUPER_ADMIN'`, the script prompts to update the name and password safely without altering past audit logs.
- If the email belongs to a tenant employee or manager, the script aborts with an error to prevent accidental permission escalation.

