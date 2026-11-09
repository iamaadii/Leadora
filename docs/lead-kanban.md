# Leads Kanban Board Documentation

## 1. Overview

The Leads Kanban Board provides an interactive visual workflow representation of the sales pipeline, enabling sales representatives, managers, and administrators to view and advance leads across lifecycle stages.

---

## 2. Pipeline Stages

The board is structured around seven distinct sales pipeline stages:

1. **`NEW`**: Uncontacted or freshly imported prospective leads.
2. **`CONTACTED`**: Initial outreach initiated (call, email, message).
3. **`QUALIFIED`**: Prospect meets budget, authority, need, and timeline criteria.
4. **`PROPOSAL_SENT`**: Formal sales quote, proposal, or demonstration delivered.
5. **`NEGOTIATION`**: Contract terms, pricing, or scope under discussion.
6. **`WON`**: Deal successfully closed and agreement finalized.
7. **`LOST`**: Opportunity discontinued or declined.

---

## 3. Interaction & Functionality

### Visual Feedback
- Distinct color accents per column header.
- Card count badge and total estimated value sum for every stage column.

### Card Content
- **Lead Name**: Clickable link navigating to `/leads/:id`.
- **Company Name & Source**: Visual badges identifying origin and enterprise.
- **Estimated Pipeline Value**: Formatted in target currency (e.g., `$15,000`).
- **Assigned Representative**: User avatar and name.

### State Transitions
- **Native HTML5 Drag and Drop**: Moving cards across columns automatically dispatches `PATCH /api/v1/leads/:id` with `{ status: newStatus }`.
- **Accessible Select Dropdown**: Every card features an in-card stage select dropdown for keyboards, screen readers, and touch devices.

---

## 4. Routing & View Switcher

- **Route**: Accessible directly at `/leads/kanban`.
- **View Switcher**: The Leads interface at `/leads` features an action toggle allowing users to switch between the tabular list view (`/leads`) and the visual Kanban board (`/leads/kanban`) with a single click.
