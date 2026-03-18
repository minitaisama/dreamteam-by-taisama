/* Dreamteam At Work — Phaser Pixel Scene (Phase A)
   - No build tooling (CDN Phaser)
   - All art is code-generated pixel matrices (no AI images)
   - 20x15 tiles, 32px tile size (16px base @2x)
   - 4 characters + idle / walking states driven by window.DreamteamLive

   Polish pass:
   - Muted GBA-ish palette
   - Pixel-perfect dialog (no rounded corners)
   - 2-frame-ish idle bob (1px step, ~2.6s loop)
   - Separate oval shadow sprites under characters
*/

(function () {
  if (!window.Phaser) {
    console.warn('[phaser-atwork] Phaser not found on window. Did you include the CDN script?');
    return;
  }

  // ---------------- Pixel Renderer (inline; vanilla) ----------------
  function renderPixelArt(scene, pixels, palette, key, scale = 2) {
    if (scene.textures.exists(key)) return;

    const h = pixels.length;
    const w = pixels[0].length;
    const canvas = document.createElement('canvas');
    canvas.width = w * scale;
    canvas.height = h * scale;
    const ctx = canvas.getContext('2d');

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const idx = pixels[y][x];
        if (idx === 0 || palette[idx] == null) continue;
        const color = palette[idx] >>> 0;
        const r = (color >> 16) & 0xff;
        const g = (color >> 8) & 0xff;
        const b = color & 0xff;
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.fillRect(x * scale, y * scale, scale, scale);
      }
    }

    scene.textures.addCanvas(key, canvas);
  }

  function renderSpriteSheet(scene, frames, palette, key, scale = 2) {
    if (scene.textures.exists(key)) return;

    const h = frames[0].length;
    const w = frames[0][0].length;
    const frameW = w * scale;
    const frameH = h * scale;

    const canvas = document.createElement('canvas');
    canvas.width = frameW * frames.length;
    canvas.height = frameH;
    const ctx = canvas.getContext('2d');

    frames.forEach((pixels, fi) => {
      const offsetX = fi * frameW;
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const idx = pixels[y][x];
          if (idx === 0 || palette[idx] == null) continue;
          const color = palette[idx] >>> 0;
          const r = (color >> 16) & 0xff;
          const g = (color >> 8) & 0xff;
          const b = color & 0xff;
          ctx.fillStyle = `rgb(${r},${g},${b})`;
          ctx.fillRect(offsetX + x * scale, y * scale, scale, scale);
        }
      }
    });

    scene.textures.addSpriteSheet(key, canvas, {
      frameWidth: frameW,
      frameHeight: frameH
    });
  }

  // ---------------- Palettes ----------------
  // Shared palette layout (sparse indexes are ok; keep 0 transparent)
  function basePalette() {
    const p = new Array(64).fill(null);
    p[0] = null;

    // universal inks (muted, warm)
    p[1] = 0x1c1b25; // outline
    p[2] = 0x12111a; // deep shadow
    p[3] = 0xffffff; // highlight

    // terrain (GBA-ish muted greens/browns)
    p[10] = 0x6da36f; // grass light
    p[11] = 0x4f7f55; // grass mid
    p[12] = 0x3c5f41; // grass dark

    p[15] = 0xc2ab7e; // path light
    p[16] = 0x9a845f; // path mid
    p[17] = 0x786044; // path dark

    p[20] = 0x5e8e64; // leaf light
    p[21] = 0x3f6c48; // leaf dark
    p[22] = 0x2d4f36; // leaf deep

    p[25] = 0x8f6a45; // trunk light
    p[26] = 0x6c4b31; // trunk dark

    p[30] = 0xe3d9c8; // wall light
    p[31] = 0xbfb39b; // wall shadow

    p[34] = 0xa25d56; // roof light
    p[35] = 0x6f3b3a; // roof dark

    p[38] = 0xd9cba3; // indoor floor light
    p[39] = 0xb6a77a; // floor shadow

    p[42] = 0x906a44; // desk
    p[43] = 0x6c4b31; // desk shadow
    p[44] = 0x2a2a3a; // computer casing
    p[45] = 0x4b5563; // screen

    // character common (muted)
    p[50] = 0xf0c9a5; // skin
    p[51] = 0xd6a981; // skin shadow
    p[52] = 0x4d3b2c; // hair
    p[53] = 0x35251a; // hair shadow

    p[56] = 0x3c3f50; // pants
    p[57] = 0x232432; // shoes

    // jacket slots (set per agent)
    p[60] = 0x6f67b8; // jacket base default (muted purple)
    p[61] = 0x3f3a78; // jacket shadow default

    return p;
  }

  function paletteForRole(roleKey) {
    const p = basePalette();
    if (roleKey === 'ceo') { p[60] = 0x7b5db4; p[61] = 0x4f3b7a; }
    if (roleKey === 'pm') { p[60] = 0x466db4; p[61] = 0x2d3f6f; }
    if (roleKey === 'dev') { p[60] = 0x4f8a5a; p[61] = 0x2f5a38; }
    if (roleKey === 'qa') { p[60] = 0xc6a24d; p[61] = 0x7a5f2a; }
    return p;
  }

  // ---------------- Pixel art matrices ----------------
  // Tile matrices are 16x16 (rendered @2x => 32x32)

  function tileSolid(fillIdx) {
    const t = [];
    for (let y = 0; y < 16; y++) {
      const row = [];
      for (let x = 0; x < 16; x++) row.push(fillIdx);
      t.push(row);
    }
    return t;
  }

  function tileGrass(seed = 0) {
    // Muted grass with subtle banding: darker edges, lighter center.
    const t = tileSolid(11);

    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const edge = (x <= 1 || y <= 1 || x >= 14 || y >= 14);
        const innerEdge = (x === 2 || y === 2 || x === 13 || y === 13);
        if (edge) t[y][x] = 12;
        else if (innerEdge) t[y][x] = 11;
        else t[y][x] = 10;

        // speckles
        const r1 = (x * 3 + y * 5 + seed * 7) % 19;
        const r2 = (x * 7 + y * 3 + seed * 5) % 23;
        if (r1 === 0) t[y][x] = 11;
        if (r2 === 0) t[y][x] = 12;
      }
    }

    // a few highlight pixels
    for (let i = 0; i < 6; i++) {
      const x = (i * 5 + seed * 3) % 12 + 2;
      const y = (i * 7 + seed * 2) % 12 + 2;
      t[y][x] = 10;
    }

    return t;
  }

  function tilePath() {
    // Lighter center with darker edges (subtle, FireRed-ish)
    const t = tileSolid(16);
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const edge = (x <= 1 || y <= 1 || x >= 14 || y >= 14);
        const innerEdge = (x === 2 || y === 2 || x === 13 || y === 13);
        t[y][x] = edge ? 17 : (innerEdge ? 16 : 15);

        // tiny noise
        if ((x + y) % 7 === 0) t[y][x] = 16;
        if ((x * 5 + y * 3) % 29 === 0) t[y][x] = 17;
      }
    }
    return t;
  }

  function tileTreeTrunk() {
    const t = tileSolid(0);
    for (let y = 2; y < 16; y++) {
      for (let x = 6; x < 10; x++) t[y][x] = 25;
      for (let x = 10; x < 12; x++) t[y][x] = 26;
    }
    // outline
    for (let y = 2; y < 16; y++) {
      t[y][5] = 1; t[y][12] = 1;
    }
    t[2].fill(1, 5, 13);
    return t;
  }

  function tileTreeCanopy() {
    const t = tileSolid(0);
    // blob canopy
    for (let y = 1; y < 16; y++) {
      for (let x = 1; x < 15; x++) {
        const dx = x - 8;
        const dy = y - 7;
        const d = dx * dx + dy * dy;
        if (d < 52) t[y][x] = 20;
        if (d < 36) t[y][x] = 21;
      }
    }
    // shadow band bottom
    for (let x = 3; x < 13; x++) t[13][x] = 22;

    // outline pass: mark border pixels as outline (1)
    const copy = t.map(r => r.slice());
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        if (copy[y][x] === 0) continue;
        const n = [copy[y - 1]?.[x], copy[y + 1]?.[x], copy[y]?.[x - 1], copy[y]?.[x + 1]];
        if (n.some(v => v === 0 || v == null)) t[y][x] = 1;
      }
    }

    // re-fill interior (keep outline pixels as 1)
    for (let y = 1; y < 15; y++) {
      for (let x = 1; x < 15; x++) {
        if (t[y][x] === 1) continue;
        if (t[y][x] === 0) continue;
        // darker toward bottom
        t[y][x] = (y > 10) ? 21 : 20;
      }
    }

    // highlights (top-left)
    for (let y = 2; y < 8; y++) {
      for (let x = 2; x < 8; x++) {
        if (t[y][x] === 0 || t[y][x] === 1) continue;
        if ((x + y) % 4 === 0) t[y][x] = 20;
      }
    }

    return t;
  }

  function tileWall() {
    const t = tileSolid(30);
    // bricks
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        if (y % 4 === 0) t[y][x] = 31;
        if ((x + (y % 8 === 0 ? 0 : 2)) % 6 === 0) t[y][x] = 31;
      }
    }
    // border
    for (let x = 0; x < 16; x++) { t[0][x] = 1; t[15][x] = 1; }
    for (let y = 0; y < 16; y++) { t[y][0] = 1; t[y][15] = 1; }
    return t;
  }

  function tileRoof() {
    const t = tileSolid(34);
    // shingles
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        if ((y % 4) === 0) t[y][x] = 35;
        if ((x + y) % 11 === 0) t[y][x] = 35;
      }
    }
    // ridge highlight
    for (let x = 0; x < 16; x++) t[1][x] = 34;
    return t;
  }

  function tileDoor() {
    const t = tileSolid(0);
    // wall frame
    for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) t[y][x] = 30;
    for (let x = 0; x < 16; x++) { t[0][x] = 1; t[15][x] = 1; }
    for (let y = 0; y < 16; y++) { t[y][0] = 1; t[y][15] = 1; }

    // door hole
    for (let y = 4; y < 16; y++) {
      for (let x = 5; x < 11; x++) t[y][x] = 2;
    }
    for (let y = 4; y < 16; y++) { t[y][5] = 1; t[y][10] = 1; }
    for (let x = 5; x < 11; x++) t[4][x] = 1;

    // doorknob highlight
    t[11][9] = 3;
    return t;
  }

  function tileFloor() {
    const t = tileSolid(38);
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        if ((x + y) % 8 === 0) t[y][x] = 39;
        if (y % 5 === 0) t[y][x] = 39;
      }
    }
    return t;
  }

  function tileDesk() {
    const t = tileSolid(0);
    // tabletop
    for (let y = 5; y < 12; y++) for (let x = 2; x < 14; x++) t[y][x] = 42;
    // edge shadow
    for (let x = 2; x < 14; x++) t[11][x] = 43;
    // legs
    for (let y = 12; y < 16; y++) { t[y][4] = 43; t[y][11] = 43; }
    // outline
    for (let y = 5; y < 12; y++) { t[y][1] = 1; t[y][14] = 1; }
    for (let x = 1; x < 15; x++) { t[5][x] = 1; t[12][x] = 1; }
    return t;
  }

  function tilePC() {
    const t = tileSolid(0);
    // monitor
    for (let y = 4; y < 10; y++) for (let x = 4; x < 12; x++) t[y][x] = 44;
    for (let y = 5; y < 9; y++) for (let x = 5; x < 11; x++) t[y][x] = 45;
    // stand
    for (let y = 10; y < 12; y++) for (let x = 7; x < 9; x++) t[y][x] = 44;
    for (let y = 12; y < 14; y++) for (let x = 6; x < 10; x++) t[y][x] = 44;
    // highlight pixel
    t[6][10] = 3;
    // outline
    for (let y = 3; y < 11; y++) { t[y][3] = 1; t[y][12] = 1; }
    for (let x = 3; x < 13; x++) { t[3][x] = 1; t[10][x] = 1; }
    return t;
  }

  // Shadow texture (pixel oval)
  function shadowOval() {
    // 12x4 (0 transparent, 2 deep shadow)
    return [
      [0,0,0,2,2,2,2,2,2,0,0,0],
      [0,0,2,2,2,2,2,2,2,2,0,0],
      [0,0,0,2,2,2,2,2,2,0,0,0],
      [0,0,0,0,2,2,2,2,0,0,0,0]
    ];
  }

  // Character (top-down) 32x32, 3-frame walk cycles.
  // Indices: 0 transparent, 1 outline, 50 skin, 52 hair, 60/61 jacket, 56 pants, 57 shoes
  // Proportions: smaller head, longer torso (closer to Pokémon NPC vibe).
  function charFrame({ facing, step }) {
    const w = 32, h = 32;
    const m = Array.from({ length: h }, () => Array.from({ length: w }, () => 0));

    function px(x, y, c) {
      if (x < 0 || y < 0 || x >= w || y >= h) return;
      m[y][x] = c;
    }

    const cx = 16;
    const top = 7;

    // Head (smaller)
    for (let y = top; y < top + 8; y++) {
      for (let x = cx - 4; x <= cx + 4; x++) {
        const dx = x - cx;
        const dy = y - (top + 4);
        if (dx * dx + dy * dy <= 18) px(x, y, 50);
      }
    }

    // Hair cap
    for (let y = top; y < top + 4; y++) {
      for (let x = cx - 5; x <= cx + 5; x++) {
        if ((x + y) % 2 === 0 && m[y][x] !== 0) px(x, y, 52);
      }
    }

    // Face hint
    if (facing === 'down') {
      px(cx - 2, top + 4, 1);
      px(cx + 2, top + 4, 1);
      px(cx, top + 6, 51);
    } else if (facing === 'up') {
      px(cx - 1, top + 6, 52);
      px(cx + 1, top + 6, 52);
    } else {
      px(cx + 2, top + 4, 1);
      px(cx + 2, top + 5, 51);
    }

    // Outline around head
    for (let y = top - 1; y < top + 10; y++) {
      for (let x = cx - 6; x <= cx + 6; x++) {
        if (m[y]?.[x] !== 0) continue;
        const n = [m[y - 1]?.[x], m[y + 1]?.[x], m[y]?.[x - 1], m[y]?.[x + 1]];
        if (n.some(v => v && v !== 0)) px(x, y, 1);
      }
    }

    // Torso (longer)
    const torsoTop = top + 9;
    for (let y = torsoTop; y < torsoTop + 10; y++) {
      for (let x = cx - 6; x <= cx + 6; x++) {
        const shade = (x > cx + 2) ? 61 : 60;
        px(x, y, shade);
      }
    }

    // Arms
    for (let y = torsoTop + 2; y < torsoTop + 9; y++) {
      px(cx - 7, y, 60);
      px(cx + 7, y, 61);
    }

    // Belt line
    for (let x = cx - 6; x <= cx + 6; x++) px(x, torsoTop + 9, 1);

    // Legs — animate by step
    const legTop = torsoTop + 10;
    const swing = (step === 1) ? 1 : (step === 2 ? -1 : 0);

    if (facing === 'down') {
      for (let y = legTop; y < legTop + 5; y++) {
        for (let x = cx - 4; x <= cx - 1; x++) px(x, y, 56);
        for (let x = cx + 1; x <= cx + 4; x++) px(x, y, 56);
      }
      // feet
      for (let x = cx - 4 + swing; x <= cx - 1 + swing; x++) px(x, legTop + 5, 57);
      for (let x = cx + 1 - swing; x <= cx + 4 - swing; x++) px(x, legTop + 5, 57);
    } else if (facing === 'up') {
      for (let y = legTop; y < legTop + 4; y++) for (let x = cx - 4; x <= cx + 4; x++) px(x, y, 56);
      for (let x = cx - 3 + swing; x <= cx + 3 + swing; x++) px(x, legTop + 4, 57);
    } else {
      for (let y = legTop; y < legTop + 5; y++) for (let x = cx - 2; x <= cx + 3; x++) px(x, y, 56);
      for (let x = cx - 1 + swing; x <= cx + 3 + swing; x++) px(x, legTop + 5, 57);
      // backpack pixel cluster (pokemon vibe)
      px(cx - 5, torsoTop + 4, 61);
      px(cx - 5, torsoTop + 5, 61);
    }

    // Outline around torso/legs
    for (let y = torsoTop - 1; y < legTop + 7; y++) {
      for (let x = cx - 9; x <= cx + 9; x++) {
        if (m[y]?.[x] !== 0) continue;
        const n = [m[y - 1]?.[x], m[y + 1]?.[x], m[y]?.[x - 1], m[y]?.[x + 1]];
        if (n.some(v => v && v !== 0)) px(x, y, 1);
      }
    }

    return m;
  }

  function charSheetFrames() {
    const steps = [0, 1, 2];
    const frames = [];
    for (const s of steps) frames.push(charFrame({ facing: 'down', step: s }));
    for (const s of steps) frames.push(charFrame({ facing: 'up', step: s }));
    for (const s of steps) frames.push(charFrame({ facing: 'side', step: s }));
    return frames; // 9 frames
  }

  // ---------------- Scene ----------------
  const TILE = 32;
  const MAP_W = 20;
  const MAP_H = 15;

  const TILE_IDX = {
    GRASS_A: 0,
    GRASS_B: 1,
    PATH: 2,
    FLOOR: 3,
    WALL: 4,
    ROOF: 5,
    DOOR: 6,
    TRUNK: 7,
    CANOPY: 8,
    DESK: 9,
    PC: 10
  };

  function buildTiles(scene) {
    const p = basePalette();
    const tiles = [
      tileGrass(0),
      tileGrass(2),
      tilePath(),
      tileFloor(),
      tileWall(),
      tileRoof(),
      tileDoor(),
      tileTreeTrunk(),
      tileTreeCanopy(),
      tileDesk(),
      tilePC()
    ];
    renderSpriteSheet(scene, tiles, p, 'dt-tiles', 2);

    // Shadow texture
    renderPixelArt(scene, shadowOval(), p, 'dt-shadow', 2);
  }

  function buildCharacters(scene) {
    const frames = charSheetFrames();

    const roles = {
      minisama: 'ceo',
      coach: 'pm',
      lebron: 'dev',
      curry: 'qa'
    };

    for (const [k, role] of Object.entries(roles)) {
      renderSpriteSheet(scene, frames, paletteForRole(role), `dt-char-${k}`, 2);
    }

    // Create animations per character (share frame indices)
    const anims = [
      { key: 'walk-down', start: 0, end: 2 },
      { key: 'walk-up', start: 3, end: 5 },
      { key: 'walk-side', start: 6, end: 8 }
    ];

    for (const chKey of Object.keys(roles)) {
      for (const a of anims) {
        const animKey = `${chKey}-${a.key}`;
        if (scene.anims.exists(animKey)) continue;
        scene.anims.create({
          key: animKey,
          frames: scene.anims.generateFrameNumbers(`dt-char-${chKey}`, { start: a.start, end: a.end }),
          frameRate: 8,
          repeat: -1
        });
      }
    }
  }

  function buildMapLayers(scene) {
    const map = scene.make.tilemap({
      width: MAP_W,
      height: MAP_H,
      tileWidth: TILE,
      tileHeight: TILE
    });

    const tileset = map.addTilesetImage('dt-tiles');

    const ground = map.createBlankLayer('ground', tileset, 0, 0);
    const world = map.createBlankLayer('world', tileset, 0, 0);
    const above = map.createBlankLayer('above', tileset, 0, 0);

    // Fill base grass
    for (let y = 0; y < MAP_H; y++) {
      for (let x = 0; x < MAP_W; x++) {
        const v = ((x + y) % 3 === 0) ? TILE_IDX.GRASS_B : TILE_IDX.GRASS_A;
        ground.putTileAt(v, x, y);
      }
    }

    // Stone path to HQ door
    const pathX = 10;
    for (let y = MAP_H - 1; y >= 8; y--) ground.putTileAt(TILE_IDX.PATH, pathX, y);
    for (let x = 8; x <= 12; x++) ground.putTileAt(TILE_IDX.PATH, x, 8);

    // HQ building (cutaway): walls + indoor floor + desks
    const bx0 = 7, bx1 = 13;
    const by0 = 1, by1 = 7;

    // indoor floor
    for (let y = by0 + 2; y <= by1; y++) {
      for (let x = bx0 + 1; x <= bx1 - 1; x++) ground.putTileAt(TILE_IDX.FLOOR, x, y);
    }

    // roof (top row only) as above layer for depth
    for (let x = bx0; x <= bx1; x++) above.putTileAt(TILE_IDX.ROOF, x, by0);

    // walls
    for (let y = by0 + 1; y <= by1; y++) {
      world.putTileAt(TILE_IDX.WALL, bx0, y);
      world.putTileAt(TILE_IDX.WALL, bx1, y);
    }
    for (let x = bx0; x <= bx1; x++) world.putTileAt(TILE_IDX.WALL, x, by0 + 1);

    // door centered
    world.putTileAt(TILE_IDX.DOOR, pathX, by1);

    // desks + computers inside
    const deskPositions = [
      { x: bx0 + 2, y: by0 + 3 },
      { x: bx0 + 5, y: by0 + 3 },
      { x: bx0 + 2, y: by0 + 5 },
      { x: bx0 + 5, y: by0 + 5 }
    ];

    for (const p of deskPositions) {
      world.putTileAt(TILE_IDX.DESK, p.x, p.y);
      world.putTileAt(TILE_IDX.PC, p.x + 1, p.y);
    }

    // Trees around
    const trees = [
      { x: 2, y: 2 }, { x: 3, y: 4 }, { x: 2, y: 10 },
      { x: 17, y: 3 }, { x: 16, y: 5 }, { x: 18, y: 10 }
    ];
    for (const t of trees) {
      world.putTileAt(TILE_IDX.TRUNK, t.x, t.y);
      above.putTileAt(TILE_IDX.CANOPY, t.x, t.y - 1);
    }

    ground.setDepth(0);
    world.setDepth(10);
    above.setDepth(30);

    return { map, ground, world, above };
  }

  class AtWorkScene extends Phaser.Scene {
    constructor() {
      super('AtWorkScene');
      this.agents = {};
      this.dialog = null;
      this.dialogText = null;
    }

    create() {
      try {
        const overlay = document.getElementById('phaserOverlay');
        if (overlay) overlay.style.display = 'none';

        buildTiles(this);
        buildCharacters(this);
        const layers = buildMapLayers(this);

        this.cameras.main.setBounds(0, 0, MAP_W * TILE, MAP_H * TILE);
        this.cameras.main.centerOn((MAP_W * TILE) / 2, (MAP_H * TILE) / 2);
        this.cameras.main.setRoundPixels(true);

        // Place agents
        const start = {
          minisama: { x: 9.5 * TILE, y: 11 * TILE },
          coach: { x: 11.0 * TILE, y: 11.5 * TILE },
          lebron: { x: 10.2 * TILE, y: 12.3 * TILE },
          curry: { x: 12.2 * TILE, y: 12.0 * TILE }
        };

        for (const [k, pos] of Object.entries(start)) {
          const shadow = this.add.image(pos.x, pos.y + 4, 'dt-shadow');
          shadow.setOrigin(0.5, 0.5);
          shadow.setAlpha(0.35);
          shadow.setDepth(pos.y - 1);

          const spr = this.add.sprite(pos.x, pos.y, `dt-char-${k}`, 1);
          spr.setOrigin(0.5, 0.85);
          spr.setDepth(pos.y);

          this.agents[k] = {
            key: k,
            sprite: spr,
            shadow,
            state: 'idle',
            moveTween: null,
            idleTween: null,
            facing: 'down'
          };

          this.setAgentIdle(k);
        }

        // Dialog box overlay (Pokémon-ish, pixel-perfect)
        const cam = this.cameras.main;
        const panelH = 84;
        const pad = 10;

        const x = Math.floor(pad);
        const y = Math.floor(cam.height - panelH - pad);
        const w = Math.floor(cam.width - pad * 2);
        const h = Math.floor(panelH);

        const g = this.add.graphics();
        g.setScrollFactor(0);
        g.setDepth(200);

        // Fill (cream)
        g.fillStyle(0xf6f4ea, 1);
        g.fillRect(x, y, w, h);

        // Border (2px), then inner line (1px)
        g.lineStyle(2, 0x1c1b25, 1);
        g.strokeRect(x + 1, y + 1, w - 2, h - 2);
        g.lineStyle(1, 0x6b7280, 1);
        g.strokeRect(x + 6, y + 6, w - 12, h - 12);

        this.dialog = g;

        this.dialogText = this.add.text(x + 16, y + 18, 'Dreamteam HQ: Live sync ready. Awaiting updates…', {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: '10px',
          color: '#1c1b25',
          wordWrap: { width: w - 32 }
        });
        this.dialogText.setScrollFactor(0);
        this.dialogText.setDepth(210);

        // Hook live updates
        window.addEventListener('dreamteam:live', (e) => {
          this.applyLive(e?.detail?.state?.data);
        });

        // First render
        const st = window.DreamteamLive?.getState?.();
        this.applyLive(st?.data);

        // Keep y-sorted depth (sprite + shadow)
        this.events.on('update', () => {
          for (const a of Object.values(this.agents)) {
            a.shadow.setPosition(a.sprite.x, a.sprite.y + 6);
            a.shadow.setDepth(a.sprite.y - 1);
            a.sprite.setDepth(a.sprite.y);
          }
        });

        layers.above.setAlpha(1);
      } catch (err) {
        console.error('[phaser-atwork] create() failed', err);
        const overlay = document.getElementById('phaserOverlay');
        if (overlay) {
          overlay.style.display = 'flex';
          overlay.querySelector('.txt')?.replaceChildren(document.createTextNode('Pixel scene failed to load (see console).'));
        }
      }
    }

    setAgentIdle(k) {
      const a = this.agents[k];
      if (!a) return;

      if (a.moveTween) {
        a.moveTween.stop();
        a.moveTween = null;
      }

      // stop existing idle tween before recreating
      if (a.idleTween) {
        a.idleTween.stop();
        a.idleTween = null;
      }

      a.sprite.stop();
      a.sprite.setFrame(1);

      // Pixel-ish bob: 1px step, slow loop (~2.6s)
      const y0 = a.sprite.y;
      a.idleTween = this.tweens.add({
        targets: a.sprite,
        y: y0 - 1,
        duration: 1300,
        yoyo: true,
        repeat: -1,
        ease: 'Stepped'
      });
    }

    setAgentWorking(k) {
      const a = this.agents[k];
      if (!a) return;

      if (a.idleTween) {
        a.idleTween.stop();
        a.idleTween = null;
      }

      if (a.moveTween) {
        a.moveTween.stop();
        a.moveTween = null;
      }

      const x0 = a.sprite.x;
      const y0 = a.sprite.y;
      const pts = [
        { x: x0 + 28, y: y0 },
        { x: x0 + 28, y: y0 - 18 },
        { x: x0 - 18, y: y0 - 18 },
        { x: x0 - 18, y: y0 }
      ];

      const tl = this.tweens.timeline({
        targets: a.sprite,
        loop: -1,
        tweens: [
          { x: pts[0].x, y: pts[0].y, duration: 420, ease: 'Linear' },
          { x: pts[1].x, y: pts[1].y, duration: 420, ease: 'Linear' },
          { x: pts[2].x, y: pts[2].y, duration: 420, ease: 'Linear' },
          { x: pts[3].x, y: pts[3].y, duration: 420, ease: 'Linear' }
        ]
      });
      a.moveTween = tl;

      a.sprite.play(`${k}-walk-down`, true);
    }

    applyLive(live) {
      if (!live || !live.agents) return;

      // update dialog text from most recent feed entry
      const feed = live.feed || [];
      if (feed.length && this.dialogText) {
        const last = feed[feed.length - 1];
        const who = (last.from || 'System').replace(/\s*\(.*\)/, '');
        const msg = (last.text || '').split('\n').slice(0, 2).join(' ').trim();
        const line = `${who}: ${msg}`.slice(0, 120);
        this.dialogText.setText(line || 'Dreamteam HQ: standing by…');
      }

      // animate each agent based on state
      for (const [k, data] of Object.entries(live.agents)) {
        const a = this.agents[k];
        if (!a) continue;

        const nextState = (data?.state || 'idle').toLowerCase();
        if (nextState === a.state) continue;
        a.state = nextState;

        if (nextState === 'working') {
          this.setAgentWorking(k);
          a.sprite.clearTint();
          continue;
        }

        // Idle-ish states keep bob; just tint.
        this.setAgentIdle(k);

        if (nextState === 'sleeping') {
          a.sprite.setTint(0x9aa7ff);
        } else if (nextState === 'eating') {
          a.sprite.setTint(0xffe3a3);
        } else {
          a.sprite.clearTint();
        }
      }
    }
  }

  function bootPhaser() {
    const mount = document.getElementById('phaserMount');
    if (!mount) return;

    // Avoid double-boot.
    if (mount.__dt_game) return;

    const overlay = document.getElementById('phaserOverlay');
    if (overlay) overlay.style.display = 'flex';

    const config = {
      type: Phaser.AUTO,
      parent: mount,
      width: MAP_W * TILE,
      height: MAP_H * TILE,
      backgroundColor: '#0b0b12',
      pixelArt: true,
      roundPixels: true,
      antialias: false,
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
      },
      scene: [AtWorkScene]
    };

    const game = new Phaser.Game(config);
    mount.__dt_game = game;
  }

  document.addEventListener('DOMContentLoaded', () => {
    bootPhaser();
  });
})();
