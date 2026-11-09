# Frontend Design System Specification

**Application**: Leadora — Business CRM & Lead Management SaaS  
**Architecture**: React + Vite + Tailwind CSS + Lucide React

---

## 1. Color Palette & Semantic Tokens

| Token | Hex / Tailwind Class | Purpose |
|---|---|---|
| **App Background** | `#F8FAFC` (`bg-slate-50`) | Global page background providing soft contrast with white cards |
| **Surface / Cards** | `#FFFFFF` (`bg-white`) | Primary card containers, tables, modals, and toolbars |
| **Primary Text** | `#0F172A` (`text-slate-900`) | Page headers, card titles, table data, and primary labels |
| **Secondary Text** | `#64748B` (`text-slate-500`) | Subtitles, helper text, breadcrumbs, and timestamp indicators |
| **Borders** | `#E2E8F0` (`border-slate-200`) | Standard divider, card border, and table row separator |
| **Subtle Borders**| `#F1F5F9` (`border-slate-100`) | Inner card dividers and secondary borders |
| **Primary Action** | `#2563EB` (`bg-blue-600`) | Main CTA buttons, active tabs, and primary interactive highlights |
| **Primary Hover** | `#1D4ED8` (`bg-blue-700`) | Hover state for primary action buttons |
| **Success / Won** | `#059669` (`text-emerald-700`, `bg-emerald-50`) | Won stage, active accounts, completed tasks |
| **Warning / Notice**| `#D97706` (`text-amber-700`, `bg-amber-50`) | Due today tasks, qualified pipeline status |
| **Danger / Loss** | `#E11D48` (`text-rose-700`, `bg-rose-50`) | Overdue tasks, lost deals, account deactivation |
| **Info / Sky** | `#0284C7` (`text-sky-700`, `bg-sky-50`) | New leads, notifications, informational badges |

---

## 2. Typography Hierarchy

| Level | Size & Weight | Tailwind Classes | Usage |
|---|---|---|---|
| **Page Title** | 20px / 24px, Bold (700) | `text-xl sm:text-2xl font-bold text-slate-900 tracking-tight` | Top-level page headers |
| **Section Heading** | 16px, Bold (700) | `text-base font-bold text-slate-900 tracking-tight` | Major card headings, modal headers |
| **Card Heading** | 14px, Bold (700) | `text-sm font-bold text-slate-900` | KPI card titles, lead names |
| **Body Text** | 13px / 14px, Regular (400) | `text-xs sm:text-sm text-slate-600 leading-relaxed` | Descriptions, notes, narrative copy |
| **Form Labels** | 12px, Semibold (600) | `text-xs font-semibold text-slate-700` | Input, select, and textarea labels |
| **Table Headers** | 11px, Semibold, Uppercase | `text-[11px] font-semibold text-slate-500 uppercase tracking-wider` | Table column headers |
| **Meta / Timestamps**| 11px, Medium (500) | `text-[11px] text-slate-400` | Created dates, relative times |
| **Badge Labels** | 11px / 12px, Medium (500) | `text-[11px] font-medium` or `text-xs font-medium` | Status pills, stage badges |

---

## 3. Spacing, Borders & Elevation

- **Card Border Radius**: `rounded-2xl` for major page cards, tables, and modals; `rounded-xl` for inner components and buttons; `rounded-lg` for form controls.
- **Elevation / Shadows**:
  - `shadow-xs`: Default for white cards on slate-50 background (`box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05)`).
  - `shadow-sm`: Interactive button states and active card highlights.
  - `shadow-xl`: Dropdown menus, tooltips, and flyouts.
  - `shadow-2xl`: Modal dialogs with dark backdrop blur (`bg-slate-900/40 backdrop-blur-sm`).
- **Standard Spacing**:
  - Page container: `space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`.
  - Grid gaps: `gap-3 sm:gap-4 lg:gap-6`.
  - Form field spacing: `space-y-4` between rows, `space-y-1.5` between label and control.

---

## 4. Breakpoint Standards & Responsive Behavior

| Breakpoint | Viewport Range | Layout Behavior |
|---|---|---|
| **Small Mobile** | 320px – 374px | Single column grids; compact headers with wrapped actions; touch-friendly 40px minimum tap targets; tables with horizontal scrolling; modals clamped to 94vw |
| **Standard Mobile**| 375px – 429px | Single column grids; compact KPI cards (2 cols for stats); full-width search and filters |
| **Large Mobile** | 430px – 639px | 2-column KPI cards; responsive filter bars with wrap |
| **Tablet** | 640px – 1023px | 2 or 3-column grids; collapsible sidebar or drawer; expanded tables; 2-column forms |
| **Laptop / Desktop**| 1024px – 1439px | Fixed 64-width or 20-width collapsed sidebar; multi-column dashboard analytics; full data tables |
| **Large Desktop** | 1440px+ | Maximum container clamp (`max-w-7xl`), centered alignment, generous white space |

---

## 5. Standard Component Guidelines

### Buttons (`Button.jsx`)
- **Variants**: `primary` (blue), `secondary` (soft slate), `outline` (white with border), `ghost` (transparent), `danger` (rose).
- **Sizes**: `xs` (28px height, 11px font), `sm` (32px height, 12px font), `md` (38px height, 13px font), `lg` (44px height, 14px font).
- **Invariants**: Always provide loading spinner (`isLoading`), disabled state (`disabled`), left/right icon slots, and touch padding.

### Form Inputs (`Input.jsx`, `Select.jsx`, `Textarea.jsx`)
- Clear label with asterisk indicator for required fields.
- Left icon slot (e.g. Search, Phone, Mail) with appropriate padding (`pl-9`).
- Accessible error state with red border (`border-rose-300`) and message (`text-xs text-rose-600 font-medium`).
- Helper text support below input.

### Modals (`Modal.jsx`)
- Backdrop blur with `Escape` key and click-outside dismissal.
- Responsive clamping: `w-full max-w-md / max-w-lg / max-w-2xl` with `max-h-[92vh] overflow-y-auto`.
- Standard sticky footer for `Cancel` and `Submit` buttons.

### Tables (`Table` components)
- Clean card enclosure with `rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs`.
- Responsive horizontal scrolling wrapper (`overflow-x-auto`).
- Alternating row hover: `hover:bg-slate-50/70 transition`.
- Integrated pagination bar with records counter and previous/next buttons.

