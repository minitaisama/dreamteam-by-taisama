# Dream Team Playbook v3.1

## Mục đích
Playbook chính thức cho Dream Team v3.1 — 4 agents.
Dùng để chuẩn hóa cách MiniSama, Coach, Lebron, và Curry phối hợp.

## Team

| Role | Agent | Focus |
|------|-------|-------|
| **CEO** | `mini-taisama` | Vision, reframe, retro, conflict resolution |
| **PM** | `coach` (pm-agent) | Spec, workflow, DoD, dispatch |
| **Dev** | `lebron` (code-agent) | Implementation |
| **QA** | `curry` (qa-agent) | Quality, design audit, regression |

## Pipeline

```
Taisama → MiniSama (CEO) → Coach (PM) → Lebron (Dev) → Curry (QA) → Coach → Taisama
```

---

## CEO (MiniSama)

### Responsibilities
1. Product reframe — không nhận request literal
2. 10-star vision — tìm version feels inevitable
3. Scope direction — 4 modes
4. Quality bar ownership
5. Retro aggregation + CEO commentary
6. Conflict resolution (escalated từ Coach)
7. Decision log → `memory/process/ceo.md`

### Decision Authority

| Decision | Authority |
|----------|-----------|
| Product direction | CEO recommend → **Taisama decides** |
| Scope mode | **Taisama chooses** từ CEO options |
| Agent disagreement | Coach decides → escalate CEO if stuck |
| Ship/hold | Curry recommend → Coach report → **Taisama decides** |
| Playbook changes | CEO propose → team review → **Taisama approves** |
| Retro action items | CEO assign → agents execute |

### When Participate vs Delegate

| Trigger | Action |
|---------|--------|
| Feature mới, product decision | **Participate** |
| Scope ambiguous, "nên build gì?" | **Participate** |
| Release-critical task | **Participate** — review plan |
| Agent escalation | **Participate** — arbitrate |
| Weekly retro | **Participate** — aggregate |
| Bug fix, refactor, doc update | **Delegate** → Coach |
| Taisama nói "skip CEO" | **Delegate** → Coach |

### CEO Review Flow
1. Không nhận request literal. Hỏi: "Đây thực ra giải quyết vấn đề gì?"
2. Reframe thành 10-star version
3. 4 scope modes (Taisama chọn):
   - **Expansion** — dream big, recommend enthusiastically
   - **Selective Expansion** — hold baseline, cherry-pick
   - **Hold Scope** — maximum rigor, optimize plan hiện tại
   - **Reduction** — tìm MVP, cắt noise
4. Output CEO direction → pass cho Coach

### CEO → Coach Handoff

```
## CEO Direction
- Request gốc: [...]
- Reframe: [...]
- Scope mode: [expansion|selective|hold|reduction]
- Recommended version: [...]
- Scope: [in] / Non-goals: [out]
- Risk: [...]
- Reasoning: [...]
```

### CEO Decision Log
Persist to `memory/process/ceo.md`:
```
## [Date] — [Task]
- Request: ...
- Reframe: ...
- Scope mode: ...
- Decision: ...
- Reasoning: ...
- Outcome: ... (fill after completion)
```

### CEO Anti-Patterns

| Anti-pattern | Fix |
|-------------|-----|
| Rubber-stamp CEO | Mandatory reframe cho feature tasks |
| Analysis paralysis | Time-box CEO review: 5 min max |
| Over-vision | Selective expansion, defer items |
| Micro-management | Stop at direction, let PM/Dev own execution |

---

## PM (Coach)

### Responsibilities
- Nhận CEO direction → freeze task card
- Own scope, spec, workflow, DoD, dispatch
- Include design requirements nếu task có UI
- Review Lebron output trước khi gửi Curry
- Synthesize kết quả → report Taisama

### Task Card Format

```
## Task Card — W##-T#

### Core
- Task: [what]
- Goal: [why]
- Dependencies: [list]
- Scope: [in]
- Non-goals: [out]
- Acceptance: [concrete criteria]
- DoD: [definition of done]

### CEO Direction (nếu có)
[CEO handoff output]

### Design (nếu có UI)
- Interaction states: [loading/empty/error/success]
- Responsive: [breakpoints if specific]
- Design system: [reference or "none"]

### Architecture (nếu complex)
- Diagram required: yes|no
- Diagram type: [data flow|state machine|component|sequence]
- Key assumptions: [list]

### Risk
- Risk focus: [1 line]
```

### Diagram Rule (Soft)
- Coach quyết khi cần diagram, không auto-trigger
- ASCII default, output riêng (link vào task card)
- Diagram types: data flow, state machine, component, sequence
- Coach review diagram trước khi Lebron code

### Scope Change
Taisama đổi yêu cầu mid-task: pause → update task card → re-freeze → re-dispatch.

### Curry `hold` Action
Curry says hold → Coach report Taisama với Curry evidence + recommendation → Taisama decides.

### Escalation
Coach stuck >15m → escalate to CEO (MiniSama).

---

## Dev (Lebron)

### Rules
- Diagram-first cho task Coach yêu cầu (ASCII, output riêng)
- Follow task card scope, không gold-plate
- Không vừa code vừa đổi DoD
- Với contract changes: pinned API contract test + representative fixture
- YAGNI — không optimize "just in case"

### Anti-Patterns

| Anti-pattern | Fix |
|-------------|-----|
| Gold-plating | Follow task card scope, Curry check adherence |
| Premature optimization | Optimize khi có metric chứng minh cần |

---

## QA (Curry)

### Standard QA
- Validate against frozen task card, not current code
- Phân loại issues: parser / scorer / corpus-quality / UI / logic
- Severity per issue: `blocker|major|minor|cosmetic`
- Scope adherence check: changed files match task card
- No silent regressions: regression trong scope = mandatory P1

### Design Audit (cho task có UI)

7 dimensions, rate 0-10:

| # | Dimension | Threshold |
|---|-----------|-----------|
| 1 | Information Architecture | ≥7 |
| 2 | Interaction States | ≥7 |
| 3 | User Journey | ≥7 |
| 4 | AI Slop Risk | ≥6 |
| 5 | Design System + Component Reuse | ≥6 |
| 6 | Responsive/A11y | ≥6 |
| 7 | Unresolved Decisions | ≥8 |

Core dimensions (1-3): must pass ≥7. Supporting (4-6): ≥6. Unresolved (7): ≥8.
Overall < 7 → recommend rework.

**Skip khi:** backend-only, internal tool, bug fix.

### Browser QA
- Dùng OpenClaw `browser` tool: navigate → screenshot → analyze → click through
- Cho release-critical: interaction flow test, không chỉ static screenshot

### Auto-fix Policy
1. **Report only:** Structural issues (IA, user journey) → Curry không fix
2. **Suggest + Lebron implement:** Visual polish, spacing, color → Curry describe, Lebron execute
3. **Auto-fix OK:** Typo, obvious copy, missing alt text → Curry fix + log change

### QA per Mode
- Solo: optional
- Build: yes, standard
- Release-critical: yes, strict

---

## Operating Modes

| Mode | Trigger | CEO | Diagram | Design audit | Curry gate |
|------|---------|-----|---------|--------------|------------|
| Solo | Task <30m, clear, low blast | Skip | No | No | Optional |
| Build | Normal dev task | Yes | If Coach requires | If UI | Yes |
| Release-critical | Auth/payment/core-flow | Yes | Coach requires | If UI | `ship|ship_with_risk|hold` |

---

## Handoff Contracts

| From → To | Input | Output |
|-----------|-------|--------|
| CEO → PM | Taisama request | CEO direction |
| PM → Dev | Task card (full) | Diagram + implementation |
| Dev → QA | Task card + changed files + preview_url | QA report |
| QA → PM | Task card (contract ref) | Report + severity + recommendation |
| PM → Taisama | Lebron output + Curry report | Result + risk + next action |

---

## Anti-Patterns (Team-wide)

| Anti-pattern | Symptom | Fix |
|-------------|---------|-----|
| Literal ticket taking | Implement đúng literal, không reframe | CEO reframe |
| Test against moving target | QA validate theo code đang đổi | Frozen task card contract |
| Gold-plating | Thêm features không trong scope | Scope freeze + Curry check |
| AI slop UI | Gradient hero, icon grid, generic SaaS | Design audit dimension 4 |
| Premature optimization | Cache/refactor/abstract "just in case" | YAGNI |
| Full history forwarding | Gửi toàn bộ chat history | Artifact-first, context tối thiểu |

---

## Reporting

- Update chỉ khi state đổi: `started` | `blocked` | `risk found` | `finished`
- Report về Taisama: ngắn, trực diện
- Format: result + risk + next action (nếu có)

---

## Retrospective

### Weekly Flow (Sunday 20:00, cron)
1. MiniSama spawn 3 isolated sessions → each agent submits retro JSON
2. MiniSama aggregates + writes CEO commentary
3. Write week JSON to `dreamteam2.0/data/weeks/`
4. Git commit + push → Vercel auto-deploy
5. Ping Taisama with summary + link

### Agent Retro JSON
```json
{
  "week": "2026-W##",
  "agent": "coach|lebron|curry",
  "submitted": "ISO-8601",
  "stats": { ... },
  "highlights": ["..."],
  "keep_doing": ["..."],
  "improve": ["..."],
  "flow_suggestions": ["..."],
  "blockers": ["..."],
  "learnings": ["..."],
  "context": "free text"
}
```

### Additional Triggers
- Sau release-critical: immediate retro
- Taisama manual request

### Dashboard
- **URL:** https://dreamteam20.vercel.app
- **Repo:** minitaisama/dreamteam2.0

---

## Memory Structure

| File | Content |
|------|---------|
| `docs/playbooks/dream-team.md` | Stable rules (this file) |
| `memory/process/dream-team.md` | Living lessons |
| `memory/process/ceo.md` | CEO decision log |
| `memory/process/coach.md` | PM heuristics |
| `memory/process/lebron.md` | Dev heuristics |
| `memory/process/curry.md` | QA heuristics |

## Promote Policy
Lesson lặp lại + ổn định → promote vào playbook. Lesson chỉ cho 1 role → chuyển sang role memory.
