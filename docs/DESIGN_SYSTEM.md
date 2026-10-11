# PRAN-NET Design System
**Pran Operational Mitigation Network — Visual Identity & Design Tokens**
*Aesthetic: Atmospheric Civic Intelligence / High-Clarity Decision Support*

---

## 1. Design Principles
1. **Atmospheric Depth:** Visual depth through restrained glass surfaces, layered elevation tones, and contextual luminescence.
2. **Dual-Theme Parity:** Dark mode ("Obsidian Atmosphere") and Light mode ("Airglass Porcelain") are treated as first-class citizens. Contrast ratios exceed WCAG AA standards (minimum 4.5:1 for body text, 3:1 for UI controls).
3. **Truthful Semantics:** Colors strictly map to observational certainty and alert states:
   - **Emerald (`#10B981` / `#059669`):** Satisfactory / Verified / Recorded Action.
   - **Cyan (`#06B6D4` / `#0891B2`):** Atmospheric brand accent / Primary interactive element.
   - **Amber (`#F59E0B` / `#D97706`):** Moderate / Advisory caution / Disagreement flag.
   - **Coral (`#EF4444` / `#DC2626`):** Severe / Very Poor / Indoor mitigation recommendation.
   - **Slate / Indigo:** Secondary data context / Model parameters.
4. **Information Hierarchy:** High-density civic cards with crisp headers, monospace metadata labels, accessible data tables, and explicit status badges.

---

## 2. Color Tokens & CSS Variables

| Token Name | Obsidian Atmosphere (Dark) | Airglass Porcelain (Light) | Purpose |
|---|---|---|---|
| `--bg-canvas` | `#080E1A` | `#F8FAFC` | Root app background |
| `--bg-surface-0` | `#0D1527` | `#FFFFFF` | Primary content panels |
| `--bg-surface-1` | `#111C32` | `#F1F5F9` | Elevated cards / inputs |
| `--bg-surface-glass` | `rgba(13, 21, 39, 0.75)` | `rgba(255, 255, 255, 0.85)` | Navigation / header backdrop blur |
| `--border-subtle` | `rgba(255, 255, 255, 0.08)` | `#E2E8F0` | Card borders / dividers |
| `--border-strong` | `rgba(255, 255, 255, 0.16)` | `#CBD5E1` | Focused / active borders |
| `--text-primary` | `#F1F5F9` | `#0F172A` | Headings and high-emphasis body |
| `--text-secondary`| `#94A3B8` | `#475569` | Secondary metadata and labels |
| `--text-muted` | `#64748B` | `#64748B` | Footnotes, caveats, disabled items |
| `--accent-cyan` | `#06B6D4` | `#0891B2` | Brand identity & key telemetry |
| `--accent-emerald`| `#10B981` | `#059669` | Verified positive states |
| `--accent-amber` | `#F59E0B` | `#D97706` | Cautionary advisories |
| `--accent-coral` | `#EF4444` | `#DC2626` | Critical advisory / alerts |

---

## 3. Typography & Components
- **Font Stack:** `Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
- **Monospace Stack:** `"JetBrains Mono", "Fira Code", monospace`
- **Pills & Status Badges:**
  - `LIVE`: High-contrast green badge with pulse indicator.
  - `SIMULATED DEMO DATA`: Distinctive amber badge indicating test scenario.
  - `NEEDS CONFIGURATION`: Subtle slate/amber badge indicating unconfigured credentials.
  - `UNAVAILABLE`: Muted neutral badge.
- **Elevation & Shadows:**
  - Dark: Low-opacity cyan ambient glows (`box-shadow: 0 4px 20px -2px rgba(6, 182, 212, 0.08)`).
  - Light: Restrained diffuse shadows (`box-shadow: 0 4px 16px -2px rgba(15, 23, 42, 0.06)`).

---

## 4. Theme Persistence Contract
- Attribute: `data-theme="dark"` or `data-theme="light"` on `<html>`.
- Key in `localStorage`: `prannet_theme_mode` (`"dark"`, `"light"`, `"system"`).
- Fallback: Defaults to system preference via `window.matchMedia('(prefers-color-scheme: dark)')`.
- Anti-flash script initialized before DOM paint in `index.html`.
