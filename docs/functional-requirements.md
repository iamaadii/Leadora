# Functional and Non-Functional Requirements

## 1. Project Overview

This project is a **Business CRM and Lead Management System** for small and medium-sized businesses. 

A CRM (Customer Relationship Management) system helps a business keep track of:
- People or companies interested in buying their products or services (**Leads**).
- Sales stages (**Pipelines** like New, Contacted, Proposal Sent, Won, Lost).
- Next steps and reminders (**Follow-ups** like phone calls, emails, and meetings).
- What happened with each customer over time (**Activity History**).
- Team performance and sales numbers (**Dashboard and Reports**).

This system is **multi-organization**. That means multiple businesses can use the same application. Each business has its own private space, and one business can never see another business's data.

---

## 2. Identified Conflicts and Solutions

Before writing any design, we solved the following design questions:

1. **How does Super Admin work with organization data?**
   - *Conflict:* If all data belongs to an organization, what does a Super Admin belong to?
   - *Solution:* The Super Admin is the system owner. Super Admins do not belong to a regular customer company (`organization_id` is `NULL` for Super Admin). They can create new organizations and turn organizations on or off. Regular Admins manage only their own company.
2. **Who can see what leads?**
   - *Conflict:* Should sales employees see all company leads or only their own?
   - *Solution:* An **Employee** only sees leads assigned to them. A **Manager** sees all leads assigned to members of their team. An **Admin** sees all leads across the whole company.
3. **What happens if an employee deletes a lead?**
   - *Conflict:* Hard-deleting records destroys sales history and reporting.
   - *Solution:* We use **soft deletes** (`deleted_at` timestamp column). The lead is hidden from normal views, but the record stays in the database for safety and reports. Only Admins can delete a lead.
4. **How are follow-up reminders sent?**
   - *Conflict:* Sending emails or SMS requires paid external services that make local testing difficult.
   - *Solution:* For the core system, we use an **in-app notification center** (a bell icon with unread counts). External email reminders can be plugged in later without changing the core database.

---

## 3. Requirements for the 10 Main Modules

### Module 1: Authentication and Authorization
- Users can log in using their email and password.
- Passwords are securely hashed with **Argon2** before saving.
- The server issues a secure JSON Web Token (**JWT**) stored in an **HttpOnly cookie** so malicious browser scripts cannot steal it.
- When the user closes the browser or clicks logout, the cookie is cleared.
- Every API request checks who the user is and what role they have before doing anything.

### Module 2: Dashboard and Analytics
- Gives users a quick summary when they log in:
  - Total number of active leads.
  - Number of new leads added this week.
  - Number of deals won and lost.
  - Total estimated revenue in the sales pipeline.
  - List of overdue and upcoming follow-ups for today.
- Numbers change based on role:
  - Employees only see their own numbers.
  - Managers see their team's numbers.
  - Admins see the whole company's numbers.

### Module 3: Lead Management
- Users can create, view, edit, and soft-delete leads.
- A lead stores:
  - First name and last name.
  - Email address and phone number.
  - Company name and job title.
  - Source (where the lead came from: Website, Referral, Cold Call, Event, Other).
  - Priority (Low, Medium, High).
  - Estimated deal value (in dollars or local currency).
- Users can search leads by name, email, or company.
- Users can filter leads by status, source, or assigned employee.
- Managers and Admins can assign or reassign leads to employees.

### Module 4: Lead Pipeline and Status Management
- Every lead moves through stages:
  1. `NEW` (Just arrived, not contacted yet)
  2. `CONTACTED` (First call or email made)
  3. `QUALIFIED` (Customer has real interest and budget)
  4. `PROPOSAL_SENT` (Quote or proposal sent)
  5. `NEGOTIATION` (Discussing terms and price)
  6. `WON` (Customer bought! Deal closed successfully)
  7. `LOST` (Customer said no)
- When a lead is marked `LOST`, the user must write a short reason why.
- Users can change stages from a simple dropdown or by moving cards on a Kanban board.

### Module 5: Employee and Team Management
- Admins can create new user accounts and pick their role (`Admin`, `Manager`, `Employee`).
- Admins can create teams (for example: "North Sales Team" or "Inbound Reps").
- Admins can assign a Manager to lead a team and assign Employees to that team.
- Admins can deactivate a user account if an employee leaves the company.

### Module 6: Follow-up and Task Management
- Sales reps can schedule follow-up reminders linked to a lead.
- Follow-up types: Call, Email, Meeting, Demo, or General To-Do.
- Each follow-up has a due date and time.
- Status values: `PENDING`, `COMPLETED`, `CANCELLED`.
- If the due date has passed and the task is still `PENDING`, the system shows an `OVERDUE` badge.
- When completing a follow-up, the user can write a quick note about what happened.

### Module 7: Activity History
- A timeline for each lead that automatically records important events:
  - Lead created.
  - Stage changed (for example, from "Contacted" to "Qualified").
  - Lead assigned or reassigned to a new employee.
  - Follow-up task scheduled or completed.
- Sales reps can also write manual notes anytime (e.g., "Customer called back asking for a discount").
- History items cannot be edited or deleted once written.

### Module 8: Notifications
- An in-app notification bell in the top navigation bar.
- Shows alerts when:
  - A new lead is assigned to you.
  - A follow-up task is assigned to you.
  - A follow-up task is due today or overdue.
  - A deal is marked Won by someone on your team.
- Users can mark notifications as read or mark all as read.

### Module 9: Reports
- **Sales Performance Report:** Shows how many leads each sales rep worked on, how many they won, and how much money they brought in.
- **Lead Source Report:** Shows which marketing channels bring in the most paying customers.
- **Pipeline Stage Report:** Shows how many leads are currently sitting in each stage.

### Module 10: User and Organization Settings
- **Organization Settings (Admin only):**
  - Company name.
  - Default currency (e.g. USD, EUR, INR).
  - Timezone.
- **User Settings (Every user):**
  - Change own name and phone number.
  - Change own password (requires entering current password).

---

## 4. Non-Functional Requirements

### 4.1 Simple to Understand
- Written in pure JavaScript (Node.js and React).
- No complex build chains or confusing magic frameworks.
- One developer must be able to read, run, and modify the entire project comfortably.

### 4.2 Security
- **Data Isolation:** Every single SQL query for business data includes `WHERE organization_id = $1`. One company can never access another company's data.
- **SQL Injection Prevention:** Every SQL query uses parameterized placeholders (`$1`, `$2`, `$3`). Raw user input is never concatenated directly into SQL strings.
- **Password Safety:** Passwords are never saved in plain text. Argon2 hashes passwords with unique salts.
- **Cookie Security:** Auth tokens are saved in `HttpOnly` and `SameSite=Strict` cookies to block XSS and CSRF attacks.
- **Input Validation:** Every incoming request body and URL parameter is validated using Zod before reaching the database.

### 4.3 Performance
- Database queries use indexes on frequently searched columns (`organization_id`, `email`, `status`, `assigned_user_id`).
- Standard list queries return paginated results (e.g. 20 leads per page) to keep the app fast.

### 4.4 Reliability
- Related database operations that depend on each other run inside a **SQL transaction** (`BEGIN ... COMMIT ... ROLLBACK`). If any step fails, everything is safely undone.
- Centralized error handling: If an unexpected error happens, the server logs it, returns a polite error message to the browser, and stays running.

