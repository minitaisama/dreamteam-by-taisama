# Design System Document: High-Performance Agent Intelligence

## 1. Overview & Creative North Star

### The Creative North Star: "The Kinetic Observatory"
This design system is built to transform raw agent data into a high-fidelity command center. We are moving away from the "standard SaaS dashboard" and toward an **Editorial Intelligence** aesthetic. The goal is to make the user feel like a high-stakes curator of performance, where every metric has mass, every status has a pulse, and the UI feels like a seamless, high-performance instrument rather than a collection of boxes.

To achieve this, we leverage **intentional asymmetry**—grouping dense data visualizations next to expansive, high-contrast typography—and **tonal layering** to define hierarchy without the "grid-prison" feel of traditional borders.

---

## 2. Colors & Surface Logic

### The "No-Line" Rule
Traditional 1px solid borders are strictly prohibited for sectioning. They create visual noise that distracts from high-density performance data. Instead, define boundaries through:
1.  **Background Shifts:** Use `surface-container-low` for secondary sections sitting on a `surface` background.
2.  **Negative Space:** Use the `Spacing Scale (8, 10, 12)` to let the background "bleed" through as a natural separator.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers of polished obsidian. 
- **Base:** `background` (#111319) - The infinite canvas.
- **Sectioning:** `surface-container` (#1e1f26) - Primary layout blocks.
- **Nesting:** Place `surface-container-lowest` (#0c0e14) cards inside a `surface-container-high` (#282a30) sidebar to create "inset" depth.

### The "Glass & Gradient" Rule
For floating elements (modals, tooltips, or top-level navigation), use **Glassmorphism**:
- **Fill:** `surface_variant` (#33343b) at 60% opacity.
- **Effect:** `backdrop-filter: blur(12px)`.
- **Signature Glow:** Apply a subtle `0 0 20px` glow using `primary` (#d0bcff) at 10% opacity for active agent states or "Peak Performance" metrics.

---

## 3. Typography

The typography scale utilizes **Inter** to create a sharp, technical feel.

*   **Display (lg/md):** Used for "Hero Metrics" (e.g., Overall CSAT). These should be tracked tightly (letter-spacing: -0.02em) to feel authoritative.
*   **Headline (sm):** Used for section titles. Pair these with `on-surface-variant` (#cbc3d7) to differentiate from data.
*   **Title (md/sm):** For card headers. Use `title-sm` with `font-weight: 600`.
*   **Label (md/sm):** Specifically for micro-data (e.g., "vs last week"). Use `secondary_fixed_dim` (#4ae176) for positive trends and `tertiary_fixed_dim` (#ffb95f) for warnings.

---

## 4. Elevation & Depth

### Tonal Layering
Avoid shadows for standard layout components. Depth is achieved by "stacking":
- **Level 0:** `surface_container_lowest` (Background elements)
- **Level 1:** `surface_container` (The main content area)
- **Level 2:** `surface_container_high` (KPI Cards)
- **Level 3:** `surface_bright` (Active hover states)

### Ambient Shadows
When a "floating" effect is required for high-priority alerts:
- **Shadow:** `0 24px 48px -12px rgba(0, 0, 0, 0.5)`.
- **Coloring:** The shadow should not be grey; it should be a deep tint of the `primary_container` (#a078ff) at 5% opacity to simulate light refracting through the purple primary accents.

### The "Ghost Border" Fallback
If accessibility requires a container boundary, use the **Ghost Border**:
- **Token:** `outline-variant` (#494454).
- **Opacity:** 20%.
- **Style:** 1px solid. (Never 100% opaque).

---

## 5. Components

### KPI Cards
- **Structure:** No borders. Use `surface_container_high`.
- **Corner Radius:** `lg` (1rem / 16px) for the outer container, `md` (12px) for internal elements.
- **Metrics:** `display-sm` for the primary value.
- **Trend:** Small SVG sparkline using `secondary` (#4ae176) with a subtle 4px blur "glow" under the stroke.

### Status Badges (The Pulse)
- **Design:** Pill-shaped (`full` roundedness).
- **Interaction:** For "Live" agents, add a 2px center dot with a `scale` animation (pulse) using the `on_secondary` color.
- **Colors:** Use `secondary_container` for "Active" and `error_container` for "Offline."

### Data Tables
- **Rule:** Forbid divider lines.
- **Row Styling:** Use alternating `surface_container_low` and `surface_container` for zebra striping.
- **Header:** `label-md` in all-caps with `0.05em` letter spacing for an editorial look.

### Node-Link Feedback Maps
- **Nodes:** `surface_bright` circles with `primary` (#d0bcff) 1px "Ghost Borders."
- **Links:** Curvature-based SVG paths. Use `outline_variant` at 30% opacity. For "Hot Paths," increase opacity to 100% and add a `primary` glow.

### Input Fields
- **Base:** `surface_container_highest` (#33343b).
- **Active State:** Change background to `surface_bright` and add a bottom-only 2px accent in `primary`. Do not outline the entire box.

---

## 6. Do’s and Don'ts

### Do:
- **Use Vertical Space:** Separate KPI groups with `16` (3.5rem) spacing rather than lines.
- **Layer for Importance:** Place the most critical "Agent at Risk" alerts on the `surface_bright` tier to make them visually pop.
- **Subtle Motion:** Use 200ms "Ease-Out" transitions for hover states on cards to mimic a high-end physical interface.

### Don't:
- **Don't use pure white (#FFFFFF):** Always use `on_surface` (#e2e2eb) to reduce eye strain in the dark environment.
- **Don't use high-contrast borders:** They break the "Kinetic Observatory" flow. Trust the tonal shifts.
- **Don't crowd the display:** If a view feels dense, increase the internal padding of cards using the `5` (1.1rem) spacing token.
- **Don't use standard drop shadows:** They feel like 2010-era web design. Stick to tonal layering and ambient glows.