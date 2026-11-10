# Functional Requirements

This document explains what Leadora does, who uses it, and how each feature works in simple words.

---

## 1. What is Leadora?

Leadora is a Customer Relationship Management (CRM) system for sales teams.

A sales team uses Leadora to:
- Save and organize prospective buyers (**Leads**).
- Move sales opportunities through a 7-step visual pipeline (**Kanban**).
- Schedule follow-up tasks and meetings (**Follow-ups**).
- See a full history of calls, emails, and notes (**Activity Logs**).
- Monitor sales numbers and team progress (**Dashboard & Analytics**).
- Download reports as CSV, Excel, or PDF files (**Reports**).

Multiple companies can use Leadora at the same time. Each company's data is completely separated and private.

---

## 2. User Roles and What They Can Do

There are four user roles in Leadora:

| Role | What They Can Do |
| :--- | :--- |
| **Super Admin** | Manages the whole platform. Can add new companies, activate or deactivate companies, and check system health. Cannot view private sales leads of other companies. |
| **Admin** | Runs one company. Can add employees, make teams, assign managers, view all company leads, and change company settings. |
| **Manager** | Leads a sales team. Can see all leads and tasks belonging to their team members. Can reassign leads between team members. Cannot see other teams. |
| **Employee** | Sales representative. Can view and update only leads assigned to them. Can create their own follow-up tasks and log activities. |

---

## 3. Core Features Explained

### 1. Authentication (Login & Accounts)
- Users log in with their email and password.
- Passwords are safely hashed with Argon2.
- Session tokens are stored in HttpOnly cookies so they cannot be stolen.
- When an account is deactivated by an Admin, the user's session ends immediately.

### 2. Lead Management
- Stores contact name, email, phone number, company name, lead source, priority, and estimated deal value.
- Easy search by lead name, company, or email.
- Filters by lead status, priority, and assigned sales rep.
- Soft-deletes keep historical data safe for reports instead of permanently erasing records.

### 3. Visual 7-Stage Sales Pipeline
Leads move through 7 simple stages:
1. **New:** The lead just came in.
2. **Contacted:** The sales rep made the first call or sent the first email.
3. **Qualified:** The lead is genuinely interested and has a budget.
4. **Proposal Sent:** A price quote or proposal was sent.
5. **Negotiation:** The customer is discussing terms and pricing.
6. **Won:** The deal is closed and the customer bought!
7. **Lost:** The customer decided not to buy. A reason must be recorded.

### 4. Employee & Team Management
- Admins invite new employees and assign roles.
- Sales reps are grouped into teams (like "Enterprise Sales" or "Inbound Reps").
- A Manager is assigned to oversee each team.

### 5. Follow-ups & Reminders
- Schedule calls, emails, demos, and tasks linked to any lead.
- Each task has a due date and time.
- Tasks show clear badges:
  - **Due Today:** Needs action today.
  - **Overdue:** The due date has passed and the task is still open.
  - **Completed:** Task was finished with notes.

### 6. Activity Timeline
- Automatically records every action taken on a lead:
  - When the lead was created.
  - When the stage changed.
  - When a call, meeting, or note was added.
  - When the lead was assigned to a new rep.

### 7. Executive Dashboard & Analytics
- Shows key business metrics at a glance:
  - Total pipeline value.
  - Number of active leads.
  - Win rate percentage.
  - Follow-ups due today.
  - Monthly sales performance charts.

### 8. Reports & Data Downloads
- Filter and review lead lists.
- 1-click download in:
  - **CSV:** Easy to import into spreadsheets.
  - **Excel (.xlsx):** Formatted with colored headers and auto-sized columns.
  - **PDF:** Clean executive layout ready to print or email.

### 9. In-App Notifications
- Notification bell alerts sales reps when:
  - A new lead is assigned to them.
  - A scheduled follow-up is due.

### 10. Organization Settings
- Admins can configure their company name, currency symbol (`$`, `€`, `£`, `₹`), and timezone.

