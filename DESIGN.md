---
name: homelab
description: Mostly dark developer-console observability dashboard for solo developers and self-hosted projects.
colors:
  console-bg: "#090D12"
  sidebar-bg: "#070B10"
  panel: "#101820"
  panel-raised: "#15212B"
  border: "#253240"
  divider: "#1D2A36"
  text: "#E6EDF3"
  muted-copy: "#8B98A5"
  faint-copy: "#5E6B78"
  terminal-cyan: "#38D9F5"
  success: "#36D399"
  success-bg: "#123525"
  warning: "#F6C85F"
  warning-bg: "#352A13"
  critical: "#F87171"
  critical-bg: "#3A171D"
typography:
  brand:
    fontFamily: "\"Chelsea Market\", \"Trebuchet MS\", system-ui, sans-serif"
    fontSize: "22px"
    fontWeight: 400
    lineHeight: 1.14
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
    textColor: "{colors.muted-copy}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "10px 12px"
  nav-item-active:
    backgroundColor: "{colors.panel-raised}"
    textColor: "{colors.text}"
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

homelab should feel like a private technical console for a solo developer who checks it between deploys, cron runs, and server chores. The system is minimal, compact, and task-first: a mostly dark charcoal workspace, terminal-like command framing, and clear status rows make it feel native to a developer workstation without drifting into novelty.

The design deliberately rejects marketing-site polish, public status-page ceremony, enterprise observability drama, and neon terminal cosplay. Visual energy is reserved for real operational state: active navigation, the command bar, status pills, health counts, and timeline log rows.

**Key Characteristics:**
- Restrained product UI with mostly dark charcoal surfaces and precise hairline borders.
- A Chelsea Market wordmark limited to the sidebar brand.
- Bold compact type for scan speed, not personality display.
- Monospace accents for paths, commands, timestamps, IDs, and status metadata.
- Flat dark surfaces with tonal separation instead of decorative shadows.
- Semantic health color paired with explicit labels.
- Dense but calm layouts that keep current problems easy to find.

## 2. Colors

The palette is a restrained developer-console palette: charcoal surfaces, cooler cyan signal color, and purpose-built semantic health colors.

### Primary
- **Console Background**: the app-wide near-black surface for the mostly dark workspace.
- **Panel Charcoal**: the default dashboard panel surface.
- **Terminal Cyan**: the sparse accent for command prompts, active operational signal, and key status metadata. It should stay rare.

### Secondary
- **Health Green**: success status uses green text on a dark green wash so the label remains readable and does not rely on color alone.
- **Warning Amber**: warning status uses amber text on a dark amber wash for non-critical attention.
- **Critical Red**: critical status uses red text on a dark red wash for urgent operational action.

### Neutral
- **Sidebar Background**: the darkest stable rail for navigation and workspace context.
- **Raised Panel**: active navigation, command bar chips, and header summaries.
- **Quiet Border**: the dark interface stroke.
- **Row Divider**: the internal list separator.
- **Muted Copy**: secondary body text, timestamps, labels, and metadata.
- **Faint Copy**: tertiary metadata and low-emphasis labels.

### Named Rules

**The Quiet Until Broken Rule.** Neutral surfaces carry most of the interface. Health colors appear only where they communicate actual state.

**The No Marketing Blue Rule.** Do not introduce default SaaS blues for primary actions or charts. homelab's visual identity is charcoal, cyan, and restrained semantic state color.

## 3. Typography

**Brand Font:** Chelsea Market for the top-left `homelab` wordmark only.
**Display Font:** Inter/system sans stack.
**Body Font:** Inter/system sans stack.
**Label/Mono Font:** UI monospace stack for commands, timestamps, IDs, paths, and compact state metadata.

**Character:** The type system is compact, bold, and utilitarian. The brand name gets one expressive type moment; sans carries structure and reading; monospace is used as a developer-console accent for paths, commands, timestamps, IDs, and scan metadata.

### Hierarchy

- **Display** (800, 34px, 1.15): Page titles such as Dashboard. Use sparingly; product screens should not need hero-scale type.
- **Brand** (400, 22px, 1.14): Sidebar wordmark only.
- **Headline** (800, 24px, 1.2): Major screen-level anchors.
- **Title** (800, 17px, 1.25): Section headings and panel titles.
- **Body** (400-800, 14-16px, 1.43-1.5): Project names, summaries, alert messages, and dashboard explanations. Keep longer prose under 75ch.
- **Label** (700-800, 12-13px, normal letter spacing, uppercase only for compact metadata): Metric labels, status labels, timestamps, commands, and run-state metadata.

### Named Rules

**The Wordmark Exception Rule.** Chelsea Market is reserved for the `homelab` wordmark. Use sans for UI structure and monospace only where developer-console metadata earns it.

**The No Hero Dashboard Rule.** Dashboard headings stay fixed and compact. Avoid fluid hero typography in app surfaces.

## 4. Elevation

homelab is flat by default. Depth is communicated through dark surface lightness, 1px borders, internal dividers, and spacing. Shadows are not part of the current vocabulary and should not be added as decoration.

### Named Rules

**The Border-Only Rule.** Panels use a 1px Quiet Border and no drop shadow at rest. If future interaction needs elevation, use a small state-specific shadow only after the interaction earns it.

## 5. Components

### Navigation

The sidebar is a stable technical frame: near-black surface, compact bold labels, and a clear active item.

- **Shape:** Gently squared controls with an 8px radius.
- **Default:** Transparent item background with Muted Copy text.
- **Active:** Raised Panel background with Text foreground.
- **Spacing:** 10px vertical by 12px horizontal padding; 6px between items.

### Status Chips

Status chips are semantic labels, not decorative pills.

- **Shape:** Full pill radius.
- **Style:** Dark semantic fill with bright readable text.
- **State:** Always include the text label Healthy, Warning, or Critical. Color alone is forbidden.
- **Padding:** 5px vertical by 10px horizontal.

### Cards / Containers

Cards and sections are restrained information containers.

- **Corner Style:** Gently squared (8px).
- **Background:** Panel Charcoal on Console Background.
- **Shadow Strategy:** No shadows at rest.
- **Border:** 1px Quiet Border on outer panels; Row Divider inside lists.
- **Internal Padding:** 18px for dashboard panels, 14px for compact run-status panels.

### Metric Tiles

Metric tiles are compact readouts, not hero stats.

- **Style:** Same dark container vocabulary as cards.
- **Typography:** Uppercase Label for the metric name and 30px bold value.
- **Behavior:** Keep values close to their labels; avoid decorative charts unless they answer an operational question.

### Rows and Timeline Items

Rows are dense and scan-oriented.

- **Layout:** Main text flexes; metadata aligns to the right.
- **Dividers:** 1px Row Divider between items.
- **Timeline Structure:** Monospace time and event type columns, followed by readable sans project/message text.

## 6. Do's and Don'ts

### Do:

- **Do** keep the default screen mostly dark and neutral: Console Background, Panel Charcoal, Raised Panel, and sparse Terminal Cyan.
- **Do** use exact status labels with semantic colors for every health state.
- **Do** keep card corners at 8px and status pills at 999px.
- **Do** use flat 1px borders and internal dividers for structure.
- **Do** preserve density where it helps solo developers scan current health quickly.

### Don't:

- **Don't** make this look like a marketing site, SaaS landing page, public status-page brochure, enterprise observability command center, or neon terminal cosplay.
- **Don't** add oversized hero sections, decorative metrics, over-styled dashboard chrome, playful branding, heavy gradients, or dense visual noise.
- **Don't** introduce gradient text, glassmorphism, wide drop shadows, or 32px-plus card radii.
- **Don't** use color without a label for health or alert state.
- **Don't** turn terminal/developer theming into novelty: no Matrix rain, fake hacker decoration, or unreadable green-on-black cosplay.
