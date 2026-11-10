# Frontend UI & Accessibility Audit

This document explains the mobile responsiveness and accessibility checks in simple words.

---

## 1. What was Audited?

Every screen in the web app was tested for:
1. **Device Responsiveness:** Ensuring pages look great on screens from 320px wide up to 4K monitors.
2. **Touch Targets:** Ensuring buttons and inputs are at least 40px tall so they are easy to tap with a thumb.
3. **Color Contrast:** Ensuring all text has strong contrast against its background for easy reading.
4. **Keyboard Accessibility:** Ensuring all modals and dropdowns can be operated with keyboard tabs and the `Escape` key.
5. **No Tech Jargon on Pages:** Ensuring no framework names (like React, Vite, Node, Express, Postgres, Docker) appear on user-facing screens.

---

## 2. Key Improvements

- **Mobile Tables:** Tables use smooth horizontal scrolling containers with swipe indicators so columns don't compress.
- **Modals:** Automatically resize and scroll on small mobile screens without clipping the header or action buttons.
- **Forms:** Input fields stretch to comfortable full width on mobile devices.
- **Kanban Board:** Includes an accessible stage dropdown on each card for quick touch or keyboard movement without requiring drag-and-drop.

