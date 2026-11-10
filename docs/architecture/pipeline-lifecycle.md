# Leadora Pipeline Lifecycle Specification

## 1. Authoritative Pipeline Lifecycle

The authoritative lead pipeline lifecycle in Leadora comprises 7 sequential and terminal stages:

```
NEW ──> CONTACTED ──> INTERESTED ──> QUALIFIED ──> PROPOSAL_SENT ──> CONVERTED
  │         │              │             │              │
  └─────────┴──────────────┴─────────────┴──────────────┴───────> LOST
```

### Stage Definitions
1. **`NEW`**: Inbound lead or newly sourced contact awaiting initial qualification or outreach.
2. **`CONTACTED`**: Outreach has occurred (phone call logged, email sent, or message exchanged).
3. **`INTERESTED`**: Lead has shown positive intent or expressed requirement for services.
4. **`QUALIFIED`**: Budget, authority, need, and timeline (BANT) criteria have been validated.
5. **`PROPOSAL_SENT`**: Formal quotation, contract draft, or pitch deck delivered to client.
6. **`CONVERTED`**: Deal successfully won. Customer onboarded or signed agreement achieved.
7. **`LOST`**: Deal closed unsuccessfully. **Requires mandatory Loss Reason and optional notes.**

---

## 2. Lifecycle Reconciliation & Architectural Alignment

Earlier drafts and prototype mockups referenced an alternative stage sequence:
`NEW -> CONTACTED -> QUALIFIED -> PROPOSAL_SENT -> NEGOTIATION -> WON -> LOST`.

During the comprehensive audit, this discrepancy was reconciled based on:
1. **Database Constraints**: PostgreSQL migration `003_create_leads.sql` enforces `chk_lead_status` strictly with `NEW, CONTACTED, INTERESTED, QUALIFIED, PROPOSAL_SENT, CONVERTED, LOST`.
2. **Reports & Analytics**: `apps/api/src/modules/reports/` and `dashboard.repository.js` calculate stage conversion percentages and distribution based on the 7 canonical stages.
3. **Frontend Kanban**: `LeadKanbanBoard.jsx` has been aligned to the 7 canonical database stages, eliminating synthetic `NEGOTIATION` and `WON` labels that caused database constraint errors when moving cards.

---

## 3. Mandatory Loss Reason Workflow

When a lead transitions to `LOST` via Kanban drag-and-drop, stage selector, or Lead Details page:
- The UI halts immediate mutation and displays the `MarkLeadAsLostModal`.
- The user must select a standardized loss reason (e.g. *Price too high*, *Chose competitor*, *Budget unavailable*, *Other*).
- If *Other* is selected, an explanatory note is mandatory.
- The reason and notes are transactionally stored in `leads.loss_reason`, `leads.loss_notes`, and logged as an immutable `LEAD_STATUS_CHANGED` activity entry.
- Lost Leads reports and exports include the exact reason for loss analysis.

