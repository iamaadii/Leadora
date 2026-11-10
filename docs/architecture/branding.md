# Brand Identity & Style Guide

This document explains the Leadora brand name, logo, colors, and design rules in simple words.

---

## 1. Brand Summary

- **Name:** Leadora
- **Tagline:** Every Lead. Every Opportunity. One Platform.
- **Purpose:** A clean, friendly CRM platform that helps sales teams close more deals without feeling overwhelmed.

---

## 2. Logo and Symbols

The Leadora logo combines three simple ideas:
1. **The Letter "L":** Solid shape representing strength and reliability.
2. **Upward Arrow:** Represents sales growth and speed.
3. **Green Dot:** Represents a successfully won deal.

### Logo Files

| Asset | File Location | Used For |
| :--- | :--- | :--- |
| **Full Logo** | `/brand/leadora-logo.svg` | Main website header, login screen, navigation bars |
| **Small Icon** | `/brand/leadora-icon.svg` | Mobile menu, sidebar collapsed state, profile icon |
| **Browser Icon** | `/brand/favicon.svg` | Browser tab icon |

---

## 3. Brand Colors

Leadora uses a modern, high-contrast color palette:

| Color | Hex Code | Where It Is Used |
| :--- | :---: | :--- |
| **Royal Blue** | `#2563EB` | Primary buttons, active tabs, main accents |
| **Indigo** | `#4F46E5` | Gradient headers and brand highlights |
| **Emerald Green** | `#10B981` | Won deals, success badges, live demo buttons |
| **Dark Navy** | `#0F172A` | Landing page background, dark headers, main text |
| **Light Gray** | `#F8FAFC` | App page background |
| **White** | `#FFFFFF` | Cards, modals, tables |
| **Slate Gray** | `#64748B` | Secondary descriptions, timestamps |
| **Border Gray** | `#E2E8F0` | Dividers and table outlines |

---

## 4. Reusable Logo Component

To show the logo anywhere in the React app, use the `BrandLogo` component:

```jsx
import { BrandLogo } from '../components/brand/BrandLogo.jsx';

// Example: Full dark theme logo with subtitle
<BrandLogo
  variant="full"
  size="md"
  theme="dark"
  showSubtitle={true}
  subtitleText="CRM & Pipeline Platform"
/>
```

