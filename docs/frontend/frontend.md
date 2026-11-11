# Frontend Design System, Pages & UI Guide

This document is the unified frontend guide for Leadora, detailing visual tokens, UI components, page routing, and responsive/accessibility standards.

---

## 1. Visual Design System

Leadora utilizes Tailwind CSS with a clean, high-contrast, enterprise-grade design system.

### Color Tokens

- **Canvas / Background:** Soft light slate (`#F8FAFC`, `bg-slate-50`)
- **Cards, Modals & Surfaces:** Pure white (`#FFFFFF`, `bg-white`) with subtle borders (`border-slate-200`)
- **Primary Brand / Action:** Royal Blue (`#2563EB`, `bg-blue-600` / `hover:bg-blue-500`)
- **Success / Won Deals:** Emerald Green (`#059669`, `text-emerald-700` / `bg-emerald-50`)
- **Warning / Due Today:** Amber Orange (`#D97706`, `text-amber-700` / `bg-amber-50`)
- **Danger / Overdue:** Rose Red (`#E11D48`, `text-rose-700` / `bg-rose-50`)
- **Primary Typography:** Slate 900 (`#0F172A`) for high-contrast readability
- **Muted Typography:** Slate 500 (`#64748B`) for captions, metadata, and helper text

---

## 2. Core Reusable UI Components

Located in `apps/web/src/components/common/` and `apps/web/src/components/ui/`:

1. **`Button` (`Button.jsx`):**
   - Variants: `primary`, `secondary`, `outline`, `danger`, `ghost`
   - Sizes: `sm`, `md`, `lg`
   - State: Integrated loading spinner, disabled state, and focus rings.

2. **Form Controls (`Input.jsx`, `Select.jsx`, `Textarea.jsx`):**
   - Accessible labels with required asterisks (`*`)
   - Leading/trailing icon slots (search, calendar, email)
   - Built-in error message presentation linked to form validation.

3. **`Modal` (`Modal.jsx`):**
   - Accessible dialog backdrop with keyboard `Escape` dismissal
   - Body scroll locking and trapped tab focus
   - Responsive height constraint with internal vertical scrolling.

4. **`Badge` (`Badge.jsx`):**
   - Semantic color pills for stages (`NEW`, `QUALIFIED`, `CONVERTED`, etc.), priorities (`LOW`, `HIGH`, `URGENT`), and roles.

5. **`PageHeader` (`PageHeader.jsx`):**
   - Consistent layout for page title, subtitle, breadcrumbs, and primary action buttons.

---

## 3. Application Route Map

```
/                               Public Landing Page
/login                          Login Screen (with Super Admin toggle)
/demo                           Free Interactive Live Demo Mode
/dashboard                      Executive Sales Dashboard
/leads                          Leads Table View
/leads/kanban                   Visual 7-Stage Pipeline Board
/leads/:id                      Lead Profile & Activity Timeline
/follow-ups                     Follow-up Tasks & Reminders
/activities                     Full Organization Activity Log
/notifications                  In-App Notification Feed
/employees                      Staff Directory (Admin only)
/teams                          Teams & Workloads (Admin & Manager)
/reports                        Reports & 1-Click Exports
/settings                       Company Settings (Admin only)
/platform/organizations         Tenant Management (Super Admin only)
/profile                        User Profile & Password Management
```

---

## 4. Screen Descriptions

### 1. Landing Page (`/`)

- Public showcase illustrating CRM features, value proposition, pricing tiers, and interactive previews.
- Links to `/demo` and `/login`. Authenticated visitors are automatically redirected to `/dashboard`.

### 2. Login Page (`/login`)

- Clean authentication interface supporting regular tenant sign-in (organization slug, email, password) and Platform Super Admin sign-in (checkbox bypasses organization slug).
- Password visibility toggle and session restoration loader.

### 3. Dashboard (`/dashboard`)

- Executive KPI summary cards (Pipeline Value, Active Leads, Win Rate, Overdue Tasks).
- Monthly performance chart, pipeline stage funnel, and tasks due today.

### 4. Leads List & Kanban (`/leads` & `/leads/kanban`)

- Real-time search by lead name, company, or email.
- Multi-parameter filtering by stage, source, priority, and assigned rep.
- 1-click toggle between responsive table and visual drag-and-drop Kanban board.

### 5. Lead Details (`/leads/:id`)

- Comprehensive overview of contact details, deal value, stage selector, and status badges.
- Quick actions: Log Call, Add Note, Schedule Follow-up.
- Chronological timeline displaying all past activities and audit events.

### 6. Follow-ups (`/follow-ups`)

- Calendar and list view for scheduled calls, emails, and meetings.
- Filter tabs: All, Pending, Due Today, Overdue.
- Inline task completion modal capturing outcome notes.

### 7. Reports & Exports (`/reports`)

- In-browser interactive preview of datasets.
- 1-click downloads for CSV, Excel (.xlsx), and PDF formats with streaming performance.

### 8. Employee Directory (`/employees`)

- (Admin only) Invite new sales staff, change user roles, and deactivate accounts.

### 9. Teams Management (`/teams`)

- (Admin & Manager) Create sales teams, assign managers, and balance team member deal distribution.

---

## 5. UI, Responsiveness & Accessibility Standards

### Viewport Breakpoints

- **Mobile (< 640px):** Single-column stacked layouts, full-width touch targets (minimum 44x44px), horizontal scroll containers for data tables.
- **Tablet (640px – 1024px):** 2-column grid cards, condensed sidebar, adaptive filter bars.
- **Desktop (1024px+):** Full multi-column dashboard, sticky navigation, multi-column Kanban board.

### Accessibility Highlights

- **Semantic HTML:** Strict use of `<main>`, `<nav>`, `<header>`, `<article>`, and `<dialog>` tags.
- **Keyboard Navigation:** Full tab order across forms, modals, dropdowns, and Kanban cards.
- **WCAG Contrast:** All text colors exceed WCAG 2.1 AA 4.5:1 contrast ratio against their backgrounds.
- **Focus Rings:** Visible, consistent outline focus rings (`focus:ring-2 focus:ring-blue-500/30`) for keyboard navigation.
