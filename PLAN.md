# Dream Team Dashboard — PLAN.md

> Coach analysis, 2026-03-24. Target: dashboard UI-only, auto-update sau retro.

---

## A. Data Pipeline — Backend hay không?

### Phân tích hiện trạng

Dashboard hiện tại (`index.html`) là **static mock** — mọi số liệu hardcoded. SPEC.md đề xuất 3 options:

| Option | Mô tả | Ưu | Nhược |
|--------|-------|----|-------|
| A: GitHub API | Dashboard fetch raw files từ GitHub repo | Thực-time, không cần generate step | Phụ thuộc GitHub API rate, cần repo public/private token, retro file format thay đổi = parse break |
| B: `dashboard-data.json` | Script generate JSON từ workspace, commit vào repo | Đơn giản nhất, data stable, dễ debug | Cần thêm cron job generate + git push |
| C: Vercel serverless | Clone workspace data trên server | Flexible | Overkill, cần access credential, phức tạp |

### Recommendation: **Option B — Generate `dashboard-data.json`**

**Lý do:**
- Taisama nói rõ: "UI only cũng được, mỗi ngày retro xong + update agent info thì đẩy lên"
- Data source đều là **file trong workspace** — retro md, project-status JSON, agent configs
- Retro cron đã chạy 23:59 nightly → thêm step generate JSON ngay sau là tự nhiên
- Dashboard chỉ cần `fetch('dashboard-data.json')` — zero backend
- Dễ debug: data JSON tĩnh, mở browser DevTools là thấy

**Data flow:**
```
23:59 Retro cron chạy → tạo memory/retro/daily/YYYY-MM-DD.md
00:00 Generate script chạy → parse retro files + project-status.sh + agent configs
       → output domains/dreamteam/dashboard-data.json
00:02 Git commit + push (hoặc Vercel CLI deploy)
00:05 Dashboard tự refresh (Vercel re-deploy hoặc client-side cache bust)
```

**Debate — tại sao không A hay C?**
- **A (GitHub API):** Retro file format chưa chuẩn hóa hoàn toàn. Parser trên client fragile. Nếu format đổi → dashboard break mà không có guard. JSON trung gian = stable contract.
- **C (Serverless):** Vercel function cần SSH hoặc clone repo → overkill cho use case "update 1 lần/ngày". Không đáng complexity.

---

## B. Daily Update Flow

### Flow chi tiết

```
1. 23:59 — dreamteam-retro-daily cron chạy (đã có)
   Output: memory/retro/daily/YYYY-MM-DD.md

2. 00:00 — dashboard-update cron chạy (MỚI)
   Script: domains/dreamteam/scripts/generate-data.sh
   - Parse tất cả retro files trong memory/retro/daily/
   - Chạy scripts/project-status.sh → project health data
   - Parse agents/*/AGENT.md → agent roster info
   - Parse memory/process/dream-team.md → lessons learned
   - Aggregate thành dashboard-data.json
   Output: domains/dreamteam/dashboard-data.json

3. 00:02 — Auto-commit & push
   git add domains/dreamteam/dashboard-data.json
   git commit -m "dashboard: auto-update $(date +%Y-%m-%d)"
   git push

4. 00:03 — Vercel auto-deploy (webhook on push)
   Dashboard live với data mới
```

### Ai chịu trách nhiệm?

| Bước | Actor | Ghi chú |
|------|-------|---------|
| Retro cron | Đã có (openclaw cron) | dreamteam-retro-daily |
| Generate data | **Coach** (cron mới) | Script shell + optional node parser |
| Git push | **Coach** (cùng cron) | Hoặc Taisama nếu cần manual |
| Vercel deploy | **Tự động** | Webhook on push → auto deploy |

### Cron job cần thêm

**1 cron job mới:** `dashboard-generate-daily`
- Schedule: `0 0 * * *` (00:00 mỗi ngày)
- Runs: `domains/dreamteam/scripts/generate-data.sh`
- Dependencies: retro files đã tồn tại (retro cron chạy 23:59)

**Backup manual:** Taisama hoặc Coach có thể chạy script bất kỳ lúc nào để force update.

---

## C. Tính năng thiếu (so với SPEC.md + UI_PROMPT.md)

### Checklist hiện tại

| Section | Có? | Ghi chú |
|---------|-----|---------|
| A. Live Scoreboard (KPI) | ✅ Mock | Cần nối data thật |
| B. Agent Performance Cards | ⚠️ Partial | Chỉ có Coach + Lebron, thiếu Bronny + Curry chính thức |
| C. Project Health Table | ✅ Mock | Cần nối project-status.sh data |
| D. Daily Retro View | ⚠️ Partial | Có UI nhưng hardcode, cần date navigation |
| E. Feedback Loop Visualization | ✅ UI | SVG node graph, cần data thật |
| F. 7-Day Trend Charts | ✅ Mock SVG | Cần data thật |
| G. Weekly Summary | ✅ Mock | Cần aggregate từ Sunday retro |
| H. Lessons Learned Feed | ⚠️ Partial | Timeline UI có, data mock |

### Tính năng thiếu — Priority

#### Must-Have (P0)
| # | Tính năng | Effort | Ghi chú |
|---|----------|--------|---------|
| 1 | **Data loader thay thế mock data** | 4h | Parse `dashboard-data.json`, thay thế `DASHBOARD_DATA` hardcode |
| 2 | **Date picker hoạt động** | 2h | `<input type="date">` → filter retro data theo ngày |
| 3 | **Project health data thật** | 1h | Read từ `dashboard-data.json` thay vì hardcode |
| 4 | **Agent cards đầy đủ** (Bronny, Curry) | 2h | Thêm 2 card chính, align layout |
| 5 | **Action items status tracking** | 2h | Đọc từ retro file, hiển thị status pills |

#### Nice-to-Have (P1)
| # | Tính năng | Effort | Ghi chú |
|---|----------|--------|---------|
| 6 | View toggle (Hôm nay / 7 ngày / Tuần) | 2h | Show/hide sections |
| 7 | Weekly summary aggregate | 3h | Parse Sunday retro, compare week-over-week |
| 8 | Lessons learned từ process memory | 2h | Parse `memory/process/dream-team.md` |
| 9 | Mobile responsive polish | 3h | Bảng scroll, card stack |
| 10 | Animated chart on load | 2h | SVG stroke-dasharray animation |

#### Later (P2)
| # | Tính năng | Effort |
|---|----------|--------|
| 11 | Dark/light mode toggle | 3h |
| 12 | Export retro PDF | 4h |
| 13 | Agent comparison mode | 5h |
| 14 | Telegram notification integration | 4h |

**Total P0 estimate: ~11h**

---

## D. Code Patch Plan

### D.1. Tạo `generate-data.sh` (NEW file)

**Path:** `domains/dreamteam/scripts/generate-data.sh`

**Input:**
- `memory/retro/daily/*.md` — tất cả retro files
- `scripts/project-status.sh` — project health
- `agents/*/AGENT.md` — agent roster
- `memory/process/dream-team.md` — lessons

**Output:** `domains/dreamteam/dashboard-data.json`

**Format JSON:** Giữ đúng structure của `DASHBOARD_DATA` object trong UI_PROMPT.md. Đây là contract giữa data layer và UI layer.

**Parse strategy:**
- Retro files: regex parse sections (Summary, Wins, Problems, Action Items, Per-Agent Notes)
- Project status: chạy script, capture JSON output
- Agent configs: extract `name`, `role` từ AGENT.md frontmatter
- Lessons: parse `memory/process/dream-team.md` cho chronological lessons

### D.2. Patch `index.html` — Data layer

**Patch 1: Thay mock data bằng fetch**
```
HIỆN TẠI: const DASHBOARD_DATA = { ... } (800+ dòng hardcode)
SỬA THÀNH: 
  let DASHBOARD_DATA = null;
  fetch('dashboard-data.json')
    .then(r => r.json())
    .then(data => { DASHBOARD_DATA = data; init(); });
```

**Patch 2: Tách render logic thành functions**
- `renderKPIs(date)` — render KPI scoreboard
- `renderAgents(date)` — render agent cards
- `renderProjects()` — render project health
- `renderRetro(date)` — render retro panel
- `renderFeedback(date)` — render feedback loops
- `renderTrends()` — render 7-day charts
- `renderWeekly()` — render weekly summary
- `renderLessons()` — render lessons feed
- `init()` — orchestrate all renders

**Patch 3: Date picker wired**
- Input date change → call all `render*(date)` functions
- Filter `DASHBOARD_DATA.retrosByDate[date]`
- Show "no data" state cho ngày không có retro

**Patch 4: Thêm Bronny + Curry agent cards**
- Copy card template từ Coach/Lebron
- Thay data tương ứng
- Adjust grid layout (2→3 columns on desktop)

**Patch 5: Project health từ data thật**
- Read `DASHBOARD_DATA.projects[]`
- Map status → color (healthy=green, active=amber, idle=red)
- Show git commits real

### D.3. Ưu tiên patch

| Thứ tự | Patch | Impact | Risk |
|--------|-------|--------|------|
| 1 | Tạo `generate-data.sh` | Cao | Thấp — script riêng |
| 2 | Patch 1 (fetch data) | Cao | TB — refactor data layer |
| 3 | Patch 2 (render functions) | Cao | TB — refactor architecture |
| 4 | Patch 3 (date picker) | TB | Thấp |
| 5 | Patch 5 (project health) | TB | Thấp |
| 6 | Patch 4 (Bronny + Curry) | TB | Thấp |

---

## E. Deployment Plan

### E.1. Deploy lên Vercel

**Setup (1 lần):**
```bash
cd domains/dreamteam
# Nếu chưa có vercel project:
npx vercel link --yes
# Set project name:
npx vercel --prod
```

**File cần deploy:**
- `index.html` — dashboard UI
- `dashboard-data.json` — generated data (auto-update)
- Không cần `scripts/` trên Vercel (chạy local)

**Vercel config (optional `vercel.json`):**
```json
{
  "headers": [
    {
      "source": "dashboard-data.json",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=300" }
      ]
    }
  ]
}
```
→ Data cache 5 phút, đủ nhanh cho daily update.

### E.2. Auto-update mechanism

**Primary flow (đã mô tả ở section B):**
1. Retro cron 23:59 → tạo retro file
2. Generate cron 00:00 → tạo dashboard-data.json
3. Git push → Vercel webhook → auto deploy

**Backup/fallback:**
- Manual: Coach chạy `bash domains/dreamteam/scripts/generate-data.sh` + git push
- Client-side: `fetch` dashboard-data.json với cache-bust `?t=${Date.now()}`

### E.3. Monitoring

**Minimal monitoring (không cần tool phức tạp):**

1. **Vercel deploy notifications** → bật Slack/Telegram webhook (nếu có)
2. **Health check:** Cron script log last generate timestamp vào `dashboard-data.json` meta field
3. **Dashboard self-check:** Nếu data cũ > 48h → hiển thị warning banner "Dữ liệu chưa cập nhật"
4. **Manual audit:** Taisama check dreamteam20.vercel.app 1-2 lần/tuần

---

## F. Implementation Roadmap

### Phase 1: Data Pipeline (Week 1)
- [ ] Tạo `generate-data.sh` script
- [ ] Test parse retro files → JSON
- [ ] Test parse project-status.sh → JSON
- [ ] Verify JSON output match UI_PROMPT.md data model
- [ ] Setup cron `dashboard-generate-daily`

### Phase 2: Dashboard Patch (Week 1-2)
- [ ] Refactor `index.html`: tách data layer, tạo render functions
- [ ] Wire `fetch('dashboard-data.json')`
- [ ] Wire date picker
- [ ] Thêm Bronny + Curry cards
- [ ] Connect project health data

### Phase 3: Deploy & Polish (Week 2)
- [ ] Deploy lên Vercel
- [ ] Verify auto-update flow
- [ ] Mobile responsive polish
- [ ] View toggle (Hôm nay/7 ngày/Tuần)

### Phase 4: Enhancements (Week 3+)
- [ ] Weekly summary aggregate
- [ ] Lessons from process memory
- [ ] Chart animations
- [ ] Dark/light toggle

---

## G. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Retro file format thay đổi → parse break | Dashboard hiển thị sai data | generate script log parse errors; fallback "no data" state |
| Cron không chạy → data cũ | Dashboard outdated | Warning banner khi data > 48h |
| JSON quá lớn (nhiều retro files) | Slow load | Chỉ giữ 7 ngày gần nhất trong JSON, archive cũ |
| Git push fail (network/auth) | Không deploy | Cron script retry 1 lần; alert nếu fail |
| Vercel deploy fail | Site down | Vercel tự retry; manual redeploy via CLI |

---

*Plan này sẽ được update sau mỗi retro nếu có insight mới.*
