// Dreamteam At Work — Phase 1 live data layer (polling + tiny store)
//
// Contract:
// - Loads live.json from GitHub Gist raw URL (data/gist-config.json), else falls back to /demo-live.json
// - Polls every 30s with cache-buster and cache:no-store
// - Stores state globally and exposes getters
// - Updates a "last updated Xs ago" indicator

(function () {
  const POLL_MS = 30_000;

  const state = {
    source: 'unknown', // 'gist' | 'demo'
    liveUrl: null,
    lastFetchedAt: null,
    data: null,
    error: null
  };

  function nowMs() {
    return Date.now();
  }

  function safeJsonParse(text) {
    try { return JSON.parse(text); } catch { return null; }
  }

  async function fetchJson(url) {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
    return await res.json();
  }

  async function resolveGistRawUrl() {
    // Best effort: fetch config from repo path (works on Vercel static)
    // If it fails, UI will use demo.
    try {
      const cfg = await fetchJson(`/data/gist-config.json?ts=${nowMs()}`);
      if (cfg && typeof cfg.raw_url === 'string' && cfg.raw_url.startsWith('http')) {
        return cfg.raw_url;
      }
    } catch (_) {
      // ignore
    }
    return null;
  }

  async function loadOnce() {
    state.error = null;

    if (!state.liveUrl) {
      state.liveUrl = await resolveGistRawUrl();
    }

    // Attempt gist first, then fallback to demo
    // IMPORTANT: even when Gist succeeds, we still want seeded demo feed as a baseline
    // (so the UI is never empty) and then we append newer live events.
    let demoData = null;
    try {
      demoData = await fetchJson(`/demo-live.json?ts=${nowMs()}`);
    } catch (_) {
      // ignore
    }

    if (state.liveUrl) {
      try {
        const gistData = await fetchJson(`${state.liveUrl}?ts=${nowMs()}`);

        // Merge feed: demo seed first, then gist entries (dedupe by id)
        const seen = new Set();
        const mergedFeed = [];

        for (const m of (demoData?.feed || [])) {
          const id = m?.id || `${m?.ts}-${m?.from}-${m?.text}`;
          if (seen.has(id)) continue;
          seen.add(id);
          mergedFeed.push(m);
        }
        for (const m of (gistData?.feed || [])) {
          const id = m?.id || `${m?.ts}-${m?.from}-${m?.text}`;
          if (seen.has(id)) continue;
          seen.add(id);
          mergedFeed.push(m);
        }

        // If gist has agents state, keep it; otherwise fall back to demo.
        const mergedAgents = gistData?.agents || demoData?.agents || {};

        state.data = {
          ...(demoData || {}),
          ...(gistData || {}),
          agents: mergedAgents,
          feed: mergedFeed
        };
        state.source = 'gist';
        state.lastFetchedAt = nowMs();
        state.error = null;

        // Notify any UI listeners that a load finished
        try {
          window.dispatchEvent(new CustomEvent('dreamteam:live', { detail: { state: getState() } }));
        } catch (_) {
          // ignore
        }

        return;
      } catch (e) {
        state.error = e;
        // fall through to demo-only below
      }
    }

    try {
      // Vercel serves `public/` at the site root, so this file is `/demo-live.json` (NOT `/public/demo-live.json`).
      const data = await fetchJson(`/demo-live.json?ts=${nowMs()}`);
      state.data = data;
      state.source = 'demo';
      state.lastFetchedAt = nowMs();
    } catch (e2) {
      state.error = e2;
    }

    // Notify any UI listeners that a load finished
    try {
      window.dispatchEvent(new CustomEvent('dreamteam:live', { detail: { state: getState() } }));
    } catch (_) {
      // ignore
    }
  }

  function ensureLastUpdatedEl() {
    // If index.html has an element with id="last-updated", we use it.
    // Otherwise we inject a small badge at the top-right.
    let el = document.getElementById('last-updated');
    if (el) return el;

    el = document.createElement('div');
    el.id = 'last-updated';
    el.style.position = 'fixed';
    el.style.top = '12px';
    el.style.right = '12px';
    el.style.zIndex = '9999';
    el.style.padding = '8px 10px';
    el.style.borderRadius = '10px';
    el.style.background = 'rgba(18,18,26,0.9)';
    el.style.border = '1px solid rgba(255,255,255,0.12)';
    el.style.color = '#e8e8ec';
    el.style.font = '12px/1.2 system-ui, -apple-system, Segoe UI, sans-serif';
    el.style.backdropFilter = 'blur(6px)';
    document.body.appendChild(el);
    return el;
  }

  function formatAgo(msAgo) {
    if (msAgo < 1000) return 'just now';
    const s = Math.floor(msAgo / 1000);
    if (s < 60) return `${s}s ago`;
    const m = Math.floor(s / 60);
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    return `${h}h ago`;
  }

  function renderLastUpdated() {
    const el = ensureLastUpdatedEl();

    if (!state.lastFetchedAt) {
      el.textContent = 'Live: loading…';
      return;
    }

    const ago = formatAgo(nowMs() - state.lastFetchedAt);
    const sourceLabel = state.source === 'gist' ? 'Gist' : (state.source === 'demo' ? 'Demo' : 'Unknown');

    if (state.error) {
      el.textContent = `Live (${sourceLabel}): ${ago} · error`;
      return;
    }

    el.textContent = `Live (${sourceLabel}): updated ${ago}`;
  }

  // Public API
  function getState() {
    return { ...state };
  }

  function getAgents() {
    return state.data?.agents || {};
  }

  function getFeed() {
    return state.data?.feed || [];
  }

  // Attach to window for non-module usage
  window.DreamteamLive = {
    getState,
    getAgents,
    getFeed,
    reload: loadOnce
  };

  // Debug: expose a quick check in console
  window.__dt_debug = {
    version: 'merge-seed-v1',
    peek: () => ({ source: state.source, feed: state.data?.feed?.length || 0, liveUrl: state.liveUrl })
  };

  // Boot
  document.addEventListener('DOMContentLoaded', async () => {
    await loadOnce();
    renderLastUpdated();

    setInterval(async () => {
      await loadOnce();
      renderLastUpdated();

      // Notify listeners on each poll too
      try {
        window.dispatchEvent(new CustomEvent('dreamteam:live', { detail: { state: getState() } }));
      } catch (_) {
        // ignore
      }
    }, POLL_MS);

    // Update the "ago" text every 1s without refetching
    setInterval(renderLastUpdated, 1000);
  });
})();
