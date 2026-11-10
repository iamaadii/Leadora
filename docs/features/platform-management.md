# Platform Super Admin Management

This document explains how Platform Super Admins manage multiple tenant companies in simple words.

---

## 1. What is a Platform Super Admin?

A Platform Super Admin is the owner or hosting operator of the entire CRM platform.

Unlike regular Admins (who only see their own company), a Super Admin:
- Can see all registered company workspaces.
- Can create new company workspaces.
- Can suspend or reactivate company workspaces.
- Cannot see the private customer leads, notes, or follow-ups of any customer company.

---

## 2. Creating a New Company Workspace

When onboarding a new business customer, the Super Admin provides:
- **Company Name:** (e.g., "Apex Logistics")
- **Workspace Slug:** (e.g., "apex-logistics")
- **Initial Admin User:** First name, last name, email, and password.

The system creates the company and initial Admin in one step.

---

## 3. Suspending a Company Workspace

If a customer cancels their subscription:
- Super Admin can click **Suspend**.
- The company's `is_active` flag becomes `false`.
- All active login sessions for that company are ended immediately.
- Users attempting to log in will receive an account suspended message.
- If the customer renews, Super Admin can click **Reactivate** to restore access immediately.

