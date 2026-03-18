# Research notes — Dreamteam At Work redo (W12)

> Goal: make the dashboard feel like an actual Pokémon GBA-style game scene + a real “work stream” chat with credible interactions.

## 1) Pixel-art rendering on the web (CSS vs Canvas)

### Key rendering rules (regardless of tech)
- **Never scale with smoothing**: ensure pixel-perfect scaling.
  - CSS: `image-rendering: pixelated; image-rendering: crisp-edges;`
  - Canvas: `ctx.imageSmoothingEnabled = false;` and scale by integer factors.
- **Use correct native sprite sizes** (typical: 16x16 tiles; characters 32x48 in GBA-style games). Avoid downscaling 1024px AI images.

### Sprite-sheet animation in CSS
- CSS sprite-sheet animations typically use **`@keyframes` on `background-position`** and **`steps(n)`** to jump frame-by-frame (no tweening).
- Good references:
  - Team Treehouse: CSS sprite sheet animations with `steps()` https://blog.teamtreehouse.com/css-sprite-sheet-animations-steps
  - Lean Rada notes: CSS sprite sheets https://leanrada.com/notes/css-sprite-sheets/
  - Muffinman: CSS-only sprite animations https://muffinman.io/blog/css-only-sprite-animations/

### Recommendation for this product
For a Pokémon-like scene **inside a dashboard**, **Phaser 3 (Canvas/WebGL)** is the fastest way to get “real game feel” without building a renderer.
- It gives:
  - tilemaps (Tiled JSON), camera follow, depth sorting, collisions
  - sprite animations (built-in) and crisp pixel scaling
  - easy UI overlays (or keep UI in React over the canvas)

## 2) Reference repos (real Pokémon-like web games)

### Repo A: konato-debug/pokemon-phaser
- Repo: https://github.com/konato-debug/pokemon-phaser
- Live: https://konato-debug.github.io/pokemon-phaser/
- Tech: **Phaser 3**
- Notes:
  - Uses **spritesheets** with explicit frame sizes (e.g. `player.png` with `frameWidth: 32, frameHeight: 48`) and loads tile/grass assets.
  - Implements multiple scenes: main scene, battle scene, menu scenes.
  - UI assets include battle bars/backgrounds (GBA-like composition).

### Repo B: boxerbomb/PokemonClone
- Repo: https://github.com/boxerbomb/PokemonClone
- Tech: **PhaserJS**
- Notes:
  - Uses **Tiled** for tilemaps and reads map data from JSON.
  - Mentions **slick-ui** for in-game menu.
  - Tile sizing: the README references 64px tiles for their map; but the key takeaway is the pipeline: **Tiled JSON + engine**.

### Repo C (optional 3rd): jvnm-dev/pokemon-react-phaser
- Repo: https://github.com/jvnm-dev/pokemon-react-phaser
- Demo link from README: https://jvnm-dev.github.io/
- Tech: **React + Vite + Phaser**
- Notes:
  - This is very close to our stack direction: React app embedding Phaser.
  - Mentions tilesets/sprites source (pokecommunity) and in-game menu (Escape).

## 3) Pokémon UI design pointers
- Pokémon battle UI has a **strong structure**:
  - Bottom dialog/message box (typewriter text)
  - Fight/Pokémon/Bag/Run menu
  - Health bars with clear color states (green/yellow/red)
- Useful UI reference (style breakdown): https://capx.fandom.com/wiki/Battle_UI

## 4) Dark chat UI references (for activity feed)
- Inspiration collections:
  - Dribbble: https://dribbble.com/search/chat-dark
  - Muzli dark mode inspiration: https://muz.li/inspiration/dark-mode/
- Implementation guidance:
  - CSS-Tricks guide to dark mode: https://css-tricks.com/a-complete-guide-to-dark-mode-on-the-web/

## 5) Current dashboard evidence (before)
- Screenshot captured (full page):
  - `/Users/agent0/.openclaw/media/browser/5994e003-61c2-4fe4-a356-8d17d1639f6a.jpg`
