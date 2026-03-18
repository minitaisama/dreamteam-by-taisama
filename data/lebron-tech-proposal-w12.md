# Lebron (Dev) — W12 Technical Improvement Proposal (Phase 2+3 Self‑Review)

**Context:** CEO rated Phase 2+3 a **2/10**. This document is the honest post‑mortem + concrete technical plan to reach product quality for a Pokémon‑style pixel overworld + credible “agent activity” UI.

---

## 0) What I built vs. what was needed

### What I built (current)
- A “pixel scene” made of **AI-generated 1024px images** shrunk to ~64px and placed on a dark background.
- A few sprite characters “animating” (but the assets aren’t true pixel sprites and the rendering pipeline isn’t pixel‑perfect).
- Agent status cards.
- Activity feed (chat-style) with mostly **demo data**.
- Live polling that updates UI state.

### What should have been built
- A **real 2D overworld renderer** (tilemap-based) that looks like classic Pokémon:
  - **Tilemaps** (grass, paths, water, buildings) composed from a real tileset.
  - **Multiple layers** (below/player/above) so sprites can go behind trees/buildings.
  - **Collision + interactables** (NPCs, signs, triggers).
  - **Pixel-perfect rendering** (nearest-neighbor / no smoothing).
- A real “agent activity feed” backed by **actual events** (tool calls, messages, state transitions), not placeholder text.

---

## 1) Root causes (no excuses)

1. **I treated “pixel art” as an aesthetic filter** instead of a production constraint.
   - Resizing HD art down is not pixel art; it destroys readability and creates muddy silhouettes.

2. **No tilemap system.**
   - Without a tilemap, you can’t get a believable overworld: paths, edges, layering, collisions, and consistent scale all collapse.

3. **No real sprite pipeline.**
   - Proper Pokémon-like sprites are **small**, consistent, and animated via sprite sheets or texture atlases.

4. **The activity feed was disconnected from the product truth.**
   - I shipped a UI component without wiring it to real events. It looked like a mock, because it was.

---

## 2) Research: open-source Pokémon-style web games (GitHub)

Because `web_search` is not usable in this environment (Gemini key missing / quota), I switched to **direct GitHub browsing + raw file fetching** and extracted concrete implementation patterns.

### A) `iszard/pokie_world` (Phaser 3 + Tiled tilemap + atlas sprites)
Repo: https://github.com/iszard/pokie_world

Key techniques seen in `src/scenes/MarioGame.ts`:
- **Tilemap built in Tiled** and loaded as JSON:
  - `this.load.tilemapTiledJSON("map", "../assets/tilemaps/tuxemon-town.json")`
- **Tileset** loaded separately:
  - `this.load.image("tiles", "../assets/tilesets/tuxmon-sample-32px-extruded.png")`
- **Multiple layers**:
  - `Below Player`, `World`, `Above Player`
  - `worldLayer.setCollisionByProperty({ collides: true })`
  - `aboveLayer.setDepth(10)` (classic “tree-top layer” / buildings-in-front)
- **Spawn point** placed in Tiled object layer:
  - `map.findObject("Objects", obj => obj.name === "Spawn Point")`
- **Sprite animation via atlas frames**:
  - `this.load.atlas("atlas", "atlas.png", "atlas.json")`
  - `anims.generateFrameNames` with prefixes like `misa-front-walk.000`…`003`
- **Camera follow**:
  - `camera.startFollow(this.player)` and bounds to the tilemap

Why this matters:
- This is *exactly* the missing system: **tilemap + layers + collisions + camera + proper sprite animation**.

### B) `divakarmanivel/pokemondivision` (multi-canvas renderer + manual tile culling)
Repo: https://github.com/divakarmanivel/pokemondivision

Key techniques from `index.html`:
- Uses **multiple stacked canvases**:
  - `bgcanvas`, `canvas`, `mapcanvas`, `menucanvas`, `interactioncanvas`, `touchcanvas`
  - This matches a game UI need: separate render targets for world, minimap, menus, overlays.

Key techniques from `js/renderer.js`:
- **Camera window culling** (render only visible tiles):
  - Computes `startCol/endCol/startRow/endRow` from `camX/camY` and tileSize
- **Layered draw order**:
  - path layer (grass)
  - obstacle layer (bush)
  - NPC layer
  - Pokémon layer
  - then player sprite
- **Sprite sheet animation**:
  - `frameIndex`, `ticksPerFrame`, `numberOfFrames`
  - selects sprite row based on direction
- **Interaction overlay logic** (press A to interact with tile in front)

Key techniques from `js/init.js`:
- Establishes global `tileSize = 32` and canvas sizing.
- Creates sprite databases by slicing a sprite sheet into per-frame images via an offscreen canvas.

Why this matters:
- Shows a workable approach even without Phaser: **camera-based tile culling + strict draw order + multi-canvas UI layers**.

---

## 3) Pixel art + web rendering best practices (what we must do)

### A) Use real pixel assets (not downscaled AI art)
- Start with true pixel sprites/tiles made at the target resolution (e.g., **16×16 or 32×32 tiles**, character sprites ~32×32 or 32×48).
- Use a consistent palette + outline style.
- Avoid “shrinking” large images into pixel size—silhouette and contrast die.

**Tools:** Aseprite / LibreSprite / Piskel for sprites; Tiled for maps; TexturePacker (or free atlas tools) for packing.

### B) Pixel-perfect scaling (critical)

**Canvas**
- Draw your game at a **native low resolution**, then scale up by an integer factor.
- Set:
  - `ctx.imageSmoothingEnabled = false`
  - In Phaser: `pixelArt: true` + `roundPixels: true` (or equivalent settings)

**CSS / DOM**
- When using `<img>` / background images:
  - `image-rendering: pixelated;`
  - avoid fractional scaling; keep integer scale.

### C) Tilemaps for backgrounds (Pokémon overworld is a tile game)
- Use **tilesets** for grass, paths, water edges, trees, fences, roofs.
- Build maps in **Tiled**:
  - multiple layers: `Below Player`, `World`, `Above Player`
  - set `collides=true` property on collision tiles
  - object layers for NPC spawns, triggers, doors

### D) Texture bleeding fixes (tile seams)
- Use **extruded tilesets** (1–2px padding around each tile) to prevent sampling bleeding.
  - Example from `pokie_world`: `tuxmon-sample-32px-extruded.png`

### E) Sprite animation that looks good
- Animate via **sprite sheets or atlases**, not individual PNGs.
- Use 3–4 frames per direction at 8–12 FPS.
- Use distinct idle frames per facing direction.
- Ensure consistent pivot/offset so the character doesn’t jitter.

---

## 4) Recommendation: CSS-only vs Canvas vs Framework

### CSS-only (NOT recommended for overworld)
- Fine for UI chrome, not fine for a tilemap world.
- DOM overhead becomes painful: many tiles/sprites = too many elements.

### Raw Canvas (OK if we stay simple)
- Works well if we implement:
  - tile culling
  - sprite animation
  - input handling
  - collisions
  - camera
- `pokemondivision` shows this approach.

### Phaser 3 (Recommended)
- Best balance for a *product-quality* Pokémon-like overworld.
- Built-in:
  - tilemaps (Tiled JSON)
  - cameras
  - arcade physics (colliders)
  - animations / texture atlases
  - pixelArt rendering options
- `pokie_world` is already a near-template for what we need.

**Decision:** Use **Phaser 3 + Tiled** for the overworld rendering, and standard React/Next UI for panels/feed.

---

## 5) Asset checklist (what art we actually need)

### Overworld tileset (16×16 or 32×32)
- Grass variants
- Path tiles + corners + transitions
- Water + shore transitions
- Trees (base + canopy) so canopy can be on Above layer
- Rocks / cliffs
- House/building tiles
- Fences / signposts

### Character sprites (player + NPCs)
- 4-direction walk cycles:
  - front/back/left/right
  - 3–4 frames each
- Idle frames per direction

### UI pixel assets
- Dialog box frame (9-slice style if possible)
- Menu panel frame
- Icons (bag, pokedex, settings)
- Cursor/selection arrow

### Effects
- Shadow under characters
- Optional: grass rustle animation tile

---

## 6) Concrete implementation plan (phased)

### Phase A — Replace the “fake pixel scene” with a real tilemap prototype (1–2 days)
1. Add Phaser 3 scene:
   - `preload`: load tileset PNG + Tiled JSON map + atlas
   - `create`: build layers (Below/World/Above)
   - `setCollisionByProperty({ collides: true })`
   - spawn player from Tiled object layer
2. Enable pixel settings:
   - disable smoothing / enable pixel art rendering
   - integer scaling (native resolution → scaled up)
3. Add camera follow + bounds.

**Acceptance:** Scene looks like a real overworld; player can walk; collisions prevent walking through walls/trees.

### Phase B — Sprite pipeline + animation polish (1 day)
1. Replace any AI imagery with real sprite sheets.
2. Implement directional animations + idle selection (like `pokie_world`).
3. Tune speed, frame rate, and sprite hitbox/offset.

**Acceptance:** Movement feels stable; no blur; no jitter; sprite reads clearly at typical viewing distance.

### Phase C — Map authoring workflow (1 day)
1. Standardize on Tiled:
   - layer naming convention
   - collision property
   - object layer schemas (spawn points, NPCs, triggers)
2. Add a second map with a different palette (prove we can scale content).

**Acceptance:** New map can be produced without code changes (only Tiled export + assets).

### Phase D — Real activity feed (1–2 days)
1. Define event types (minimum viable):
   - `agent.status_changed`
   - `agent.tool_call`
   - `agent.message`
   - `system.error`
2. Wire backend → UI via SSE/WebSocket (not polling) if feasible.
3. Render feed items with real payload:
   - tool name, duration, success/failure
   - message excerpts
   - links to logs

**Acceptance:** Feed shows real events driven by actual agent runtime, not demo JSON.

---

## 7) What I would change immediately in the existing codebase

- Delete/replace the “AI pixel scene” assets.
- Introduce a single “GameRenderer” abstraction:
  - either Phaser-based (preferred)
  - or canvas-based, but with tilemap support
- Make “activity feed” read from a real event stream (even if the first version is just server-emitted events).

---

## 8) Quality bar (what must be true for this to feel like a Pokémon game)

1. **Pixel-perfect:** no smoothing, no fractional scaling, no blurry sprites.
2. **Tilemap world:** consistent tile size, real edges/transitions, layered depth.
3. **Animation:** 4-direction walk cycles; idle frames; correct facing.
4. **UI:** dialog/menu overlays that look like the game (not generic cards).
5. **Authentic activity:** feed reflects real agent actions with timestamps and outcomes.

---

## Appendix — Reference snippets (from repos)

### Tilemap + layers + collisions + camera follow (Phaser)
From `iszard/pokie_world`:
- Load Tiled JSON: `load.tilemapTiledJSON(...)`
- `createLayer("Below Player"|"World"|"Above Player")`
- `worldLayer.setCollisionByProperty({ collides: true })`
- `camera.startFollow(player)`

### Multi-canvas UI stacking (vanilla)
From `divakarmanivel/pokemondivision`:
- multiple canvases for world/menu/interaction/minimap/touch UI

---

## Closing (accountability)

The 2/10 rating is fair: I delivered a prototype aesthetic rather than a Pokémon-grade overworld system, and the activity feed was not connected to real events. The plan above replaces the foundation (tilemap + sprite pipeline + event-driven feed) so subsequent UI polish actually has something real to sit on.
