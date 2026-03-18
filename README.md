# Dream Team v3.1

> A 4-agent software factory: CEO rethinks the product, PM locks the spec, Dev builds it, QA ships it. Multi-agent parallel execution, not single-session slash commands.

---

## The idea

Most AI coding setups are a single session with a single model trying to be everything — PM, architect, developer, QA, and release engineer all at once.

Dream Team is different. It's **four specialized agents**, each running independently, coordinated through a structured pipeline:

```
You → CEO (reframe) → PM (spec) → Dev (build) → QA (verify) → PM (synthesize) → You
```

Each agent has one job. They communicate through artifacts (task cards, QA reports, diagrams), not through forwarding chat history. The result: **parallel execution with less token burn and clearer accountability**.

Inspired by [gstack](https://github.com/garrytan/gstack) — we borrowed the "structured roles + review gates" philosophy, then built on top of multi-agent orchestration instead of single-session slash commands.

---

## The team

| Role | Agent | What they do |
|------|-------|-------------|
| **CEO** | MiniSama | Rethink the problem. Find the 10-star product hiding in the request. 4 scope modes: Expansion, Selective, Hold, Reduction. |
| **PM** | Coach | Lock the spec. Freeze a tiny task card. Dispatch work. Own scope, DoD, and handoff quality. |
| **Dev** | Lebron | Build it. Diagram-first for complex tasks. Stay strictly inside scope. YAGNI. |
| **QA** | Curry | Verify it. Test against the frozen contract, not a moving target. Design audit for UI. Severity-rated issues. |

---

## See it work

```
You:      "Thêm nút thanh toán"
CEO:      "Thanh toán là ticket. Job thật là 'cho user hoàn thành mua hàng'.
           Options: a) chỉ nút, b) full checkout, c) one-click + saved cards.
           Selective expansion — recommend c, defer saved cards phase 2."
You:      "b, keep scope tight"
PM:       → Freeze task card
            Task: Payment checkout flow
            Scope: Cart → Payment → Confirmation
            Non-goals: Saved cards, payment methods settings
            Acceptance: User completes purchase, order created, email sent
            Design: loading/error/success states, mobile responsive

Dev:      → Diagram before code:
            ┌──────┐    ┌─────────┐    ┌────────────┐    ┌───────────┐
            │ Cart │───▶│ Payment │───▶│ Process    │───▶│ Confirm   │
            │      │    │ Form    │    │ (async)    │    │ + Email   │
            └──────┘    └─────────┘    └────────────┘    └───────────┘
            Failure: payment fails → retry modal, not dead end
            
          → Implement (3 files, 2 tests)

QA:       → Standard QA: contract tests pass ✓
          → Design audit:
            Info Architecture: 8/10 ✓
            Interaction States: 7/10 ✓ (loading/empty/error/success covered)
            AI Slop Risk: 8/10 ✓ (no gradient hero, intentional design)
            Responsive: 7/10 ✓
            Overall: 7.5/10 — PASS

PM:       → Synthesize: "Checkout flow shipped. 3 files, 2 tests, design score 7.5.
           No blockers. Ready for staging deploy."
```

One feature. Four agents. Each with the right cognitive mode. That's the difference between an assistant and a team.

---

## Core principles

**Reframe, don't implement literally.** The CEO step catches the gap between what you ask for and what you actually need. "Photo upload" isn't the feature — "helping sellers create listings that sell" is.

**Freeze before coding.** The PM writes a tiny task card with scope, non-goals, acceptance criteria, and DoD. Scope doesn't change after freeze.

**Diagram-first for complexity.** When a task involves async flows, state machines, or multi-component architecture — draw the diagram before writing code. Diagrams expose hidden assumptions that text hides.

**Test against a fixed contract.** QA validates against the frozen task card, not the code as it currently exists. Moving-target QA is the #1 quality killer.

**Design audit before slop ships.** Every UI task gets a 7-dimension design audit: information architecture, interaction states, user journey, AI slop risk, design system, responsive, and unresolved decisions. Rated 0-10.

**Artifact-first handoffs.** Agents communicate through task cards, QA reports, and diagrams — not by forwarding 50 messages of chat history. Less token burn, clearer contracts.

**Quality per token.** The lightest mode that preserves quality. Solo for small tasks. Build for normal work. Release-critical only for auth/payment/core-flow.

---

## Operating modes

| Mode | When | CEO | Diagram | Design audit | QA gate |
|------|------|-----|---------|--------------|---------|
| **Solo** | <30 min, clear scope, low risk | Skip | No | No | Optional |
| **Build** | Normal dev task | Yes | If PM requires | If UI | Yes |
| **Release-critical** | Auth, payment, core flow | Yes | PM requires | If UI | `ship` / `ship_with_risk` / `hold` |

---

## Retro dashboard

Every Sunday at 20:00, all three agents submit structured retrospectives. The CEO aggregates them with commentary, trends, and action items.

📊 **Live dashboard:** [dreamteam20.vercel.app](https://dreamteam20.vercel.app)

Tracks: velocity, quality scores, blockers, action items — all visualized with charts over time.

---

## Anti-patterns we avoid

| Pattern | Symptom | Fix |
|---------|---------|-----|
| Literal ticket taking | Implement exactly what was asked, not what was needed | CEO reframe |
| Moving target QA | Testing against code that keeps changing | Frozen task card contract |
| Gold-plating | Adding features not in scope | Scope freeze + QA adherence check |
| AI slop UI | Generic gradients, icon grids, uniform SaaS look | Design audit dimension 4 |
| Premature optimization | Caching/refactoring "just in case" | YAGNI |
| History forwarding | Sending full chat history between agents | Artifact-first handoffs |

---

## Architecture

```
agents/
├── pm-agent/          # Coach — PM/orchestration
├── code-agent/        # Lebron — implementation
└── qa-agent/          # Curry — QA/validation
data/
└── weeks/             # Retro data (JSON)
index.html             # Retro dashboard
```

### Key files

| File | What it covers |
|------|---------------|
| [`PLAYBOOK.md`](./PLAYBOOK.md) | Full runbook: roles, task cards, handoffs, design audit, retro |
| [`dream_team_v2.md`](./dream_team_v2.md) | v2 runbook (archived) |
| [`dream_team_v2_examples.md`](./dream_team_v2_examples.md) | v2 examples (archived) |
| [`handoff_contracts.md`](./handoff_contracts.md) | Handoff format reference |

---

## What's different from gstack

| | gstack | Dream Team |
|--|--------|------------|
| Runtime | Single Claude Code session | 4 independent agents |
| Execution | Sequential slash commands | Parallel multi-agent |
| Orchestration | Manual (you run each command) | Automated pipeline |
| Design review | `/plan-design-review` + `/design-review` | Built into Curry's QA flow |
| Retro | `/retro` on demand | Weekly automated + dashboard |
| Scope | Claude Code only | Any agent runtime (Codex, Claude, etc.) |
| Review gates | Formal dashboard (Eng/CEO/Design) | Lightweight (Curry gate for release-critical) |

We're not competing with gstack. We learned from it: the "structured roles + review gates" philosophy is sound. We just run it across multiple agents instead of one.

---

## License

MIT. Use it, fork it, make it yours.
