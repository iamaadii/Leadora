# Frontend Design System

This document explains the Leadora visual styles, colors, and UI components in simple words.

---

## 1. Color Palette

- **App Background:** Soft light gray (`#F8FAFC`).
- **Cards & Modals:** Crisp white (`#FFFFFF`) with subtle rounded borders.
- **Primary Buttons & Links:** Royal Blue (`#2563EB`).
- **Success / Won Deals:** Emerald Green (`#059669`).
- **Due Today / Warning:** Amber Orange (`#D97706`).
- **Overdue / Danger:** Rose Red (`#E11D48`).
- **Text:** Dark slate (`#0F172A`) for headings; muted slate (`#64748B`) for helper notes.

---

## 2. Reusable UI Components

The app uses reusable components located in `apps/web/src/components/common/`:

1. **`Button`:**
   - Styles: `primary` (blue), `secondary` (soft gray), `outline` (white with border), `danger` (red), `ghost` (transparent).
   - Built-in loading spinner when an action is saving.

2. **`Input`, `Select`, `Textarea`:**
   - Accessible labels with red asterisks for required fields.
   - Built-in icon support (like search or calendar icons).
   - Shows clear red error messages below the input when validation fails.

3. **`Modal`:**
   - Dark transparent backdrop.
   - Closes when pressing the `Escape` key or clicking outside.
   - Smooth scrolling on mobile screens.

4. **`Badge`:**
   - Small colored pills used for lead stages, task priorities, and user roles.

5. **`PageHeader`:**
   - Consistent title, subtitle, and action button bar at the top of every screen.

---

## 3. Responsive Screen Support

The app works seamlessly on all device sizes:
- **Mobile Phones (320px – 480px):** Single-column cards, full-width thumb-friendly buttons, and horizontal scroll tables.
- **Tablets (640px – 1024px):** 2-column grids with quick filter bars.
- **Desktop (1024px+):** Full multi-column dashboard, sticky navigation, and wide data tables.

