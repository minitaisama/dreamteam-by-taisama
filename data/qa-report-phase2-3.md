# QA Report — Phase 2+3

**Site:** https://dreamteam20.vercel.app  
**Auditor:** Curry (QA)  
**Date:** 2026-03-19 00:57 GMT+7  
**Viewport tested:** 1280×900 (desktop), 768×1024 (tablet), 375×812 (mobile)

---

## Design Audit

| # | Dimension | Score | Notes |
|---|-----------|-------|-------|
| 1 | **Information Architecture** | **8/10** | Clear hierarchy: header → agent strip → KPIs → pixel scene + feed → charts → footer. Scannable at a glance. User understands "4 agents, 1 working, live data, pixel scene" within 2 seconds. Minor: charts section feels disconnected from the live narrative. |
| 2 | **Interaction States** | **7/10** | Loading state works ("Live: loading…" → resolves to "updated Xs ago"). DEMO MODE flag hidden after JS init. No error states visible (good — no errors thrown). Missing: no skeleton loaders, no explicit error handling UI visible (what happens if gist fetch fails?). "Show more" button exists but shows nothing when feed has only 1 message — should be disabled or hidden. |
| 3 | **User Journey** | **8/10** | Flow is logical: see who's working → see what they're doing → see the scene → see history (feed + charts). The pixel scene adds personality and makes it feel like a game world. Feed connects narrative to action. Charts show historical context. Natural top-to-bottom scan. |
| 4 | **AI Slop Risk** | **9/10** | Refreshingly free of AI slop. No gradient hero, no icon grid, no "empowering" copy, no generic stock photos. Dark theme with pixel art is distinctive and intentional. The only risk: the purple accent (`#8b5cf6`) is a common Tailwind default — but it's used sparingly and consistently. |
| 5 | **Design System + Component Reuse** | **8/10** | CSS custom properties define the system (`--bg: #0a0a0f`, `--surface: #12121a`, `--text: #e8e8ec`, `--accent: #8b5cf6`, `--border: #2a2a3a`). Cards share consistent border-radius, padding, and surface color. Role chips use distinct colors (CEO=gold, PM=blue, Dev=green, QA=yellow). No custom fonts — system sans-serif (acceptable, keeps it fast). Minor inconsistency: agent cards and KPI cards have slightly different internal layouts. |
| 6 | **Responsive/A11y** | **7/10** | **Desktop (1280px):** Perfect layout, everything fits. **Tablet (768px):** Works — 2-col grid for agents, status pills wrap in header. Pixel scene gets small but readable. **Mobile (375px):** Fully functional, single-column stack. Charts are cramped. Touch targets (Show more, pills) are tight. A11y: semantic HTML (`<main>`, `<header>`, `<footer>`, `role="region"`, `aria-label` on pixel scene and characters). Proper heading hierarchy (h1→h2→h3). Zero console errors/warnings. Missing: no `alt` text strategy for pixel characters, no focus-visible styles visible, no skip-nav link. |
| 7 | **Unresolved Decisions** | **7/10** | Several open questions: (1) Charts show only 1 data point (W11) — is this expected for launch or a data seeding issue? (2) Activity feed has only 1 message — is the "Show more" button premature? (3) Lebron's sprite has `state-run` class but doesn't actually move positionally — just frame animation. Is positional movement planned? (4) No avatar images on agent cards — intentional minimalism or TBD? (5) "DEMO MODE" exists in DOM but is hidden — is this a toggle for future use? |

**Overall: 7.7/10**

---

## Specific Checks

### Pixel Scene: ✅ PASS (with notes)
- **Characters visible:** Yes — 4 character divs found: `#char-minisama` (trainer, idle), `#char-coach` (idle), `#char-lebron` (state-run), `#char-curry` (idle)
- **Animation:** Frame-level sprite animation confirmed (campfire flicker + character frame changes between two screenshots 3s apart). However, no positional movement — Lebron has `state-run` class but doesn't walk across the scene.
- **States:** Correct — Lebron shows `state-run` (working), others show `state-idle`. Matches agent card statuses.
- **Props:** Campfire present with flicker animation.
- **Note:** Characters are div-based CSS sprites, not canvas. Accessible via `aria-label` on each character.

### Agent Status Cards: ✅ PASS
- **Name + Role:** All 4 agents show name and colored role chip (CEO=gold, PM=blue, Dev=green, QA=yellow).
- **Status dot:** Lebron has a green presence dot. Others don't show explicit dots (they're IDLE, so this may be intentional).
- **Current task:** Lebron shows "Implement Phase 1 live layer" with typing indicator "...typing...". Others show "No active task".
- **Status badge:** IDLE/WORKING label right-aligned on each card.

### Activity Feed: ✅ PASS (with notes)
- **Messages visible:** 1 message shown (coach, 12:14 AM, "Phase 1 task card: gist live.json + polling JS. Go.")
- **Chat-style formatting:** Yes — role chip + author name left, message in rounded bubble, timestamp right-aligned. Clean.
- **Timestamps:** Present ("12:14 AM").
- **"Show more" button:** Exists but reveals nothing (only 1 message in feed). Should be hidden/disabled when no more messages exist.
- **Note:** Feed is sparse — only 1 message. This is a data issue, not a UI issue.

### Live Data: ✅ PASS
- **"Live" pill:** Shows "Live (Gist): updated Xs ago" — counter ticks (observed "updated 3s ago" → "updated 21s ago" → "updated 24s ago").
- **"Last updated" indicator:** Embedded in the live pill. Shows gist polling is active.
- **Loading state:** Initial HTML shows "Live: loading…" before JS resolves.
- **DEMO MODE:** Present in DOM but hidden after JS initialization.

### Charts: ⚠️ PARTIAL PASS
- **Velocity Trend:** Renders as a line chart with grid (0-9 y-axis). Only 1 data point visible (W11, value 9). No multi-week trend.
- **Quality Score:** Renders as a bar chart (0-10 y-axis). Only 1 bar visible (W11, value ~7).
- **Note:** Charts are technically rendering correctly, but with only 1 data point each they look broken/empty. This may be a data seeding issue for launch.

---

## Issues Found

### 1. Charts show only 1 data point — looks empty
- **Severity:** minor
- **Description:** Both Velocity Trend and Quality Score charts render with a single data point (W11). This makes the charts appear broken or unpopulated rather than "early in the project."
- **Evidence:** Desktop screenshot shows Velocity chart with 1 purple dot and Quality chart with 1 gold bar.
- **Recommendation:** Either seed with mock historical data (W7-W11) or add a "No historical data yet" placeholder message inside the chart area.

### 2. "Show more" button visible when no more messages exist
- **Severity:** cosmetic
- **Description:** Activity feed "Show more" button is clickable but reveals nothing (only 1 message in feed). Creates a confusing dead interaction.
- **Evidence:** Clicked "Show more" — no additional messages appeared.
- **Recommendation:** Hide or disable the button when `messages.length <= visibleCount`.

### 3. Lebron sprite has `state-run` but doesn't move positionally
- **Severity:** cosmetic
- **Description:** Lebron's character div has `class="state-run"` and the sprite animates frames, but the character doesn't walk or change position on the scene. The "running" label implies movement.
- **Evidence:** Two screenshots 3s apart show Lebron in the same position despite `state-run` class.
- **Recommendation:** Either add positional CSS animation (translateX) for the running state, or rename the class to `state-active` / `state-working` to match the actual behavior.

### 4. Touch targets tight on mobile (375px)
- **Severity:** minor
- **Description:** "Show more" button, status pills, and footer links are small on mobile. May be difficult to tap accurately.
- **Evidence:** Mobile screenshot shows compact controls.
- **Recommendation:** Add minimum 44px touch target height for interactive elements.

### 5. No visible error handling for failed gist fetch
- **Severity:** minor
- **Description:** The dashboard polls a gist for live data. If the fetch fails (network error, rate limit, gist deleted), there's no visible error state or fallback UI.
- **Evidence:** Static HTML shows "Live: loading…" as initial state. No error state found in DOM or tested (site is currently working).
- **Recommendation:** Add a visible error state (e.g., "Connection lost" badge, retry button) for when gist polling fails.

### 6. Pixel scene characters lack movement / interactivity
- **Severity:** minor
- **Description:** The pixel scene has sprite frame animations but no positional movement or user interaction. Characters stand in place. This limits the "alive" feel.
- **Evidence:** Snapshot shows all characters at fixed positions with only frame-level animation.
- **Recommendation:** Consider adding periodic positional movement (walking animation for active agents), hover effects on characters, or click-to-inspect.

### 7. No keyboard focus styles observed
- **Severity:** minor
- **Description:** No visible focus indicators on interactive elements (Show more button, links). Tab navigation may work but without visible focus rings.
- **Evidence:** Accessibility audit via snapshot — no focus-visible styles in CSS variables or inline.
- **Recommendation:** Add `focus-visible` ring styles matching the accent color.

---

## Release Recommendation

### ✅ SHIP

**Rationale:**
- Zero console errors or warnings across all viewports
- Clean semantic HTML with proper ARIA labels
- All core features functional: pixel scene with animation, agent cards with live status, activity feed with chat formatting, live polling indicator, charts rendering
- Responsive at all 3 breakpoints (desktop, tablet, mobile) — no broken layouts
- Distinctive design with zero AI slop
- All issues found are minor or cosmetic — none block the core experience

**Pre-ship建议:**
1. Seed charts with a few weeks of mock data so they don't look empty on first load
2. Hide "Show more" when feed has ≤ visible messages
3. Add error state for gist fetch failure (even a simple text fallback)

**Post-ship nice-to-have:**
- Character positional movement in pixel scene
- Keyboard focus styles
- Mobile touch target improvements
- Agent avatars on cards
