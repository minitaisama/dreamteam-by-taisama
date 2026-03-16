# DreamTeam 2.0

```text
User ask
   |
   v
 Coach
(scope / task card / gate)
   |
   +--------> Solo ------------------------------+
   |                                             |
   v                                             v
 Lebron ----------------------------------> final update
(build / verify)                                ^
   |                                            |
   v                                            |
 Curry (when needed) ---------------------------+
(QA / risk / ship-hold)
```

A lightweight operating model for AI-assisted software work.

---

## Inspiration & profile

DreamTeam 2.0 is inspired by one primary open-source direction:

### Garry Tan / gstack
- Repo: <https://github.com/garrytan/gstack>
- Why it matters: strong workflow abstraction, explicit modes, builder-facing orchestration

DreamTeam 2.0 does **not** copy gstack directly.
It takes the workflow clarity and operating-mode thinking, then compresses them into a lighter, more Codex-friendly runbook with stronger token discipline.

---

## What DreamTeam 2.0 is

DreamTeam 2.0 is a small runbook for running software work with AI agents without turning every task into process theater.

It is optimized for:
- **Codex-first execution**
- **lightweight handoffs**
- **clear role ownership**
- **quality per token**

Core roles:
- **Coach** (`pm-agent`) — scope, task framing, release gate
- **Lebron** (`code-agent`) — implementation and local execution
- **Curry** (`qa-agent`) — independent validation and release confidence

Default modes:
- **Solo**
- **Build**
- **Release-critical**

---

## Why “2.0”

The earlier internal framing was **Dream Team**.

**DreamTeam 2.0** means the public refined version:
- lighter
- more Codex-friendly
- stricter about QA gates
- more explicit about token efficiency

In short:
- **Dream Team** = original concept
- **DreamTeam 2.0** = refined public runbook

---

## Core principles

- freeze scope before coding
- use tiny task cards
- keep handoffs brutally short
- validate a fixed contract, not an evolving target
- use the lightest mode that still preserves quality
- optimize for **quality per token**

---

## Repo map

- [`dream_team_v2.md`](./dream_team_v2.md) — main runbook
- [`dream_team_v2_examples.md`](./dream_team_v2_examples.md) — practical examples
- [`handoff_contracts.md`](./handoff_contracts.md) — compact handoff formats

---

## Layer 4 token lookback (Tu Vi project)

One practical reason this repo exists is the earlier **Tu Vi Layer 4** work.
That project exposed how expensive the old Dream Team style could become once scope drift, repeated analysis, and long-thread context replay started stacking.

### Log-anchored observations from the old style

A few concrete archived anchors around the Layer 4 / immediate follow-up work:
- **Coach / PM anchors:** ~`46.5k` for one PM/backend review task, plus multiple PM micro-spec / review turns in the `~10k–15k` range, and several old-style long PM turns that could swell into the `~167k–205k` range when context kept accumulating.
- **Lebron / execution anchors:** `27.8k`, `10.6k`, and `12.1k` for clean-repo / execution / closure-style coding checks around the same period.
- **Curry / QA anchors:** one archived QA-heavy follow-up thread alone shows turns around `51.1k`, `65.5k`, `66.4k`, `66.5k`, `67.0k`, `88.0k`, `88.3k`, and `89.4k` tokens — a good example of how old QA behavior could become extremely expensive when validation drifted into repeated diagnosis.

These logs are not a perfect one-thread-to-one-thread role ledger, but they are strong enough to explain the economic direction change.

### Practical planning estimate

| Model | Coach | Lebron | Curry | Total | Delta vs Dream Team 1.0 |
|---|---:|---:|---:|---:|---:|
| **Dream Team 1.0** | ~220k–300k | ~60k–90k | ~300k–370k | **~580k–760k** | baseline |
| **DreamTeam 2.0 + gstack** | ~60k–90k | ~120k–180k | ~40k–70k | **~220k–340k** | **~55%–70% lower** |

### Why the new model is cheaper

With the old style:
- Coach often kept reframing while execution was already in motion
- Lebron sometimes inherited too much context
- Curry could drift from scoped validation into repeated diagnosis

With **DreamTeam 2.0 + gstack**:
- Coach freezes a tiny task card earlier
- Lebron gets bounded work instead of a giant evolving brief
- Curry validates the changed surface against a fixed contract
- handoffs stay short and phase-based

### Practical takeaway

For Layer 4-style work, the safest planning assumption is:
- **Dream Team 1.0:** ~`580k–760k`
- **DreamTeam 2.0 + gstack:** ~`220k–340k`

That means a realistic midpoint improvement of roughly:
- `~650k` → `~280k`
- about **`~57%` token reduction**

---

## English

DreamTeam 2.0 is a lightweight stage-based runbook where Coach freezes the problem, Lebron executes bounded work fast, Curry validates with evidence when needed, and every handoff stays small to minimize token burn.

## Tiếng Việt

DreamTeam 2.0 là một runbook stage-based gọn nhẹ: Coach chốt bài toán trước, Lebron execute bounded work nhanh, Curry validate bằng evidence khi cần, và mọi handoff đều được giữ rất nhỏ để giảm token burn.

## 中文

DreamTeam 2.0 是一个轻量级、stage-based 的 runbook：Coach 先冻结问题，Lebron 快速执行有边界的工作，Curry 在需要时基于证据做验证，而所有 handoff 都尽量保持很小，以降低 token burn。
