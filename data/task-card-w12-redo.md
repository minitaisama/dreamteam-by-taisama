# W12 Emergency Redo — Dreamteam At Work (Quality bar: Product, not prototype)

Owner: Coach (PM)
Status: **FROZEN TASK CARD** (do not expand scope without approval)
Priority order: **1) Pixel Scene (must feel like Pokémon GBA), 2) Activity Feed w/ real interactions, 3) Overall polish + empty states**

## Context / Why this exists
CEO audit scored the dashboard **2/10**. Major failures:
1) Pixel scene does not look like a real Pokémon game (static sprites pasted on dark background)
2) Activity feed has **no real data** (no agent-to-agent interaction)
3) Overall polish is prototype-level

This redo is a **hard reset** on execution quality.

---

## A) Pixel Scene Redesign (P0 — must be fixed first)

### Goal
The “at work” scene should feel like **you’re playing a Game Boy Advance Pokémon game** inside the dashboard.

### Non-negotiables (acceptance criteria)
- **Real pixel-art environment**: tiled background (grass/paths/trees/water/etc). No flat dark div.
- **Correct sprite pipeline**:
  - Use sprites at native pixel sizes (e.g., character ~32x48; tiles 16x16) then scale by an **integer** factor.
  - No AI 1024px images scaled down to 64px.
- **Animation**:
  - Player + NPC have walking idle cycles (>= 4 frames), directional (up/down/left/right).
  - Movement is tile-based or grid-feeling (Pokémon-like), not smooth “web page scroll”.
- **Camera + composition**:
  - Camera follows player, scene framed like a handheld screen.
  - Pixel-perfect rendering (no blur).
- **Pokémon-style UI overlay**:
  - Bottom dialog box with typewriter text.
  - Optional: small status plates (name/level) or a mini menu panel that matches Pokémon style.

### Recommended technical approach (research-backed)
**Use Phaser 3 embedded in the dashboard** (Canvas/WebGL) for the pixel scene.
Why:
- Phaser handles **tilemaps, sprite animations, collisions, camera follow**, and pixel scaling cleanly.
- This is the fastest route to a believable game feel.

Repo references:
- `konato-debug/pokemon-phaser` (Phaser 3) — shows GBA-like battle assets and player spritesheet with `frameWidth: 32, frameHeight: 48`.
  - Repo: https://github.com/konato-debug/pokemon-phaser
  - Demo: https://konato-debug.github.io/pokemon-phaser/
- `boxerbomb/PokemonClone` (PhaserJS) — uses **Tiled JSON** for map data + in-game menu.
  - Repo: https://github.com/boxerbomb/PokemonClone
- `jvnm-dev/pokemon-react-phaser` — shows React+Phaser embedding (matches our stack).
  - Repo: https://github.com/jvnm-dev/pokemon-react-phaser

Sprite/animation references (if we use CSS sprites anywhere):
- Sprite-sheet animation via `steps(n)` + `background-position`:
  - https://blog.teamtreehouse.com/css-sprite-sheet-animations-steps
  - https://leanrada.com/notes/css-sprite-sheets/

### Implementation checklist
1) **Replace current scene container** with a Phaser canvas component (React wrapper).
2) Add a small **Tiled map** (starter town square / office-lab hybrid): grass, path, trees, building edge.
3) Add 3–5 character sprites (PM/CEO/Dev/QA) with:
   - properly-sized pixel spritesheets
   - walk animations + idle
4) Enforce pixel crispness:
   - `pixelArt: true` (Phaser)
   - ensure integer scaling and no smoothing
5) Add Pokémon-style UI overlay:
   - dialog box with typewriter effect + minimal menu prompt

### Definition of Done (DoD)
A CEO can load the page and instantly say: “This looks like Pokémon GBA.”
- Scene has tilemap depth, not a flat backdrop.
- Sprites are pixel-perfect, animated, and proportionate.
- UI overlay is consistent with Pokémon style.

---

## B) Activity Feed with Real Content (P1)

### Goal
Activity feed must show **real-looking, continuous agent interactions** (CEO/PM/Dev/QA), not empty or placeholder.

### Non-negotiables (acceptance criteria)
- Feed shows a **chronological conversation** with:
  - agent avatar
  - name
  - role badge (CEO / PM / Dev / QA)
  - timestamp
  - message body
- Content includes:
  - CEO assigning tasks
  - PM freezing task cards
  - Dev reporting progress + links/commits
  - QA filing bugs + reproduction steps
  - back-and-forth (questions, clarifications, blockers)
- **No empty state** on load. If backend is down, show a polished fallback dataset with a clear label (“Offline demo feed”).
- Chat UI quality: Discord/Slack-like bubbles, subtle separators, good typography, custom scrollbar.

### Implementation approach
- Introduce an **event model** (append-only) for “work events”:
  - `TaskAssigned`, `TaskFrozen`, `DevUpdate`, `PRLinked`, `BugFiled`, `BugFixed`, `Deploy`, etc.
- Render these events into a chat timeline.
- Seed initial data (at least 50 messages) with realistic tone, technical details, and cross-references.

### UI references
- Dark chat inspiration:
  - https://dribbble.com/search/chat-dark
  - https://muz.li/inspiration/dark-mode/
- Dark mode implementation patterns:
  - https://css-tricks.com/a-complete-guide-to-dark-mode-on-the-web/

### Definition of Done (DoD)
On first load, the feed looks alive and credible, and it tells the story of a team building.

---

## C) Overall Quality Bar / Polish (P2)

### Goal
Ship a **product-quality** dashboard.

### Non-negotiables (acceptance criteria)
- Typography scale + spacing system (8px grid), consistent radii/shadows.
- No placeholder copy; no broken “Loading…” states.
- Empty states are designed (illustration or pixel icon + clear CTA).
- Performance:
  - pixel scene loads fast (asset preloading + progress indicator)
  - no jank scrolling in feed
- Responsive layout: works on laptop widths; doesn’t collapse into chaos.

### Definition of Done (DoD)
CEO can record a 30s walkthrough and it looks like a polished product demo.

---

## Deliverables
- Pixel scene v2 (Phaser tilemap + animated sprites + Pokémon UI overlay)
- Activity feed with real interactions + seeded dataset + event model
- Visual polish pass (type, spacing, empty states, loading states)

## Evidence / Current-state screenshot
- Before screenshot captured at:
  - `/Users/agent0/.openclaw/media/browser/5994e003-61c2-4fe4-a356-8d17d1639f6a.jpg`

## Stop conditions (anti-scope-creep)
- Do **not** add extra game modes, battles, multiplayer, or crafting.
- Do **not** attempt to “AI-generate sprites” as the primary asset strategy.
- Must hit Pokémon-like feel first; features second.
