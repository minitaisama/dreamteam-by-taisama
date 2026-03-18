# W12 Failure Analysis — Why the dashboard shipped at 2/10

Owner: Coach (PM)

## Executive summary
We shipped an interface that *resembled* the idea (Pokémon scene + live feed) but not the **craft**. It failed on three axes:
1) **Asset pipeline**: incorrect art direction + wrong sprite sizes (AI hi-res downscaled) killed pixel authenticity.
2) **Data pipeline**: the “live feed” did not have a reliable event source or seeded fallback; it rendered empty.
3) **Quality gates**: no acceptance criteria tied to “feels like Pokémon” / “looks like product,” so we shipped a prototype.

---

## 1) Why the pixel scene looked so bad
**Root causes**
- **Wrong source assets**: AI-generated 1024px images scaled down → muddy, inconsistent outlines, not pixel art.
- **No pixel rendering rules**: likely no `image-rendering: pixelated` / no integer scaling / possible smoothing.
- **No environment composition**: lacked a tilemap background (grass/paths/trees). Scene read as “sprites on a div”.
- **No animation / game loop**: static poses with no walk cycles or idle frames = zero game feel.

**What should have happened**
- Pick a reference implementation early (Phaser + Tiled, or CSS sprite pipeline).
- Lock a **sprite/tile spec** (tile 16x16; characters ~32x48; scale 2x/3x/4x).
- Validate with a 10-minute “screenshot test”: if it doesn’t look like GBA Pokémon at a glance, stop and rework.

---

## 2) Why the activity feed was empty
**Root causes**
- “Live feed” treated as a UI component, not a **product system**.
  - No explicit event schema (who, what, when, link to which task).
  - No seeded data for first load.
  - No offline fallback when backend/stream isn’t available.
- Missing integration contract between agents and UI:
  - No place where CEO/PM/Dev/QA actions are recorded as events.
  - Even a simulated feed wasn’t authored to feel real.

**What should have happened**
- Define an append-only event model (TaskAssigned/DevUpdate/BugFiled/etc).
- Implement: (a) real stream if available, (b) deterministic seed dataset fallback.
- Treat “empty feed” as a P0 bug (never acceptable in demo/product).

---

## 3) Process failures (how we shipped 2/10)
- **No frozen task card with acceptance criteria**.
  - The work likely focused on “getting something on screen” rather than “matching a known quality target.”
- **No reference-driven build**.
  - We didn’t anchor on real Pokémon-like web game repos early enough.
- **No QA gate**.
  - No screenshot-based review pass.
  - No “CEO eyeball test” before ship.
- **Over-indexed on novelty (AI art) vs craft (pixel pipeline)**.

---

## Corrective actions for the redo (must be enforced)
1) **Freeze a task card** with DoD defined as: “looks like Pokémon GBA,” not “has sprites.”
2) **Use a real pixel/game pipeline** (Phaser + Tiled recommended).
3) **Build the scene first**. If the pixel scene is not credible, nothing else matters.
4) **Activity feed must never be empty**: ship with seeded real-looking interactions + event schema.
5) Add a simple quality gate:
   - 1) screenshot scene
   - 2) screenshot feed
   - 3) 30s walkthrough
   - If any feels prototype-level, do not ship.
