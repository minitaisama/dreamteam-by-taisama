# Agent Performance Dashboard — Build Prompt

## Objective
Build a **self-updating Agent Performance Dashboard** that reflects real-time Dream Team operations, agent performance, project health, retrospective data, and inter-agent feedback loops.

Deploy target: Vercel (replace current static mock at `dreamteam20.vercel.app`)

## Data Sources (all in workspace)

### 1. Retro files
- `memory/retro/daily/YYYY-MM-DD.md` — daily retros, parsed for structured data
- `memory/retro/TEMPLATE.md` — template with known fields

### 2. Project status
- `scripts/project-status.sh` — outputs JSON with files count, newest file, recent git commits per domain
- Domains: tu-vi, xaykenhtiktok, cardmasters-ai-support, pkm-auction, Android_Auto_LLM

### 3. Agent configs & memories
- `agents/{agent-id}/AGENT.md` — role, capabilities, references
- `agents/{agent-id}/SOUL.md` — personality, operating style
- `memory/process/dream-team.md` — process memory, lessons learned
- `memory/process/coach.md`, `lebron.md`, `curry.md` — role-specific heuristics

### 4. Cron job history
- Run `openclaw cron runs <jobId>` for dreamteam-retro-daily, dreamteam-ceo-address, daily-project-status-report
- Extract: last run time, status, duration, delivery status

### 5. Sub-agent session history
- `sessions_list` with filters — active/recent sessions per agent
- Extract: task count, success rate, avg duration, token usage

## Dashboard Sections

### A. Live Scoreboard (top)
Real-time overview metrics:
- **Tasks Done Today** (from latest retro)
- **Tasks Blocked** (from latest retro)
- **Action Items Pending** (from latest retro, unresolved)
- **Active Agents** (from cron runs / session list — agents that ran today)
- **Token Usage Today** (estimated from session durations)

### B. Agent Performance Cards
One card per agent (Coach, Lebron/BE, Bronny/FE, Curry, tuvi-agent, laoshi-agent, MiniSama):

For each agent:
- **Health indicator** (green/yellow/red) — based on recent task success rate
- **Tasks completed** (7-day rolling)
- **Avg task duration** — from cron run durations
- **Current status** — last activity, what they're working on
- **Feedback received** — from retro per-agent notes
- **Lessons contributed** — count from process memory
- **Token efficiency** — tasks done per estimated tokens

### C. Project Health Overview
One row per domain:
- **Domain name** + status indicator
- **Last activity** — newest file timestamp (from project-status.sh)
- **Files count** — project size growth trend
- **Recent commits** — last 3 git commits
- **Issues/blockers** — from retro if mentioned
- **Trend** — activity level over 7 days (new files, commits, changes)

### D. Daily Retro View
Rendered from `memory/retro/daily/YYYY-MM-DD.md`:
- What Went Well / What Didn't
- Action Items table with status
- Per-agent notes
- Root cause analysis
- Trend comparison vs yesterday

Navigation: date picker to browse historical retros.

### E. Feedback & Improvement Loop
The CORE section — shows how agents improve each other:

1. **Coach → Lebron feedback** (from retro: scope issues, handoff quality)
2. **Lebron → Curry feedback** (from retro: test coverage requests, code quality signals)
3. **Curry → Coach feedback** (from retro: release recommendations, regression findings)
4. **Cross-agent lessons** (from `memory/process/dream-team.md` — promoted rules)

Visual: timeline showing feedback flow between agents, with:
- Who gave feedback to whom
- What the feedback was
- Whether it led to a rule/process change
- Rule promotion status (observed → promoted → in playbook)

### F. 7-Day Trends
Charts showing:
- **Velocity**: tasks done per day (stacked by agent)
- **Quality score**: (tasks done - issues found) / tasks done
- **Blocker rate**: blocked tasks / total tasks
- **Action item resolution**: pending vs resolved over time
- **Token burn**: estimated daily token usage

### G. Weekly Retro Summary
Auto-generated from Sunday retro (if exists):
- Week-over-week comparison table
- Top 3 wins, top 3 improvements
- Habit recommendations

### H. Lessons Learned Feed
From `memory/process/dream-team.md`:
- Chronological feed of lessons
- Tag: tooling, process, ops, communication, quality
- Status: observing → promoted (link to playbook rule)
- Impact indicator: how many times referenced

## Technical Requirements

### Architecture
- **Frontend**: Single HTML file (or small Next.js app if needed for SSR)
- **Data layer**: 
  - Option A (recommended): GitHub repo as data source — retro files + project files are already in git. Use GitHub API to fetch raw files. Auto-update via webhook on push.
  - Option B: Build script that generates `dashboard-data.json` from workspace, committed to repo, dashboard reads JSON.
  - Option C: Vercel serverless function that clones workspace data (requires access).
- **Styling**: Keep current dark theme aesthetic (purple/green/amber palette)
- **Responsive**: Mobile-friendly
- **No backend DB needed** — all data from files

### Data Pipeline
```
memory/retro/daily/*.md  ──parse──> retro data
scripts/project-status.sh ──run──> project status JSON
agents/*/AGENT.md         ──parse──> agent config
memory/process/*.md       ──parse──> lessons/feedback
cron run history          ──fetch──> execution metrics
        │
        ▼
  dashboard-data.json (generated)
        │
        ▼
  Dashboard (static HTML + JS reads JSON)
```

### Update Frequency
- Dashboard data regenerated: daily at 00:05 (after retro cron at 23:59)
- OR on git push (webhook trigger)
- Dashboard page: static, CDN-cached, revalidate on data change

### Must-Have
- Date navigation for retros (not just today)
- Agent cards with real data (not mock)
- Project health with real file timestamps
- Feedback loop visualization between agents
- Mobile responsive
- Fast load (< 2s)

### Nice-to-Have
- Dark/light mode toggle
- Export retro as PDF
- Agent comparison mode
- Slack/Telegram notification integration for action items
- Animated transitions between dates

## Existing Assets
- Current dashboard HTML: `memory/retro/site/index.html` (good UI foundation, but all mock data)
- Retro template: `memory/retro/TEMPLATE.md`
- Project status script: `scripts/project-status.sh`
- Dream Team playbook: `docs/playbooks/dream-team.md`
- Process memories: `memory/process/dream-team.md`, `coach.md`, `lebron.md`, `curry.md`

## Design Direction
Keep the current dark aesthetic but make it feel alive:
- Health dots should pulse when agent is active
- Trend charts should animate on load
- Feedback arrows between agent cards should be visual
- Use the purple (#8b5cf6) as primary, green (#22c55e) for positive, amber (#f59e0b) for warnings, red (#ef4444) for issues
- Clean, minimal, data-first — no unnecessary decoration
- Font: Inter or system-ui

## Success Criteria
1. Dashboard loads with REAL data (not mock)
2. Retro data is automatically populated from daily retro files
3. Agent performance reflects actual task completion
4. Project health shows real file activity
5. Feedback loop is visible and traceable
6. Dashboard updates automatically (no manual refresh needed)
