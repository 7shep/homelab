---
name: homelab
description: Minimal technical observability dashboard for solo developers and self-hosted projects.
colors:
  operational-slate: "#111827"
  app-canvas: "#F6F7F9"
  panel: "#FFFFFF"
  panel-raised: "#F9FAFB"
  border: "#E5E7EB"
  divider: "#EEF2F7"
  muted-copy: "#64748B"
  nav-copy: "#CBD5E1"
  signal-mint: "#2DD4BF"
  signal-mint-soft: "#A7F3D0"
  success-text: "#166534"
  success-bg: "#DCFCE7"
  warning-text: "#92400E"
  warning-bg: "#FEF3C7"
  critical-text: "#991B1B"
  critical-bg: "#FEE2E2"
typography:
  display:
    fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif"
    fontSize: "34px"
    fontWeight: 800
    lineHeight: 1.15
    letterSpacing: "normal"
  headline:
    fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif"
    fontSize: "24px"
    fontWeight: 800
    lineHeight: 1.2
  title:
    fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif"
    fontSize: "17px"
    fontWeight: 800
    lineHeight: 1.25
  body:
    fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.43
  label:
    fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif"
    fontSize: "12px"
    fontWeight: 800
    lineHeight: 1.2
rounded:
  sm: "6px"
  md: "8px"
  pill: "999px"
spacing:
  xs: "4px"
  sm: "6px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  xxl: "32px"
components:
  nav-item:
    backgroundColor: "transparent"
    textColor: "{colors.nav-copy}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "10px 12px"
  nav-item-active:
    backgroundColor: "{colors.panel-raised}"
    textColor: "{colors.operational-slate}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "10px 12px"
  status-pill-critical:
    backgroundColor: "{colors.critical-bg}"
    textColor: "{colors.critical-text}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "5px 10px"
  panel-card:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.operational-slate}"
    rounded: "{rounded.md}"
    padding: "18px"
  metric-card:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.operational-slate}"
    rounded: "{rounded.md}"
    padding: "18px"
---

# Design System: homelab

## 1. Overview

**Creative North Star: "The Local Operations Console"**

homelab should feel like a private technical console for a solo developer who checks it between deploys, cron runs, and server chores. The system is minimal, compact, and task-first: dark navigation gives the product a grounded operational frame, while the working surface stays light, quiet, and scannable.

The design deliberately rejects marketing-site polish, public status-page ceremony, enterprise observability drama, and neon terminal cosplay. Visual energy is reserved for real operational state: active navigation, status pills, timeline markers, and health counts.

**Key Characteristics:**
- Restrained product UI with a dark slate shell and light operational workspace.
- Bold compact type for scan speed, not personality display.
- Flat surfaces with borders and tonal separation instead of decorative shadows.
- Semantic health color paired with explicit labels.
- Dense but calm layouts that keep current problems easy to find.

## 2. Colors

The palette is a restrained technical product palette: cool neutral surfaces, one mint signal accent, and purpose-built health colors.

### Primary
- **Operational Slate**: the dark shell color for the sidebar and the primary ink color for active states. It gives the app a technical frame without turning the whole interface into dark mode.
- **Signal Mint**: the sparse accent for timeline dots and positive operational signal. It should stay rare.

### Secondary
- **Health Green**: success status uses a soft green fill with dark green text so the label remains readable and does not rely on color alone.
- **Warning Amber**: warning status uses a warm pale fill with brown text for non-critical attention.
- **Critical Red**: critical status uses a pale red fill with dark red text for urgent operational action.

### Neutral
- **App Canvas**: the main dashboard background. It is cool and quiet, not cream, beige, or decorative.
- **Panel White**: the card and panel surface for metrics, sections, and compact summaries.
- **Panel Raised**: the active navigation surface and slightly lifted neutral state.
- **Quiet Border**: the outer container stroke.
- **Row Divider**: the internal list separator.
- **Muted Copy**: secondary body text, timestamps, labels, and metadata.
- **Navigation Copy**: inactive sidebar text against Operational Slate.

### Named Rules

**The Quiet Until Broken Rule.** Neutral surfaces carry most of the interface. Health colors appear only where they communicate actual state.

**The No Marketing Blue Rule.** Do not introduce default SaaS blues for primary actions or charts. homelab's visual identity is slate, white, and sparse mint.

## 3. Typography

**Display Font:** Inter/system sans stack.
**Body Font:** Inter/system sans stack.
**Label/Mono Font:** No separate mono or label font exists yet.

**Character:** The type system is compact, bold, and utilitarian. It uses one sans family across headings, labels, navigation, and data so the product feels familiar and fast rather than branded.

### Hierarchy

- **Display** (800, 34px, 1.15): Page titles such as Dashboard. Use sparingly; product screens should not need hero-scale type.
- **Headline** (800, 24px, 1.2): Product brand in the sidebar and major screen-level anchors.
- **Title** (800, 17px, 1.25): Section headings and panel titles.
- **Body** (400-800, 14-16px, 1.43-1.5): Project names, summaries, alert messages, and dashboard explanations. Keep longer prose under 75ch.
- **Label** (700-800, 12-13px, normal letter spacing, uppercase only for compact metadata): Metric labels, status labels, timestamps, and run-state metadata.

### Named Rules

**The One Sans Rule.** Do not add display fonts, novelty monospace, or decorative type. This is a tool, and the type should disappear into the task.

**The No Hero Dashboard Rule.** Dashboard headings stay fixed and compact. Avoid fluid hero typography in app surfaces.

## 4. Elevation

homelab is flat by default. Depth is communicated through a cool canvas, white panels, 1px borders, internal dividers, and spacing. Shadows are not part of the current vocabulary and should not be added as decoration.

### Named Rules

**The Border-Only Rule.** Panels use a 1px Quiet Border and no drop shadow at rest. If future interaction needs elevation, use a small state-specific shadow only after the interaction earns it.

## 5. Components

### Navigation

The sidebar is a stable technical frame: dark slate surface, compact bold labels, and a clear active item.

- **Shape:** Gently squared controls with an 8px radius.
- **Default:** Transparent item background with Navigation Copy text.
- **Active:** Panel Raised background with Operational Slate text.
- **Spacing:** 10px vertical by 12px horizontal padding; 6px between items.

### Status Chips

Status chips are semantic labels, not decorative pills.

- **Shape:** Full pill radius.
- **Style:** Soft semantic fill with dark readable text.
- **State:** Always include the text label Healthy, Warning, or Critical. Color alone is forbidden.
- **Padding:** 5px vertical by 10px horizontal.

### Cards / Containers

Cards and sections are restrained information containers.

- **Corner Style:** Gently squared (8px).
- **Background:** Panel White on App Canvas.
- **Shadow Strategy:** No shadows at rest.
- **Border:** 1px Quiet Border on outer panels; Row Divider inside lists.
- **Internal Padding:** 18px for dashboard panels, 14px for compact run-status panels.

### Metric Tiles

Metric tiles are compact readouts, not hero stats.

- **Style:** Same container vocabulary as cards.
- **Typography:** Uppercase Label for the metric name and 30px bold value.
- **Behavior:** Keep values close to their labels; avoid decorative charts unless they answer an operational question.

### Rows and Timeline Items

Rows are dense and scan-oriented.

- **Layout:** Main text flexes; metadata aligns to the right.
- **Dividers:** 1px Row Divider between items.
- **Timeline Marker:** Small Signal Mint dot, 12px square with 6px radius.

## 6. Do's and Don'ts

### Do:

- **Do** keep the default screen mostly neutral: App Canvas, Panel White, Operational Slate, and sparse Signal Mint.
- **Do** use exact status labels with semantic colors for every health state.
- **Do** keep card corners at 8px and status pills at 999px.
- **Do** use flat 1px borders and internal dividers for structure.
- **Do** preserve density where it helps solo developers scan current health quickly.

### Don't:

- **Don't** make this look like a marketing site, SaaS landing page, public status-page brochure, enterprise observability command center, or neon terminal cosplay.
- **Don't** add oversized hero sections, decorative metrics, over-styled dashboard chrome, playful branding, heavy gradients, or dense visual noise.
- **Don't** introduce gradient text, glassmorphism, wide drop shadows, or 32px-plus card radii.
- **Don't** use color without a label for health or alert state.
- **Don't** turn the whole app dark just because the product is technical; the current identity is a dark shell around a light workspace.
