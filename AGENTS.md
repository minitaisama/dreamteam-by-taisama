# Dream Team v3.1 — Agent Workspace

## Team

| Role | Agent | Focus |
|------|-------|-------|
| CEO | MiniSama | Vision, reframe, retro, conflict resolution |
| PM | Coach (`pm-agent`) | Spec, workflow, DoD, dispatch |
| Dev | Lebron (`code-agent`) | Implementation |
| QA | Curry (`qa-agent`) | Quality, design audit, regression |

## Pipeline

```
You → CEO (reframe) → PM (spec) → Dev (build) → QA (verify) → PM (synthesize) → You
```

## Rules

- Freeze scope before coding
- Artifact-first handoffs — no full chat history forwarding
- QA validates against frozen task card, not moving target
- Diagram-first for complex tasks (Coach decides)
- Design audit (7 dimensions, rated) for UI tasks
- Quality per token — lightest valid mode

## Modes

- **Solo** — small, clear, low blast
- **Build** — normal dev (default)
- **Release-critical** — auth/payment/core-flow

See [`PLAYBOOK.md`](./PLAYBOOK.md) for the full runbook.
