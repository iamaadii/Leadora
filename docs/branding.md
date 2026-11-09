# Leadora Brand Identity & Style Guide

**Brand**: Leadora  
**Tagline**: Every Lead. Every Opportunity. One Platform.  
**Version**: 1.0  
**Date**: November 10, 2026  

---

## 1. Executive Brand Overview

**Leadora** is a modern, multi-tenant Business CRM and Lead Management SaaS platform designed to centralize customer leads, empower high-performing sales teams, track deals through a visual 7-stage pipeline, automate follow-ups, and deliver real-time operational sales analytics.

### Brand Promise
"Every Lead. Every Opportunity. One Platform."  
Leadora converts prospective inbound and outbound sales leads into predictable, repeatable business revenue through disciplined pipeline stages, strict supervisor boundaries, and actionable customer interaction timelines.

---

## 2. Logo Architecture & Assets

The Leadora brand symbol is a minimalist, modern geometric monogram combining:
1. **The Letter "L"**: A bold, solid foundation representing stability, structure, and reliability.
2. **Upward Growth Vector**: An ascending 45-degree arrow trajectory symbolizing pipeline conversion velocity and commercial expansion.
3. **Emerald Growth Node**: A distinct circular terminal node representing the "Won" deal and value realization.

### Asset Manifest

| Asset | Location | Dimensions / ViewBox | Primary Use Case |
| :--- | :--- | :---: | :--- |
| **Full Brand Logo (SVG)** | `/brand/leadora-logo.svg` | `220 × 48` | Public landing page, navigation bars, email headers, marketing |
| **Symbol-Only Icon (SVG)** | `/brand/leadora-icon.svg` | `48 × 48` | Compact sidebar, mobile navigation, avatars, app launchers |
| **Browser Favicon (SVG)** | `/brand/favicon.svg` | `32 × 32` | Browser tabs, bookmarks, PWA manifests |

---

## 3. Brand Color Palette

| Color Role | Hex Code | Tailwind Token | Semantic Meaning |
| :--- | :---: | :--- | :--- |
| **Primary Brand Indigo** | `#4F46E5` | `bg-indigo-600`, `text-indigo-600` | Core brand identity, primary CTA buttons, active accents |
| **Primary Brand Blue** | `#2563EB` | `bg-blue-600`, `text-blue-600` | Interactive highlights, links, focused inputs |
| **Dark Navy** | `#0F172A` | `bg-slate-900`, `text-slate-900` | Landing page background, logo container, strong headers |
| **App Background** | `#F8FAFC` | `bg-slate-50` | Authenticated application background |
| **Card Surface** | `#FFFFFF` | `bg-white` | Content cards, tables, modal dialogs, toolbars |
| **Secondary Accent (Emerald)** | `#10B981` | `text-emerald-500`, `bg-emerald-500` | Growth vector, won deals, positive indicators |
| **Primary Text** | `#0F172A` | `text-slate-900` | Primary typography, lead names, key metrics |
| **Secondary Text** | `#64748B` | `text-slate-500` | Helper descriptions, timestamps, breadcrumbs |
| **Subtle Borders** | `#E2E8F0` | `border-slate-200` | Card borders, dividers, table grid lines |

---

## 4. Typography Hierarchy

Leadora utilizes clean, sans-serif typography with high legibility across all viewport resolutions:

- **Primary Typeface**: `system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
- **Monospace Typeface**: `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`

| Level | Size / Weight | Tailwind Class | Context |
| :--- | :---: | :--- | :--- |
| **Display 1 (Hero)** | 48px – 60px / 800 | `text-4xl sm:text-5xl lg:text-6xl font-extrabold` | Landing page hero headline |
| **Page Heading** | 24px / 700 | `text-xl sm:text-2xl font-bold` | Application workspace headers (`PageHeader`) |
| **Section Heading** | 16px / 700 | `text-base font-bold` | Card headers, table titles, modal headers |
| **Card Metric** | 24px – 28px / 700 | `text-2xl font-bold` | KPI summary totals |
| **Body Standard** | 13px – 14px / 400 | `text-xs sm:text-sm` | Narrative copy, timeline notes, modal bodies |
| **Label / Caption** | 11px – 12px / 600 | `text-xs font-semibold` | Form labels, table headers, breadcrumbs |

---

## 5. Reusable Component: `BrandLogo`

All frontend product branding is centralized in the reusable React component located at:  
`apps/web/src/components/brand/BrandLogo.jsx`

### Component Props

```jsx
<BrandLogo
  variant="full"       // "full" | "icon"
  size="md"            // "xs" | "sm" | "md" | "lg" | "xl"
  theme="light"        // "light" | "dark"
  showSubtitle={true}  // true | false
  subtitleText="CRM & Pipeline Platform"
  className="my-custom-class"
/>
```

### Usage Examples

```jsx
// 1. Navigation Bar (Dark Theme)
<BrandLogo
  variant="full"
  size="md"
  theme="dark"
  showSubtitle
  subtitleText="Every Lead. Every Opportunity."
/>

// 2. Compact Sidebar (Icon Only)
<BrandLogo variant="icon" size="sm" />

// 3. User Login Screen
<BrandLogo
  variant="full"
  size="lg"
  showSubtitle={false}
  className="justify-center"
/>
```

---

## 6. Brand Usage Guidelines (Dos & Don'ts)

### Do:
- Always use the vectorized SVG assets (`leadora-logo.svg`, `leadora-icon.svg`, `favicon.svg`) to preserve sharpness at high DPI.
- Pair the stylized "L" icon with the official tagline: *"Every Lead. Every Opportunity. One Platform."*
- Maintain contrast by using `theme="dark"` on dark slate backgrounds and `theme="light"` on white/slate-50 cards.
- Respect responsive breakpoints: switch to `variant="icon"` when horizontal space is constrained (e.g. collapsed sidebar).

### Don't:
- Do not stretch, warp, or alter the aspect ratio of the logo symbol.
- Do not modify the geometry of the emerald growth node or remove it from the icon.
- Do not introduce unrelated gradients or drop shadows outside the specified brand tokens.
- Do not use generic office building clip-art or unbranded placeholders in user-facing views.

