# W12 Redo v2 — Dreamteam At Work (Quality Target: 8/10)

Owner: Coach (PM) → CEO (MiniSama) final approval
Status: **FROZEN** — do not expand scope
Mode: **Build** (CEO → Coach freeze → Lebron → Curry → CEO verify)

---

## Requirements from Taisama
1. Pixel board is IMPORTANT — must look like a real Pokemon game
2. Keep the retro dashboard — accessible via tab
3. Complete version, not prototype
4. Future: interactive pixel scene (plan for it, don't build yet)
5. Quality target: 8/10

---

## Architecture

```
Dashboard (single HTML page)
├── Tab Nav: "🎮 At Work" | "📊 Retro"
├── Tab: At Work (live view)
│   ├── Pixel Scene (Phaser 3 canvas, GBA-quality)
│   │   ├── Tilemap overworld (grass, path, trees, building)
│   │   ├── 4 animated character sprites (CEO, PM, Dev, QA)
│   │   ├── Camera follow, pixel-perfect rendering
│   │   └── Pokemon-style dialog overlay
│   ├── Agent Status Strip (4 cards: name, role, status dot, current task)
│   └── Activity Feed (chat-style, 50+ seeded messages)
│       ├── Agent avatars, role badges, timestamps
│       ├── Realistic back-and-forth (task assign, progress, bugs, deploy)
│       ├── Discord/Slack-quality dark theme
│       └── Live polling via Gist (fallback: seeded demo data)
└── Tab: Retro (existing weekly board — PRESERVED)
    ├── Week selector navigation
    ├── Agent retro cards (CEO, PM, Dev, QA)
    ├── Velocity Trend + Quality Score charts
    └── Action items list
```

---

## Phase A: Pixel Scene (P0 — highest priority)

### Skills available for Lebron
- `phaser` skill — Phaser 3 game dev patterns, scene architecture, TypeScript
- `phaser-gamedev` skill — Phaser-specific game dev guide
- `game-assets` skill — pixel art sprite creation, sprite sheets, palettes
- `pixel-art-animator` skill — pixel art animation

### Technical approach
- **Phaser 3** embedded in vanilla HTML (no React/Next)
- **Tiled JSON tilemap** for overworld (grass, paths, trees, building edge)
- **Real pixel art sprites** — code-generated pixel matrices (from game-assets skill), NOT AI-generated images scaled down
- **Sprite sheets**: 4-direction walk cycles (front/back/left/right), 3-4 frames each, idle frames
- **Pixel-perfect**: `pixelArt: true`, integer scaling, no smoothing
- **Camera follow**: player character, bounds to tilemap

### Scene composition
- Small office/lab tilemap (~20x15 tiles):
  - Grass surrounding, path leading to building
  - Building with door (the "Dreamteam HQ")
  - Trees, flowers, signpost
  - Interior: desks, computers (tiles)
- Characters positioned at desks or walking around
- CEO (trainer) near the door, PM at a desk, Dev at computer, QA at testing station

### Character sprites (32x32 native, 2x or 3x scale)
- CEO/MiniSama: dark hair, glasses, purple jacket
- Coach/PM: blue outfit, clipboard
- Lebron/Dev: green outfit, headband
- Curry/QA: yellow outfit, magnifying glass

### Pokemon-style UI overlay
- Bottom dialog box (pixel font, typewriter text)
- Status bars showing agent mood/status
- Optional: menu prompt with arrow cursor

### Acceptance criteria (from Curry's corrected audit)
1. All sprites share same pixel grid size — no mismatched scales
2. Hard pixel edges only — zero anti-aliasing on sprites
3. Tilemap has depth (multiple layers: below player, world, above player)
4. Character walk cycles: 4-direction, ≥3 frames each
5. Idle characters have breathing/bobbing animation
6. Scene fills at least 240x160 viewport (GBA resolution) scaled up
7. **GBA Test**: Show to a Pokemon player. If they say "that doesn't look real," FAIL.
8. No AI-generated art — all sprites created via pixel matrices or proper pixel tools

### Reference repos
- `iszard/pokie_world` (Phaser 3 + Tiled) — exact template
- `divakarmanivel/pokemondivision` (vanilla JS, multi-canvas)
- `konato-debug/pokemon-phaser` (Phaser 3, GBA assets)

---

## Phase B: Activity Feed (P1)

### Content requirements — REAL DATA ONLY
- **Real agent reports** from OpenClaw subagent completions
- **Real chat messages** between agents and CEO in the gateway
- NO fabricated/templated messages
- Message types: task completions, progress reports, QA findings, deploy confirmations
- References real artifacts (file paths, gist URLs, commit hashes) from actual work

### Data source approach
1. **Live**: OpenClaw writes agent events to Gist live.json feed array via update-live.sh
2. **Seed**: Extract REAL messages from past session history (today's W12 work):
   - Coach's research report (real completion event)
   - Lebron's Phase 1 completion (real)
   - Lebron's Phase 2+3 completion (real)
   - Lebron's fix completion (real)
   - Curry's first audit (real — note it was wrong)
   - Curry's corrected audit (real)
   - Lebron's self-review (real)
3. **Format each real event** into feed entry: agent name, role, timestamp (actual), summary of what they reported
4. **Future**: As agents complete work, events flow into live.json automatically

### UI requirements
- Discord/Slack-quality dark theme chat
- Agent avatars (small pixel), name, role badge, timestamp
- Chat bubbles: agent messages left-aligned, CEO messages right-aligned (or vice versa)
- Typing indicator for active agents
- Custom scrollbar
- Auto-scroll to latest
- "Show more" loads older messages (actually works)

### Data source
- Primary: Gist live.json (polling 30s)
- Fallback: Seeded demo-live.json with 50+ messages
- Never empty — "Offline demo" label if using fallback

### Acceptance criteria
1. ≥10 messages visible on first load from ≥2 agents
2. Mix of message types (not just task assignments)
3. Chronological story when read top-to-bottom
4. "Show more" actually reveals more messages
5. **Discord Test**: Show to Discord user. If they say "this looks like a demo," FAIL.

---

## Phase C: Tab System + Retro Preservation (P1)

### Requirements
- Tab nav at top: "🎮 At Work" | "📊 Retro"
- "At Work" tab: pixel scene + agent strip + activity feed
- "Retro" tab: FULL existing retro dashboard (week selector, agent cards, charts, action items)
- Retro tab content must be IDENTICAL to what was there before the redo
- Default tab: "At Work"
- Tab switching is instant (no reload)

---

## Phase D: Polish (P2)

### Typography
- Type scale: h1→h2→h3→body→small (consistent, max 6 sizes)
- Body text ≥14px, line-height 1.5
- Pixel scene uses pixel font (Google Font: "Press Start 2P" or similar)

### Spacing
- 8px grid system
- Consistent card padding (16-24px)
- Generous white space

### States
- Loading states with spinner/skeleton (never stuck "loading...")
- Error states with retry
- Empty states designed (pixel icon + message)

### Performance
- Phaser canvas loads with progress bar
- Feed scroll is smooth
- Tab switching instant (content pre-rendered)

---

## Phase E: Curry Design Audit (mandatory before ship)

### Audit method (CORRECTED — no more "elements exist" checks)
1. Use `ui-design-review` skill (10-dimension framework)
2. Take screenshots at 3 viewports (375px, 768px, 1280px)
3. Run pixel scene through "GBA Test" — compare to real Pokemon FireRed screenshot
4. Run activity feed through "Discord Test"
5. Score each dimension honestly
6. Overall ≥7/10 to recommend SHIP

### CEO independent verification
After Curry recommends SHIP, CEO (MiniSama) will:
1. Browse the site personally
2. Use `ui-design-review` skill independently
3. Compare pixel scene to real Pokemon screenshot
4. Only approve if CEO rates ≥8/10

---

## Skills installed for this task
- `phaser` — Phaser 3 game development patterns
- `phaser-gamedev` — Phaser-specific guide
- `game-assets` — Pixel art sprite creation (code-generated pixel matrices)
- `pixel-art-animator` — Pixel art animation
- `ui-design-review` — 10-dimension visual design audit
- `design-audit` — Apple philosophy design review
- `frontend-design` — Production-grade frontend design

---

## Anti-scope
- No battles, no combat system
- No multiplayer
- No crafting or inventory
- No mobile app — web dashboard only
- No framework migration (stay vanilla HTML/CSS/JS + Phaser CDN)
- Interactivity is "nice to have" for future — focus on visual quality first

---

## DoD (Definition of Done)
1. Pixel scene passes GBA Test
2. Activity feed has 50+ messages and passes Discord Test
3. Retro tab preserved exactly as before
4. Tab system works (At Work / Retro)
5. Agent status strip shows live data
6. Responsive at 375px, 768px, 1280px
7. Curry audit ≥7/10
8. CEO rates ≥8/10
9. Deployed to https://dreamteam20.vercel.app
10. Git committed and pushed with clean history
