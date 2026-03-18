#!/usr/bin/env node
/*
Generate /public/demo-live.json from REAL W12 session artifacts.

Constraint: Do NOT fabricate conversations. We only excerpt from:
- data/failure-analysis-w12.md (Coach)
- data/research-notes-w12.md (Coach)
- data/lebron-tech-proposal-w12.md (Lebron)
- data/curry-corrected-audit-w12.md (Curry)

We split each document into multiple feed entries by section so the UI has
sufficient volume to feel real, but every line originates from those files.
*/

import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');

function read(p) {
  return fs.readFileSync(path.join(ROOT, p), 'utf8');
}

function stat(p) {
  return fs.statSync(path.join(ROOT, p));
}

function lines(text) {
  return text.replace(/\r\n/g, '\n').split('\n');
}

function findHeaderIndex(ls, headerRegex) {
  for (let i = 0; i < ls.length; i++) {
    if (headerRegex.test(ls[i])) return i;
  }
  return -1;
}

function extractBulletsFrom(ls, startIdx, max = 5) {
  const out = [];
  for (let i = startIdx + 1; i < ls.length; i++) {
    const line = ls[i];
    if (/^#{1,6}\s+/.test(line)) break;
    const m = line.match(/^\s*[-*]\s+(.*)$/);
    if (m) {
      const t = m[1].trim();
      if (t) out.push(t);
      if (out.length >= max) break;
    }
  }
  return out;
}

function extractParagraphAfter(ls, startIdx, maxChars = 240) {
  let buf = '';
  for (let i = startIdx + 1; i < ls.length; i++) {
    const line = ls[i];
    if (/^#{1,6}\s+/.test(line)) break;
    if (!line.trim()) {
      if (buf.trim()) break;
      continue;
    }
    if (/^\s*[-*]\s+/.test(line)) break;
    buf += (buf ? ' ' : '') + line.trim();
    if (buf.length >= maxChars) break;
  }
  return buf.trim();
}

function extractSection(md, headerRegex, { bulletsMax = 6, paraMaxChars = 260 } = {}) {
  const ls = lines(md);
  const idx = findHeaderIndex(ls, headerRegex);
  if (idx === -1) return { bullets: [], para: '' };
  const bullets = extractBulletsFrom(ls, idx, bulletsMax);
  const para = extractParagraphAfter(ls, idx, paraMaxChars);
  return { bullets, para };
}

function compactList(bullets) {
  return bullets
    .map(b => b.replace(/^\*\*|\*\*$/g, '').trim())
    .filter(Boolean)
    .slice(0, 8);
}

function mkText({ title, para, bullets, fileRef }) {
  const parts = [];
  parts.push(title);
  if (para) parts.push('', para);
  if (bullets && bullets.length) {
    parts.push('', 'Key points:');
    for (const b of bullets) parts.push(`- ${b}`);
  }
  if (fileRef) parts.push('', `File: ${fileRef}`);
  return parts.join('\n');
}

function build() {
  const nowIso = new Date().toISOString();

  const sources = [
    {
      file: 'data/research-notes-w12.md',
      agentKey: 'coach',
      from: 'Coach (PM)',
      to: 'All',
      kind: 'report',
      sections: [
        { header: /^##\s+1\)\s+Pixel-art rendering on the web/i, title: 'W12 research — Pixel rendering rules (Coach)' },
        { header: /^##\s+2\)\s+Reference repos/i, title: 'W12 research — Reference repos (Coach)' },
        { header: /^##\s+3\)\s+Pokémon UI design pointers/i, title: 'W12 research — Pokémon UI pointers (Coach)' },
        { header: /^##\s+4\)\s+Dark chat UI references/i, title: 'W12 research — Chat UI references (Coach)' }
      ]
    },
    {
      file: 'data/failure-analysis-w12.md',
      agentKey: 'coach',
      from: 'Coach (PM)',
      to: 'All',
      kind: 'report',
      sections: [
        { header: /^##\s+Executive summary/i, title: 'W12 failure analysis — Executive summary (Coach)' },
        { header: /^##\s+1\)\s+Why the pixel scene looked so bad/i, title: 'W12 failure analysis — Pixel scene root causes (Coach)' },
        { header: /^##\s+2\)\s+Why the activity feed was empty/i, title: 'W12 failure analysis — Activity feed root causes (Coach)' },
        { header: /^##\s+Corrective actions for the redo/i, title: 'W12 failure analysis — Corrective actions (Coach)' }
      ]
    },
    {
      file: 'data/lebron-tech-proposal-w12.md',
      agentKey: 'lebron',
      from: 'Lebron (Dev)',
      to: 'All',
      kind: 'report',
      sections: [
        { header: /^##\s+0\)\s+What I built vs\. what was needed/i, title: 'W12 tech proposal — What shipped vs what we needed (Lebron)' },
        { header: /^##\s+1\)\s+Root causes/i, title: 'W12 tech proposal — Root causes (Lebron)' },
        { header: /^##\s+2\)\s+Research:/i, title: 'W12 tech proposal — Research notes (Lebron)' },
        { header: /^##\s+6\)\s+Concrete implementation plan/i, title: 'W12 tech proposal — Concrete plan (Lebron)' },
        { header: /^##\s+8\)\s+Quality bar/i, title: 'W12 tech proposal — Quality bar (Lebron)' }
      ]
    },
    {
      file: 'data/curry-corrected-audit-w12.md',
      agentKey: 'curry',
      from: 'Curry (QA)',
      to: 'All',
      kind: 'audit',
      sections: [
        { header: /^##\s+Part 1: What I Got Wrong/i, title: 'W12 corrected audit — What I got wrong (Curry)' },
        { header: /^##\s+Part 2: Corrected Scores/i, title: 'W12 corrected audit — Corrected scores + verdict (Curry)' },
        { header: /^###\s+Pixel Scene\s+—\s+"PASS" means:/i, title: 'W12 corrected audit — Pixel scene acceptance criteria (Curry)' },
        { header: /^###\s+Activity Feed\s+—\s+"PASS" means:/i, title: 'W12 corrected audit — Activity feed acceptance criteria (Curry)' },
        { header: /^###\s+Dashboard Overall\s+—\s+"PASS" means:/i, title: 'W12 corrected audit — Dashboard acceptance criteria (Curry)' }
      ]
    }
  ];

  const feed = [];

  for (const src of sources) {
    const md = read(src.file);
    const ts = Math.floor(stat(src.file).mtimeMs / 1000);

    let part = 0;
    for (const sec of src.sections) {
      const { bullets, para } = extractSection(md, sec.header, { bulletsMax: 6, paraMaxChars: 320 });
      const text = mkText({
        title: sec.title,
        para,
        bullets: compactList(bullets),
        fileRef: src.file
      });

      // Only include sections that actually found content.
      if (!para && (!bullets || bullets.length === 0)) continue;

      const id = `${ts}-${src.agentKey}-seed-${String(part).padStart(2, '0')}`;
      feed.push({
        id,
        ts,
        from: src.from,
        to: src.to,
        kind: src.kind,
        text
      });
      part++;
    }
  }

  // Stable sort by timestamp, then id.
  feed.sort((a, b) => (a.ts - b.ts) || a.id.localeCompare(b.id));

  const live = {
    version: 1,
    generatedAt: nowIso,
    agents: {
      minisama: { state: 'idle', task: null, since: feed.at(-1)?.ts || Math.floor(Date.now() / 1000) },
      coach: { state: 'idle', task: null, since: feed.at(-1)?.ts || Math.floor(Date.now() / 1000) },
      lebron: { state: 'idle', task: null, since: feed.at(-1)?.ts || Math.floor(Date.now() / 1000) },
      curry: { state: 'idle', task: null, since: feed.at(-1)?.ts || Math.floor(Date.now() / 1000) }
    },
    feed
  };

  return live;
}

function main() {
  const out = build();
  const outPath = path.join(ROOT, 'public', 'demo-live.json');
  fs.writeFileSync(outPath, JSON.stringify(out, null, 2) + '\n', 'utf8');
  process.stderr.write(`Wrote ${outPath} with ${out.feed.length} real seeded entries.\n`);
}

main();
